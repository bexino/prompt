PromptNotebook.components.updateStatusBanner = function updateStatusBanner(options = {}) {
  const banner = document.getElementById('local-mode-banner');
  const statusText = document.getElementById('local-mode-status-text');
  const resetButton = document.getElementById('local-mode-reset-btn');
  if (!banner || !statusText || !resetButton) return;
  if (!options.visible) {
    banner.classList.add('hidden');
    return;
  }
  banner.classList.remove('hidden');
  if (options.imported) {
    statusText.innerHTML = `<h4 class="font-semibold text-slate-800 text-sm">已载入自定义配置</h4><p class="text-xs text-slate-500 mt-0.5">正在使用导入的 <strong>${options.filename}</strong>（更新于 ${options.updated}）。更改文件后可重新拖入。</p>`;
    resetButton.classList.remove('hidden');
  } else {
    statusText.innerHTML = `<h4 class="font-semibold text-slate-800 text-sm">本地离线模式</h4><p class="text-xs text-slate-500 mt-0.5">由于浏览器安全限制，无法自动加载您的 ${options.filename} 修改。请拖拽修改后的文件到此处，或点击导入。</p>`;
    resetButton.classList.add('hidden');
  }
};
