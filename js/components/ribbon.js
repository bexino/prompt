PromptNotebook.components.createRibbon = function createRibbon(options = {}) {
  const element = document.createElement('div');
  element.className = 'pn-ribbon';
  element.setAttribute('role', 'separator');
  element.setAttribute('aria-hidden', 'true');
  if (options.rotation != null) element.style.setProperty('--ribbon-rotation', `${options.rotation}deg`);
  return element;
};
