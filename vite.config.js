import { defineConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

// 从磁盘读取 snippets/**/*.md，生成虚拟模块 virtual:snippets。
// 不走 md 模块解析，文件名含 # 等特殊字符也没问题。
function snippetsPlugin() {
  const read = () => {
    const dir = path.resolve(__dirname, 'snippets')
    const files = []
    const walk = (d, cat) => {
      for (const name of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, name.name)
        if (name.isDirectory()) walk(p, cat ? `${cat}/${name.name}` : name.name)
        else if (name.isFile() && name.name.toLowerCase().endsWith('.md'))
          files.push({ category: cat, name: name.name.replace(/\.md$/i, ''), text: fs.readFileSync(p, 'utf8') })
      }
    }
    walk(dir, '')
    return files
  }
  const vname = 'virtual:snippets'
  return {
    name: 'snippets-loader',
    resolveId(id) { if (id === vname) return '\0' + vname },
    load(id) {
      if (id !== '\0' + vname) return
      return `export default ${JSON.stringify(read())}`
    },
    handleHotUpdate(ctx) {
      if (ctx.file.includes('snippets') && ctx.file.endsWith('.md')) {
        ctx.server.ws.send({ type: 'full-reload' })
      }
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [snippetsPlugin()],
})
