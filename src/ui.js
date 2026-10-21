// UI 层：Dialog、Toast、搜索浮层
import './smartisan.js' // Smartisan.toast / overlay 行为
import { marked } from 'marked'
import { isFav, toggleFav } from './fav.js'

const icon = (id, cls = 's-icon') =>
  `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`

/* ---------------- Dialog ---------------- */

let dlgEl = null
let tabsState = []

function buildDialog(file) {
  const doc = file.doc
  const hasDesc = !!doc.desc
  const multi = doc.tabs.length > 1
  const faved = isFav(file.id)

  const descHtml = hasDesc
    ? `<div class="s-dialog__desc">${renderMd(doc.desc)}</div>` : ''
  const tabsHtml = multi
    ? `<div class="s-dialog__tabs-wrap"><div class="s-tabs" role="tablist">${
        doc.tabs.map((t, i) =>
          `<button type="button" role="tab" aria-selected="${i === 0}">${esc(t.label)}</button>`
        ).join('')}</div></div>` : ''
  const fieldHtml = `
      <div class="s-prompt-field">
        <div class="s-copy-anchor"><button type="button" class="s-copy-btn" aria-label="复制"><svg class="s-copy-btn__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg><span>复制</span></button></div>
        <textarea class="s-prompt-area" readonly spellcheck="false"></textarea>
      </div>`

  return `
    <div class="s-dialog s-dialog--prompt" role="dialog" aria-modal="true">
      <div class="s-dialog__header">${esc(file.title)}</div>
      <div class="s-dialog__scroll">
        ${descHtml}${tabsHtml}${fieldHtml}
      </div>
      <div class="s-dialog__actions">
        <button type="button" data-fav-toggle>${faved ? '已收藏' : '收藏'}</button>
        <button type="button" data-s-close>关闭</button>
      </div>
    </div>`
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// 简介按 markdown 渲染；表格包一层以便横向滚动
function renderMd(text) {
  const html = marked.parse(text, { async: false, breaks: true })
  return html.replace(/<table>/g, '<div class="md-table-wrap"><table>').replace(/<\/table>/g, '</table></div>')
}

function setTab(i) {
  const area = dlgEl.querySelector('.s-prompt-area')
  area.value = tabsState[i]?.code || ''
  dlgEl.querySelectorAll('.s-tabs [role="tab"]').forEach((b, j) =>
    b.setAttribute('aria-selected', String(j === i)))
}

export function openPrompt(file) {
  closePrompt()
  const overlay = document.createElement('div')
  overlay.className = 's-overlay'
  overlay.innerHTML = buildDialog(file)
  document.body.appendChild(overlay)
  dlgEl = overlay

  tabsState = file.doc.tabs
  if (tabsState.length) setTab(0)

  // 文本框全高（不内部滚动）：高度撑到内容高度，整体在 dialog 里滚动
  const grow = () => {
    const area = dlgEl.querySelector('.s-prompt-area')
    // 反复以当前 scrollHeight 撑高直到稳定（重设高度会让换行/滚动条变化）
    for (let i = 0; i < 8; i++) {
      area.style.height = `${area.scrollHeight}px`
      const h = area.getBoundingClientRect().height
      if (Math.abs(h - area.scrollHeight) < 1) break
    }
  }
  // 等布局/字体稳定后再量高，避免撑高不足；rAF 在后台标签页会暂停，用 setTimeout
  const growWhenReady = () => setTimeout(grow, 0)
  dlgEl.addEventListener('s-open', growWhenReady)
  growWhenReady()
  if (document.fonts?.ready) document.fonts.ready.then(() => { if (dlgEl) grow() })
  // 内容再排版（字体加载等）时自动补一次撑高
  const ro = new ResizeObserver(() => { if (dlgEl) grow() })
  ro.observe(dlgEl.querySelector('.s-prompt-area'))
  dlgEl._ro = ro

  overlay.addEventListener('click', e => {
    const tab = e.target.closest('.s-tabs [role="tab"]')
    if (tab) {
      setTab([...tab.parentElement.children].indexOf(tab))
      growWhenReady()
      return
    }
    const copy = e.target.closest('.s-copy-btn')
    if (copy) copyCode(copy)
    const fav = e.target.closest('[data-fav-toggle]')
    if (fav) {
      const on = toggleFav(file.id)
      fav.textContent = on ? '已收藏' : '收藏'
      Smartisan.toast(on ? '收藏成功' : '已取消收藏')
      document.dispatchEvent(new CustomEvent('favs-changed'))
    }
  })
  // 遮罩点击关闭（smartisan.js 只处理 .s-overlay 直接点击时的隐藏，这里统一走 closePrompt）
  overlay.addEventListener('click', e => { if (e.target === overlay) closePrompt() })
  document.addEventListener('keydown', escClose)

  Smartisan.open(overlay)
}

function escClose(e) {
  if (e.key === 'Escape') closePrompt()
}

export function closePrompt() {
  if (!dlgEl) return
  Smartisan.close(dlgEl)
  dlgEl._ro?.disconnect()
  dlgEl.remove()
  dlgEl = null
  document.removeEventListener('keydown', escClose)
}

function copyCode(btn) {
  const area = dlgEl?.querySelector('.s-prompt-area')
  if (!area) return
  const text = area.value
  const done = () => Smartisan.toast('复制成功')
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done))
  } else {
    fallbackCopy(text, done)
  }
}

