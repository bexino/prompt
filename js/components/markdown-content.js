PromptNotebook.components.createMarkdownContent = function createMarkdownContent(options = {}) {
  const element = document.createElement('div');
  element.className = options.className || 'pn-markdown-paper';
  element.dataset.pnRole = 'content';
  element.innerHTML = PromptNotebook.core.renderMarkdownToHtml(options.markdown || '');
  return element;
};
