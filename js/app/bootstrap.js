(() => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const constrained = connection && (connection.saveData || /(^|-)2g$/i.test(connection.effectiveType || ''));
  if (constrained) document.documentElement.classList.add('low-bandwidth');
})();

window.addEventListener('DOMContentLoaded', async () => {
  try {
    await PromptNotebook.config.skin.ready();
  } catch (error) {
    console.warn('当前皮肤样式加载失败，页面将继续使用基础结构样式：', error);
  }
  document.querySelectorAll('[data-pn-asset]').forEach(element => {
    if (PromptNotebook.config.skin.get() === 'elegant' && element.hasAttribute('data-pn-classic-asset')) return;
    const [group, name] = element.dataset.pnAsset.split(':');
    const attribute = element.dataset.pnAssetAttribute || 'src';
    if (PromptNotebook.config.assets[group]) element.setAttribute(attribute, PromptNotebook.config.assets[group](name));
  });
  const topBarRoot = document.getElementById('app-top-bar-root');
  if (topBarRoot) {
    topBarRoot.replaceChildren(PromptNotebook.components.createTopBar({
      title: '一键复制库',
      titleId: 'brand-subtitle',
      className: 'pn-app-elegant-top-bar',
      actionsLabel: '页面显示设置',
      backgroundColor: '#6d5e4f',
      actionColor: '#dd6d61',
      actions: [{
        id: 'skin-toggle-btn',
        label: '换肤',
        title: '切换为优雅扁平皮肤',
        ariaPressed: false,
        dataset: { pnSkinToggle: '' }
      }]
    }));
  }
  PromptNotebook.app.initPageEvents();
  PromptNotebook.components.initCopyDetailModal();
  PromptNotebook.components.initBackToTop();
  PromptNotebook.app.updateDynamicTexts();

  const plaque = document.querySelector('.pn-brand-plaque');
  if (plaque) {
    const rotation = PromptNotebook.core.getStablePlaqueRotation('prompt-notebook-brand');
    plaque.style.setProperty('--plaque-rotation', `${rotation.rotation}deg`);
    plaque.style.setProperty('--plaque-mobile-rotation', `${rotation.mobileRotation}deg`);
    PromptNotebook.core.applyStablePlaqueWear(plaque, 'prompt-notebook-brand');
  }

  const site = PromptNotebook.config.getActiveSite();
  let loaded = false;
  try {
    rawMarkdown = await PromptNotebook.services.loadContent(site);
    PromptNotebook.services.storage.clear();
    loaded = true;
  } catch (error) {
    console.warn(`获取 ${site.filename} 失败，将尝试本地存储：`, error);
  }

  if (!loaded) {
    const stored = PromptNotebook.services.storage.read();
    if (stored) {
      rawMarkdown = stored.content;
      loaded = true;
      PromptNotebook.components.updateStatusBanner({ visible: window.location.protocol === 'file:', imported: true, filename: stored.filename || site.filename, updated: stored.updated });
    }
  }

  if (loaded) {
    PromptNotebook.app.hideErrorOverlay();
    await PromptNotebook.app.prepareAndReveal({ render: true, alreadyVisible: true });
  } else {
    PromptNotebook.app.showErrorOverlay();
    await PromptNotebook.app.prepareAndReveal({ alreadyVisible: true });
  }
});