function fallbackCopy(text, done) {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.cssText = 'position:fixed;opacity:0'
  document.body.appendChild(ta)
  ta.select()
  try { document.execCommand('copy'); done() } catch { /* ignore */ }
  ta.remove()
}

/* ---------------- 底部确认 Sheet ---------------- */

// Smartisan 风格 Bottom Sheet：标题 + 提示文字 + 确认按钮（可标红）。
// 用法：confirmSheet({ title, message, confirmText, danger, onConfirm })
export function confirmSheet({ title, message, confirmText = '确定', danger = false, onConfirm }) {
  const overlay = document.createElement('div')
  overlay.className = 's-overlay s-overlay--bottom'
  overlay.innerHTML = `
    <div class="s-sheet" role="dialog" aria-modal="true">
      <div class="s-sheet__header">
        <button type="button" aria-label="关闭">${icon('si-close-thin', 's-icon s-icon--20')}</button>
        <span class="s-sheet__title">${esc(title)}</span>
        <span class="s-sheet__spacer"></span>
      </div>
      <div class="s-sheet__body">
        <div class="s-sheet__message">${esc(message)}</div>
        <button type="button" class="s-btn--sheet ${danger ? 's-sheet__confirm--danger' : ''}" data-sheet-confirm>${esc(confirmText)}</button>
      </div>
    </div>`
  document.body.appendChild(overlay)

  const close = () => {
    document.removeEventListener('keydown', onEsc)
    Smartisan.close(overlay)
    overlay.remove()
  }
  const onEsc = e => { if (e.key === 'Escape') close() }
  document.addEventListener('keydown', onEsc)

  overlay.addEventListener('click', e => {
    if (e.target.closest('[data-sheet-confirm]')) {
      close()
      onConfirm?.()
    } else if (e.target === overlay || e.target.closest('[aria-label="关闭"]')) {
      close()
    }
  })
  Smartisan.open(overlay)
}

/* ---------------- 搜索浮层 ---------------- */

let searchEl = null

export function openSearch(allFiles, onPick) {
  closeSearch()
  const el = document.createElement('div')
  el.className = 's-search-overlay'
  el.innerHTML = `
    <header class="s-appbar s-appbar--shadow">
      <button type="button" aria-label="返回">${icon('si-back', 's-icon s-icon--20')}</button>
      <span class="s-appbar__spacer"></span><span class="s-appbar__title">搜索</span>
      <span class="s-appbar__spacer" style="width:48px;flex:none"></span>
    </header>
    <div class="s-search">
      <label class="s-search-field">${icon('si-search', 's-icon s-icon--16')}
        <input type="text" placeholder="搜索提示词" aria-label="搜索">
        <button type="button" aria-label="清除" hidden>${icon('si-c-clear', 's-icon s-icon--18')}</button>
      </label>
    </div>
    <div class="s-search-overlay__results"></div>`
  document.body.appendChild(el)
  searchEl = el

  const input = el.querySelector('input')
  const clearBtn = el.querySelector('button[aria-label="清除"]')
  const results = el.querySelector('.s-search-overlay__results')

  const render = () => {
    const q = input.value.trim().toLowerCase()
    clearBtn.hidden = !q
    const list = q
      ? allFiles.filter(f =>
          f.title.toLowerCase().includes(q) || f.category.toLowerCase().includes(q))
      : []
    results.innerHTML = list.length
      ? `<div class="s-list">${list.map(f => `
          <div class="s-list-item s-list-item--divider" data-name="${esc(f.name)}" data-cat="${esc(f.category)}">
            <div class="s-list-item__text">
              <span class="s-list-item__title">${esc(f.title)}</span>
              <span class="s-list-item__subtitle">${esc(f.category.replace(/^\d+\s*/, ''))}</span>
            </div>
            <span class="s-list-item__detail">${icon('si-chevron-right')}</span>
          </div>`).join('')}</div>`
      : q ? `<div class="s-list-group__desc" style="padding:32px 0">没有匹配的提示词</div>` : ''
  }

  input.addEventListener('input', render)
  clearBtn.addEventListener('click', () => { input.value = ''; render(); input.focus() })
  results.addEventListener('click', e => {
    const item = e.target.closest('.s-list-item')
    if (!item) return
    const file = allFiles.find(f => f.name === item.dataset.name && f.category === item.dataset.cat)
    if (file) { closeSearch(); onPick(file) }
  })
  el.querySelector('[aria-label="返回"]').addEventListener('click', closeSearch)

  requestAnimationFrame(() => input.focus())
}

export function closeSearch() {
  if (searchEl) { searchEl.remove(); searchEl = null }
}
