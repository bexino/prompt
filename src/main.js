// 入口：hash 路由 + 页面渲染
import './style.css'
import './dark.css'
import { categories, getCategory, allFiles } from './data.js'
import { openPrompt, openSearch, closeSearch, confirmSheet } from './ui.js'
import { initTheme, setTheme, themeParam } from './theme.js'
import { getFavs, favFiles, setFavs, clearFavs, exportCsv, importCsv } from './fav.js'

const icon = (id, cls = 's-icon') =>
  `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`

const app = document.getElementById('app')

function listRow({ leading, title, subtitle, detail, attrs = '' }) {
  return `
    <div class="s-list-item s-list-item--divider" data-pressable ${attrs}>
      ${leading}
      <div class="s-list-item__text">
        <span class="s-list-item__title">${esc(title)}</span>
        ${subtitle ? `<span class="s-list-item__subtitle">${esc(subtitle)}</span>` : ''}
      </div>
      <span class="s-list-item__detail">${esc(detail)}${icon('si-chevron-right')}</span>
    </div>`
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/* ---------- 主页：收藏区 + 分类列表 ---------- */
function renderHome() {
  const favs = favFiles()

  const favSection = favs.length ? `
    <div class="s-list-group">
      <div class="s-list-group__header">${icon('si-star-fill', 's-icon s-icon--16 s-fav-star')}我的收藏</div>
      <div class="s-list">
        ${favs.map(f => listRow({
          leading: icon('si-star-fill', 's-icon s-icon--20 s-fav-star'),
          title: f.title,
          subtitle: getCategory(f.category)?.title || f.category.replace(/^\d+\s*/, ''),
          detail: '',
          attrs: `data-fav-id="${f.id}"`,
        })).join('')}
      </div>
    </div>` : ''

  app.innerHTML = `
    <header class="s-appbar s-appbar--shadow">
      <button type="button" data-settings aria-label="设置">${icon('si-setting', 's-icon s-icon--20')}</button>
      <span class="s-appbar__spacer"></span><span class="s-appbar__title">提示词仓库</span>
      <span class="s-appbar__spacer" style="width:48px;flex:none"></span>
      <div class="s-appbar__actions">
        <button type="button" data-search aria-label="搜索">${icon('si-search')}</button>
      </div>
    </header>
    <div class="s-content">
      ${favSection}
      <div class="s-list">
        ${categories.map(c => listRow({
          leading: `<span class="s-count">${c.num}</span>`,
          title: c.title,
          subtitle: '类别',
          detail: '',
          attrs: `data-cat-name="${esc(c.name)}"`,
        })).join('')}
      </div>
    </div>`
}

/* ---------- 二级页：分类下的文件列表 ---------- */
function renderCategory(cat) {
  document.title = `${cat.title} · 提示词仓库`
  app.innerHTML = `
    <header class="s-appbar s-appbar--shadow">
      <button type="button" data-back aria-label="返回">${icon('si-back', 's-icon s-icon--20')}</button>
      <span class="s-appbar__spacer"></span><span class="s-appbar__title">${esc(cat.title)}</span>
      <div class="s-appbar__actions">
        <button type="button" data-search aria-label="搜索">${icon('si-search')}</button>
      </div>
    </header>
    <div class="s-content">
      <div class="s-list">
        ${cat.files.map(f => listRow({
          leading: `<span class="s-count">${f.num}</span>`,
          title: f.title,
          subtitle: '项目',
          detail: '',
          attrs: `data-file-id="${f.id}"`,
        })).join('')}
      </div>
    </div>`
}

/* ---------- 设置页 ---------- */
const THEME_OPTIONS = [
  { value: null, icon: 'si-theme-pc', label: '跟随设备' },
  { value: 'day', icon: 'si-sun', label: '亮色' },
  { value: 'dark', icon: 'si-moon', label: '暗色' },
]

function renderSettings() {
  document.title = '设置 · 提示词仓库'
  const cur = themeParam()

  const themeRow = opt => `
    <div class="s-list-item s-list-item--divider" data-pressable data-theme-set="${opt.value ?? 'auto'}">
      ${icon(opt.icon, 's-icon s-icon--20')}
      <div class="s-list-item__text"><span class="s-list-item__title">${opt.label}</span></div>
      <span class="s-list-item__detail">${icon(opt.value === cur ? 'si-c-radio-on' : 'si-c-radio-off')}</span>
    </div>`

  app.innerHTML = `
    <header class="s-appbar s-appbar--shadow">
      <button type="button" data-back aria-label="返回">${icon('si-back', 's-icon s-icon--20')}</button>
      <span class="s-appbar__spacer"></span><span class="s-appbar__title">设置</span>
      <span class="s-appbar__spacer" style="width:48px;flex:none"></span>
    </header>
    <div class="s-content">
      <div class="s-list-group">
        <div class="s-list-group__header">主题切换</div>
        <div class="s-list">${THEME_OPTIONS.map(themeRow).join('')}</div>
        <div class="s-list-group__desc">默认跟随设备的外观设置</div>
      </div>
      <div class="s-list-group">
        <div class="s-list-group__header">收藏</div>
        <div class="s-list">
          <div class="s-list-item s-list-item--divider" data-pressable data-fav-import>
            ${icon('si-import', 's-icon s-icon--20')}
            <div class="s-list-item__text"><span class="s-list-item__title">导入收藏</span></div>
            <span class="s-list-item__detail">${icon('si-chevron-right')}</span>
          </div>
          <div class="s-list-item s-list-item--divider" data-pressable data-fav-export>
            ${icon('si-export', 's-icon s-icon--20')}
            <div class="s-list-item__text"><span class="s-list-item__title">导出收藏</span></div>
            <span class="s-list-item__detail">${icon('si-chevron-right')}</span>
          </div>
          <div class="s-list-item s-list-item--divider s-danger-item" data-pressable data-fav-clear>
            ${icon('si-c-delete', 's-icon s-icon--20')}
            <div class="s-list-item__text"><span class="s-list-item__title">清空收藏</span></div>
            <span class="s-list-item__detail">${icon('si-chevron-right')}</span>
          </div>
        </div>
        <div class="s-list-group__desc">收藏保存在本机浏览器中</div>
      </div>
      <input type="file" accept=".csv,text/csv" hidden data-fav-file>
    </div>`
  document.querySelector('[data-fav-file]').addEventListener('change', e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const { added, skipped } = importCsv(reader.result)
      Smartisan.toast(added ? `已导入 ${added} 条，跳过 ${skipped} 条` : '没有可导入的收藏')
    }
    reader.readAsText(file)
  })
}

