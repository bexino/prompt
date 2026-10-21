// 构建产物冒烟检查。CI 里在 npm run build 之后跑，本地也能跑：
//   npm run build && npm run verify
//
// 目的：在部署前拦住几类"构建成功但页面是空的"的事故：
//   1. snippets 没被读进来（虚拟模块 / 路径 / 文件名特殊字符问题）
//   2. index.html 丢了内联图标 sprite
//   3. 产物里残留绝对路径（base 配置被改坏，部署到子路径下会 404）

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 用 fileURLToPath 而非 import.meta.dirname：后者要 Node 20.11+，
// 这样脚本在更老的 Node 上也能跑。
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

const fail = []
const ok = []
const check = (cond, msg) => (cond ? ok : fail).push(msg)

// --- 1. 产物存在 ---
const indexHtml = path.join(dist, 'index.html')
check(fs.existsSync(indexHtml), 'dist/index.html 存在')
if (!fs.existsSync(indexHtml)) {
  report()
}

const html = fs.readFileSync(indexHtml, 'utf8')
const assetsDir = path.join(dist, 'assets')
const jsFiles = fs.existsSync(assetsDir)
  ? fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'))
  : []
const bundle = jsFiles.map(f => fs.readFileSync(path.join(assetsDir, f), 'utf8')).join('\n')

check(jsFiles.length > 0, `dist/assets 下有 JS 产物（${jsFiles.length} 个）`)

// --- 2. snippets 数据真的被打进包里 ---
// data.js 的数据来自 virtual:snippets，是 JSON.stringify 进 bundle 的，
// 所以分类名会以字面量出现。取几个稳定的分类做探针。
const SNIPPET_DIRS = fs
  .readdirSync(path.join(root, 'snippets'), { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)

check(SNIPPET_DIRS.length > 0, `snippets/ 下有分类目录（${SNIPPET_DIRS.length} 个）`)

// 分类目录名带数字前缀（如 1图片），UI 显示时会剥掉前缀，
// 所以这里用剥掉前缀后的标题去 bundle 里找。
for (const dir of SNIPPET_DIRS) {
  const title = dir.replace(/^\d+/, '')
  if (title) check(bundle.includes(title), `snippets 分类「${title}」已打包进产物`)
}

// --- 3. index.html 结构完好 ---
check(html.includes('<symbol'), 'index.html 保留了内联图标 sprite（<symbol>）')
check(html.includes('xmlns="http://www.w3.org/2000/svg"'), 'index.html 的 sprite 外层 svg 还在')
check(!/src="\/src\//.test(html), 'index.html 没有残留 /src/ 绝对路径引用')

// --- 4. base 是相对路径，部署到任何子目录都不会 404 ---
const assetRefs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => m[1])
const absoluteLocal = assetRefs.filter(u => u.startsWith('/') && !u.startsWith('//'))
check(
  absoluteLocal.length === 0,
  `产物资源均为相对路径${absoluteLocal.length ? `（发现绝对路径：${absoluteLocal.join(', ')}）` : ''}`
)

// --- 5. 字体自托管：产物里不能出现网络字体引用，woff2 必须真的打进去 ---
const cssFiles = fs.existsSync(assetsDir)
  ? fs.readdirSync(assetsDir).filter(f => f.endsWith('.css'))
  : []
const css = cssFiles.map(f => fs.readFileSync(path.join(assetsDir, f), 'utf8')).join('\n')
const networkFonts = [...css.matchAll(/url\((https?:)?\/\/[^)]*\)/g)].map(m => m[0])
check(
  networkFonts.length === 0,
  `产物 CSS 没有外链字体/资源${networkFonts.length ? `（发现：${networkFonts.join(', ')}）` : ''}`
)
check(!/fonts\.(googleapis|gstatic)\.com/.test(html), 'index.html 没有引用 Google Fonts')

for (const family of ['Geist', 'Geist Mono']) {
  // 构建后会去掉引号（font-family:Geist），所以两种写法都认
  const decl = new RegExp(`font-family:\\s*['"]?${family}['"]?[;\\s]`).test(css)
  check(decl, `@font-face 声明了 ${family}`)
  const latin = new RegExp(`font-family:\\s*['"]?${family}['"]?[^}]*url\\(([^)]*woff2)\\)`).exec(css)
  check(!!latin, `${family} 引用了本地 woff2`)
  if (latin) {
    const file = latin[1].replace(/^\.?\//, '')
    check(
      fs.existsSync(path.join(assetsDir, file)),
      `${family} 的 woff2 已产出：assets/${file}`
    )
  }
}
check(/var\(--s-font\)/.test(css), 'CSS 里仍在使用 --s-font 字体变量')

for (const u of assetRefs.filter(u => /^\.\/assets\//.test(u))) {
  const rel = u.replace(/^\.\//, '')
  check(fs.existsSync(path.join(dist, rel)), `引用的资源存在：${u}`)
}

report()

function report() {
  for (const m of ok) console.log(`  ✓ ${m}`)
  for (const m of fail) console.error(`  ✗ ${m}`)
  if (fail.length) {
    console.error(`\n构建产物校验失败：${fail.length} 项未通过`)
    process.exit(1)
  }
  console.log(`\n构建产物校验通过：${ok.length} 项`)
}
