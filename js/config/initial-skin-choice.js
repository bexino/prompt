(() => {
  const storageKey = 'prompt_notebook_skin';
  const supportedSkins = new Set(['classic', 'elegant']);

  function readStoredSkin() {
    try {
      const stored = localStorage.getItem(storageKey);
      return supportedSkins.has(stored) ? stored : null;
    } catch (_error) {
      return null;
    }
  }

  function saveSkin(skin) {
    try {
      localStorage.setItem(storageKey, skin);
    } catch (_error) {
      // 浏览器禁用本地存储时，本次选择仍会在当前页面内生效。
    }
  }

  let selectedSkin = readStoredSkin();
  if (!selectedSkin) {
    const useElegantSkin = window.confirm(
      '请选择网页皮肤：\n\n确定：优雅扁平皮肤\n取消：经典拟物皮肤'
    );
    selectedSkin = useElegantSkin ? 'elegant' : 'classic';
    saveSkin(selectedSkin);
  }

  PromptNotebook.config.initialSkinChoice = selectedSkin;
  document.write('<script src="./js/config/app-loader.js?v=4"><\/script>');
})();
