(() => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const constrained = connection && (connection.saveData || /(^|-)2g$/i.test(connection.effectiveType || ''));
  if (constrained) document.documentElement.classList.add('low-bandwidth');
})();

window.addEventListener('DOMContentLoaded', async () => {
  document.querySelectorAll('[data-pn-asset]').forEach(element => {
    const [group, name] = element.dataset.pnAsset.split(':');
    const attribute = element.dataset.pnAssetAttribute || 'src';
    if (PromptNotebook.config.assets[group]) element.setAttribute(attribute, PromptNotebook.config.assets[group](name));
  });
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
    PromptNotebook.app.parseAndRender();
  } else {
    PromptNotebook.app.showErrorOverlay();
  }
});
