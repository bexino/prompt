// 收藏：localStorage 存取 + CSV 导入/导出
// 收藏项用 id（`${分类前缀}-${文件前缀}`，如 5-1）标识，按加入顺序保存。

import { allFiles } from './data.js'

const KEY = 'prompt-favs'

export function getFavs() {
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.filter(v => typeof v === 'string') : []
  } catch { return [] }
}

export function setFavs(ids) {
  try { localStorage.setItem(KEY, JSON.stringify(ids)) } catch { /* 隐私模式等，忽略 */ }
}

export function isFav(id) {
  return getFavs().includes(id)
}

// 返回 true = 收藏，false = 取消收藏
export function toggleFav(id) {
  const favs = getFavs()
  const i = favs.indexOf(id)
  if (i >= 0) favs.splice(i, 1)
  else favs.push(id)
  setFavs(favs)
  return i < 0
}

export function clearFavs() {
  setFavs([])
}

// 收藏 id → 文件对象（按收藏顺序，去重、过滤已不存在的 id）
export function favFiles() {
  const byId = new Map(allFiles.map(f => [f.id, f]))
  const seen = new Set()
  return getFavs()
    .filter(id => !seen.has(id) && seen.add(id) && byId.has(id))
    .map(id => byId.get(id))
}

// 导出：每行一个 id；文件名 FavBak_<unix秒>.csv
export function exportCsv() {
  const favs = getFavs()
  if (!favs.length) { Smartisan.toast('暂无收藏'); return }
  const blob = new Blob([favs.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `FavBak_${Math.floor(Date.now() / 1000)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// 导入：与现有收藏合并去重，返回 { added, skipped }
export function importCsv(text) {
  const ids = String(text).split(/[\s,]+/).filter(Boolean)
  const valid = new Set(allFiles.map(f => f.id))
  const favs = getFavs()
  let added = 0
  for (const id of ids) {
    if (valid.has(id) && !favs.includes(id)) { favs.push(id); added++ }
  }
  setFavs(favs)
  return { added, skipped: ids.length - added }
}
