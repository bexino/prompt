(() => {
  const storageKey = 'prompt_notebook_skin';
  const supportedSkins = new Set(['classic', 'elegant']);
  const stylesheetVersions = { classic: '14', elegant: '11' };
  const stylesheetPromises = new Map();

  function ensureSkinStylesheet(skin) {
    if (stylesheetPromises.has(skin)) return stylesheetPromises.get(skin);

    const existing = document.querySelector(`link[data-pn-skin-stylesheet="${skin}"]`);
    if (existing) return Promise.resolve(existing);

    const promise = new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `./css/themes/${skin}/index.css?v=${stylesheetVersions[skin]}`;
      link.dataset.pnSkinStylesheet = skin;
      link.addEventListener('load', () => resolve(link), { once: true });
      link.addEventListener('error', () => {
        stylesheetPromises.delete(skin);
        reject(new Error(`无法加载 ${skin} 皮肤样式`));
      }, { once: true });
      document.head.append(link);
    });
    stylesheetPromises.set(skin, promise);
    return promise;
  }

  function readStoredSkin() {
    try {
      const stored = localStorage.getItem(storageKey);
      return supportedSkins.has(stored) ? stored : 'classic';
    } catch (_error) {
      return 'classic';
    }
  }

  function applySkin(skin, persist = false) {
    const selected = supportedSkins.has(skin) ? skin : 'classic';
    document.documentElement.dataset.pnSkin = selected;
    if (document.body) {
      document.body.classList.toggle('pn-theme', selected === 'classic');
      document.body.classList.toggle('pn-theme-elegant', selected === 'elegant');
    }
    if (persist) {
      try {
        localStorage.setItem(storageKey, selected);
      } catch (_error) {
        // 浏览器禁用本地存储时，皮肤仍在当前页面内生效。
      }
    }
    return selected;
  }

  let currentSkin = applySkin(PromptNotebook.config.initialSkinChoice || readStoredSkin());
  const ready = ensureSkinStylesheet(currentSkin);
  const skin = {
    get() {
      return currentSkin;
    },
    async set(nextSkin) {
      const selected = supportedSkins.has(nextSkin) ? nextSkin : 'classic';
      if (selected === currentSkin) return currentSkin;
      await ensureSkinStylesheet(selected);
      currentSkin = applySkin(selected, true);
      return currentSkin;
    },
    async toggle() {
      return this.set(currentSkin === 'classic' ? 'elegant' : 'classic');
    },
    ready() {
      return ready;
    },
    syncBody() {
      applySkin(currentSkin);
    }
  };

  PromptNotebook.config.skin = skin;
  window.addEventListener('DOMContentLoaded', () => skin.syncBody(), { once: true });
})();
