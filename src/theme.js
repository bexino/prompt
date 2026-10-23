// 三态主题：auto(遵循设备) / day / dark
// 规则：URL 参数 theme=day|dark 显式指定；无参数 → 遵循设备 prefers-color-scheme。
// 按钮 cyclic 切换 auto → day → dark → auto，切到 day/dark 时写回 URL 参数。

import { urlParam } from './url.js'

const mq = window.matchMedia('(prefers-color-scheme: dark)')

export function themeParam() {
  const t = urlParam('theme')
  return t === 'day' || t === 'dark' ? t : null   // null = 跟随设备
}

function applyTheme() {
  const p = themeParam()
  const dark = p ? p === 'dark' : mq.matches
  document.documentElement.dataset.theme = dark ? 'dark' : 'day'
  // auto 状态去掉 data-theme-auto 之外的显式值由 CSS 用 [data-theme] 区分；
  // 图标状态由按钮渲染时读取
  document.dispatchEvent(new CustomEvent('themechange'))
}

// 显式设置：day/dark 写入 URL 参数（replaceState 不触发导航），null 清除回到跟随设备
export function setTheme(v) {
  const url = new URL(location.href)
  if (v) url.searchParams.set('theme', v)
  else url.searchParams.delete('theme')
  history.replaceState(null, '', url)
  applyTheme()
}

// 三态循环：auto(null) → day → dark → auto
export function cycleTheme() {
  const cur = themeParam()
  setTheme(cur === null ? 'day' : cur === 'day' ? 'dark' : null)
}

export function initTheme() {
  applyTheme()
  mq.addEventListener?.('change', applyTheme)
}

/* ---------------- 主题按钮 ---------------- */
// auto（跟随设备）显示电脑图标；day 太阳；dark 月亮。
export function themeButtonHtml() {
  const p = themeParam()
  const id = p === 'day' ? 'si-sun' : p === 'dark' ? 'si-moon' : 'si-theme-pc'
  const label = p === 'day' ? '亮色' : p === 'dark' ? '暗色' : '跟随设备'
  return `<button type="button" data-theme-toggle aria-label="主题：${label}" title="主题：${label}">${icon(id)}</button>`
}

function icon(id) {
  return `<svg class="s-icon" aria-hidden="true"><use href="#${id}"/></svg>`
}
