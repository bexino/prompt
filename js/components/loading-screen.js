(() => {
  function getElements() {
    return {
      screen: document.getElementById('pn-loading-screen')
    };
  }

  function showLoadingScreen(message = '正在准备页面…') {
    const elements = getElements();
    document.body.classList.add('pn-loading');
    document.body.setAttribute('aria-busy', 'true');
    if (elements.screen) elements.screen.hidden = false;
    if (elements.screen) elements.screen.setAttribute('aria-label', message);
  }

  function updateLoadingScreen({ message } = {}) {
    const elements = getElements();
    if (message && elements.screen) elements.screen.setAttribute('aria-label', message);
  }

  function hideLoadingScreen() {
    const elements = getElements();
    document.body.classList.remove('pn-loading');
    document.body.setAttribute('aria-busy', 'false');
    if (elements.screen) elements.screen.hidden = true;
  }

  Object.assign(PromptNotebook.components, { showLoadingScreen, updateLoadingScreen, hideLoadingScreen });
})();
