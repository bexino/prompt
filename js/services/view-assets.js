(() => {
  function preloadViewAssets() {
    PromptNotebook.components.updateLoadingScreen({ message: '正在准备页面…' });
    return Promise.resolve({ completed: 0, total: 0, failures: [], timedOut: false });
  }

  PromptNotebook.services.preloadViewAssets = preloadViewAssets;
})();
