(() => {
  function getElements() {
    return {
      screen: document.getElementById('pn-loading-screen'),
      status: document.getElementById('pn-loading-status'),
      progress: document.getElementById('pn-loading-progress')
    };
  }

  function showLoadingScreen(message = '正在准备页面…') {
    const elements = getElements();
    document.body.classList.add('pn-loading');
    document.body.setAttribute('aria-busy', 'true');
    if (elements.screen) elements.screen.hidden = false;
    if (elements.status) elements.status.textContent = message;
    if (elements.progress) elements.progress.style.width = '0%';
  }

  function updateLoadingScreen({ message, completed = 0, total = 0 } = {}) {
    const elements = getElements();
    if (message && elements.status) elements.status.textContent = message;
    if (elements.progress) {
      const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
      elements.progress.style.width = `${percentage}%`;
    }
  }

  function hideLoadingScreen() {
    const elements = getElements();
    document.body.classList.remove('pn-loading');
    document.body.setAttribute('aria-busy', 'false');
    if (elements.screen) elements.screen.hidden = true;
  }

  Object.assign(PromptNotebook.components, { showLoadingScreen, updateLoadingScreen, hideLoadingScreen });
})();
