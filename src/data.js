// 数据层：构建期收集 snippets/**/*.md，解析分类 / 文件 / 内容结构

import rawFiles from 'virtual:snippets' // [{ category, name, text }]

// 提取名称开头的数字前缀，用于严格排序；同时给出去掉前缀的显示标题
function splitNumPrefix(name) {
  const m = /^(\d+)\s*(.*)$/.exec(name)
  if (m) return { num: parseInt(m[1], 10), title: m[2] }
  return { num: Number.MAX_SAFE_INTEGER, title: name }
}

// 解析 md：# Desc 描述段 + # btnN (标签) 后的 fenced code block
function parseDoc(text) {
  const doc = { desc: '', tabs: [] }

  // 描述：# Desc 之后到下一个 "# btn" 或文件结尾
  // 注意不能用 m 标志：m 会让 $ 匹配每行行尾，导致描述只截取第一行
  const descMatch = /^# Desc[ \t]*\r?\n([\s\S]*?)(?=\r?\n#\s+btn|$)/.exec(text)
  if (descMatch) doc.desc = descMatch[1].trim()

  // 每个 "# btnN (label)" 后找紧随的 ``` 代码块
  const btnRe = /^# btn(\d+)(?:\s*\(([^)]*)\))?\s*$/gm
  let m
  while ((m = btnRe.exec(text))) {
    const idx = parseInt(m[1], 10)
    const label = (m[2] || '').trim() || `方案${idx}`
    // 从标记行之后找第一个代码块
    const rest = text.slice(btnRe.lastIndex)
    const code = /```[^\n]*\r?\n([\s\S]*?)```/.exec(rest)
    if (code) {
      const tab = doc.tabs.find(t => t.idx === idx)
      if (tab) tab.code = code[1].trim() // 同一 idx 出现两次时后者覆盖
      else doc.tabs.push({ idx, label, code: code[1].trim() })
    }
  }
  doc.tabs.sort((a, b) => a.idx - b.idx)
  return doc
}

// 分类：{ name, num, title, files: [...] }
// 文件：{ category, name, num, title, doc }
export const categories = (() => {
  const map = new Map()
  for (const { category: catName, name: fileName, text } of rawFiles) {
    const cat = splitNumPrefix(catName)
    const file = splitNumPrefix(fileName)
    if (!map.has(catName)) {
      map.set(catName, { name: catName, num: cat.num, title: cat.title, files: [] })
    }
    map.get(catName).files.push({
      category: catName,
      name: fileName,
      // 收藏/导出用标识：分类前缀-文件前缀（如 5-1），主页徽章即这两个数字
      id: `${cat.num}-${file.num}`,
      num: file.num,
      title: file.title,
      doc: parseDoc(text),
    })
  }
  const cats = [...map.values()]
  for (const c of cats) c.files.sort((a, b) => a.num - b.num)
  cats.sort((a, b) => a.num - b.num)
  return cats
})()

export const allFiles = categories.flatMap(c => c.files)

export function getCategory(name) {
  return categories.find(c => c.name === name) || null
}
