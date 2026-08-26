PromptNotebook.components.createTableOfContents = function createTableOfContents(options = {}) {
  const nav = document.createElement('nav');
  nav.className = 'pn-catalog-panel';
  nav.dataset.pnRole = 'toc';
  for (const item of options.items || []) {
    const link = document.createElement('a');
    link.className = 'pn-toc-item-link';
    link.href = `#${item.id}`;
    link.textContent = item.title;
    nav.append(link);
  }
  return nav;
};
