(() => {
  async function prepareAndReveal({ render = false, message = '正在准备页面…', alreadyVisible = false } = {}) {
    if (!alreadyVisible) PromptNotebook.components.showLoadingScreen(message);
    const root = render
      ? PromptNotebook.app.parseAndRender()
      : document.getElementById('prompts-list-root');
    if (!root) {
      PromptNotebook.components.hideLoadingScreen();
      return { completed: 0, total: 0, failures: [], timedOut: false };
    }

    try {
      PromptNotebook.services.initLazyAssets(root);
      const result = await PromptNotebook.services.preloadViewAssets(root, PromptNotebook.config.skin.get());
      if (result.failures.length || result.timedOut) {
        console.warn('部分页面资源未能在限定时间内完成，已使用降级显示。', result);
      }
      return result;
    } finally {
      PromptNotebook.components.hideLoadingScreen();
    }
  }

  PromptNotebook.app.prepareAndReveal = prepareAndReveal;
})();
