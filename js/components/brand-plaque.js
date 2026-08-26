PromptNotebook.components.createPlaque = function createPlaque(options = {}) {
  const element = document.createElement('header');
  element.className = 'pn-brand-plaque';
  element.dataset.pnRole = 'brand';
  const image = document.createElement('img');
  image.className = 'pn-brand-plaque-logo pn-lazy-asset';
  image.dataset.pnClassicAsset = '';
  const assets = options.assetBaseUrl ? PromptNotebook.config.assets.at(options.assetBaseUrl) : PromptNotebook.config.assets;
  image.dataset.src = options.logo || assets.branding('prompt-systems-logo.webp?v=2');
  image.alt = options.logoAlt || 'Prompt Systems';
  const title = document.createElement('h1');
  title.textContent = options.title || '';
  element.append(image, title);
  return element;
};
