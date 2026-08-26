PromptNotebook.components.createTopBar = function createTopBar(options = {}) {
  const element = document.createElement('header');
  element.className = `pn-top-bar${options.sticky === false ? ' pn-top-bar-static' : ''}${options.className ? ` ${options.className}` : ''}`;
  element.dataset.pnRole = 'top-bar';
  element.setAttribute('aria-label', options.ariaLabel || options.title || '页面顶栏');

  if (options.backgroundColor) {
    element.style.setProperty('--pn-top-bar-background', options.backgroundColor);
  }
  if (options.actionColor) {
    element.style.setProperty('--pn-top-bar-action-background', options.actionColor);
  }
  if (options.contentWidth) {
    element.style.setProperty('--pn-top-bar-content-width', options.contentWidth);
  }

  const inner = document.createElement('div');
  inner.className = 'pn-top-bar-inner';

  const title = document.createElement('h1');
  title.className = 'pn-top-bar-title';
  title.id = options.titleId || '';
  title.textContent = options.title || '';

  const actions = document.createElement('div');
  actions.className = 'pn-top-bar-actions';
  actions.setAttribute('aria-label', options.actionsLabel || '页面操作');

  (options.actions || []).forEach(action => {
    if (action?.element instanceof Element) {
      actions.append(action.element);
      return;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `pn-top-bar-action${action?.className ? ` ${action.className}` : ''}`;
    button.id = action?.id || '';
    button.textContent = action?.label || '';
    if (action?.title) button.title = action.title;
    if (action?.ariaLabel) button.setAttribute('aria-label', action.ariaLabel);
    if (action?.ariaPressed !== undefined) button.setAttribute('aria-pressed', String(action.ariaPressed));
    if (action?.disabled) button.disabled = true;
    Object.entries(action?.dataset || {}).forEach(([name, value]) => {
      button.dataset[name] = String(value);
    });
    if (typeof action?.onClick === 'function') button.addEventListener('click', action.onClick);
    actions.append(button);
  });

  inner.append(title, actions);
  element.append(inner);
  return element;
};
