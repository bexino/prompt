// URL 参数解析：除标准 ?query 外，兼容地址栏手输时把 key=value 直接敲进路径的写法
// （如 localhost:5174/hide=theme#/ —— 少打了 ?）。只认 theme / hide 两个键，
// 其余路径段原样保留，不影响部署在子目录下的场景。
// initUrl() 在启动时把路径里的参数规范化回 ?query（replaceState，不触发导航）。

const SEG_RE = /^(theme|hide)=(.*)$/

function decode(s) {
  try { return decodeURIComponent(s) } catch { return s }
}

// 取参数值：标准 query 优先，其次路径段 key=value
export function urlParam(name) {
  const q = new URLSearchParams(location.search).get(name)
  if (q !== null) return q
  for (const seg of location.pathname.split('/')) {
    const m = SEG_RE.exec(decode(seg))
    if (m && m[1] === name) return m[2]
  }
  return null
}

// 启动时规范化：把路径段里的 theme=x / hide=x 移进 ?query，地址栏变成可分享的标准形式
export function initUrl() {
  const url = new URL(location.href)
  const kept = []
  const found = []
  for (const seg of url.pathname.split('/')) {
    const m = SEG_RE.exec(decode(seg))
    if (m) found.push(m)
    else kept.push(seg)
  }
  if (!found.length) return
  const p = new URLSearchParams(url.search)
  for (const [, k, v] of found) if (!p.has(k)) p.set(k, v)
  let path = kept.join('/')
  if (!path.endsWith('/')) path += '/'
  url.pathname = path
  url.search = p.toString()
  history.replaceState(null, '', url)
}