/* ---------- 路由 ---------- */
function route() {
  closeSearch()
  window.scrollTo(0, 0) // 新页面从顶部开始，避免继承上一页的滚动位置
  document.title = '提示词仓库'
  if (location.hash === '#/settings') return renderSettings()
  const m = /^#\/cat\/(.+)$/.exec(location.hash)
  if (m) {
    const cat = getCategory(decodeURIComponent(m[1]))
    if (cat) return renderCategory(cat)
  }
  renderHome()
}

/* ---------- 事件委托（渲染重建 DOM 也不丢） ---------- */
app.addEventListener('click', e => {
  const search = e.target.closest('[data-search]')
  if (search) return openSearch(allFiles, openPrompt)

  if (e.target.closest('[data-settings]')) { location.hash = '#/settings'; return }
  // 返回：统一回主页。theme 参数走 replaceState，history 条目不可靠，不能用 history.back()
  if (e.target.closest('[data-back]')) { location.hash = '#/'; return }

  const themeSet = e.target.closest('[data-theme-set]')
  if (themeSet) {
    const v = themeSet.dataset.themeSet
    setTheme(v === 'auto' ? null : v)
    renderSettings() // 刷新选中态
    return
  }

  // 设置页：导入/导出/清空收藏
  if (e.target.closest('[data-fav-import]')) {
    app.querySelector('[data-fav-file]').click()
    return
  }
  if (e.target.closest('[data-fav-export]')) return exportCsv()
  if (e.target.closest('[data-fav-clear]')) {
    confirmSheet({
      title: '清空收藏',
      message: `确定清空全部 ${getFavs().length} 条收藏吗？`,
      confirmText: '清空',
      danger: true,
      onConfirm: () => { clearFavs(); Smartisan.toast('已清空') },
    })
    return
  }

  // 主页收藏项：点击打开；长按/右键弹删除确认
  const favRow = e.target.closest('[data-fav-id]')
  if (favRow) {
    if (longPressed) { longPressed = false; return }
    return openPrompt(allFiles.find(f => f.id === favRow.dataset.favId))
  }

  // 主页分类项
  const catRow = e.target.closest('[data-cat-name]')
  if (catRow) location.hash = `#/cat/${encodeURIComponent(catRow.dataset.catName)}`

  // 分类页文件项
  const fileRow = e.target.closest('[data-file-id]')
  if (fileRow) openPrompt(allFiles.find(f => f.id === fileRow.dataset.fileId))
})

/* 长按 / 右键删除收藏：委托在 app 上，长按用 pointer 事件计时 500ms */
let pressTimer = null
let longPressed = false // 长按触发后吞掉随后的 click，避免又打开 dialog
function favRowFrom(e) {
  return e.target.closest?.('[data-fav-id]')
}
app.addEventListener('contextmenu', e => {
  const row = favRowFrom(e)
  if (!row) return
  e.preventDefault()
  askRemoveFav(row.dataset.favId)
})
app.addEventListener('pointerdown', e => {
  const row = favRowFrom(e)
  if (!row || e.button !== 0) return
  longPressed = false
  pressTimer = setTimeout(() => { pressTimer = null; longPressed = true; askRemoveFav(row.dataset.favId) }, 500)
})
;['pointerup', 'pointerleave', 'pointercancel', 'pointermove'].forEach(ev =>
  app.addEventListener(ev, e => {
    if (pressTimer && (ev !== 'pointermove' || Math.abs(e.movementX) + Math.abs(e.movementY) > 6)) {
      clearTimeout(pressTimer)
      pressTimer = null
    }
  }))

function askRemoveFav(id) {
  const f = allFiles.find(x => x.id === id)
  if (!f) return
  confirmSheet({
    title: '删除收藏',
    message: `确定删除“${f.title}”吗？`,
    confirmText: '删除',
    danger: true,
    onConfirm: () => {
      setFavs(getFavs().filter(x => x !== id))
      Smartisan.toast('已删除')
      if (!location.hash || location.hash === '#/' ) renderHome()
    },
  })
}

// 收藏在 dialog 里变动时，刷新底下的主页收藏区（无路由跳转，不自动重渲染）
document.addEventListener('favs-changed', () => {
  if (!location.hash || location.hash === '#/') renderHome()
})

// 跟随设备变化时刷新设置页选中态
document.addEventListener('themechange', () => {
  if (location.hash === '#/settings') renderSettings()
})

window.addEventListener('hashchange', route)
initTheme()
route()
