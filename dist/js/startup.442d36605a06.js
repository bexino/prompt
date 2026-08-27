window.PromptNotebook = window.PromptNotebook || {
  config: {}, core: {}, services: {}, components: {}, app: {}
};

;
(() => {
  const storageKey = 'prompt_notebook_skin';
  const supportedSkins = new Set(['classic', 'elegant']);

  function readStoredSkin() {
    try {
      const stored = localStorage.getItem(storageKey);
      return supportedSkins.has(stored) ? stored : null;
    } catch (_error) {
      return null;
    }
  }

  function saveSkin(skin) {
    try {
      localStorage.setItem(storageKey, skin);
    } catch (_error) {
      // 浏览器禁用本地存储时，本次选择仍会在当前页面内生效。
    }
  }

  let selectedSkin = readStoredSkin();
  if (!selectedSkin) {
    const useElegantSkin = window.confirm(
      '请选择网页皮肤：\n\n确定：优雅扁平皮肤\n取消：经典拟物皮肤'
    );
    selectedSkin = useElegantSkin ? 'elegant' : 'classic';
    saveSkin(selectedSkin);
  }

  PromptNotebook.config.initialSkinChoice = selectedSkin;
})();

;
(() => {
  const storageKey = 'prompt_notebook_skin';
  const supportedSkins = new Set(['classic', 'elegant']);
  const stylesheetUrls = {"classic":"./css/classic.26d470e275c4.css","elegant":"./css/elegant.9a8783fa36d0.css"};
  const stylesheetPromises = new Map();

  function ensureSkinStylesheet(skin) {
    if (stylesheetPromises.has(skin)) return stylesheetPromises.get(skin);

    const existing = document.querySelector(`link[data-pn-skin-stylesheet="${skin}"]`);
    if (existing) return Promise.resolve(existing);

    const promise = new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = stylesheetUrls[skin];
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

;
(() => {
  const storageKey = 'prompt_notebook_font';
  const supportedFonts = new Set(['serif', 'geist']);

  function readStoredFont() {
    try {
      const stored = localStorage.getItem(storageKey);
      return supportedFonts.has(stored) ? stored : null;
    } catch (_error) {
      return null;
    }
  }

  function getSkinDefault(skinName = PromptNotebook.config.skin.get()) {
    return skinName === 'elegant' ? 'geist' : 'serif';
  }

  function applyFont(fontName, persist = false) {
    const selected = supportedFonts.has(fontName) ? fontName : getSkinDefault();
    document.documentElement.dataset.pnFont = selected;
    if (document.body) {
      document.body.classList.toggle('pn-use-geist', selected === 'geist');
    }
    if (persist) {
      try {
        localStorage.setItem(storageKey, selected);
      } catch (_error) {
        // 浏览器禁用本地存储时，人工选择仍在当前页面内生效。
      }
    }
    return selected;
  }

  let explicitFont = readStoredFont();
  let currentFont = applyFont(explicitFont || getSkinDefault());
  const font = {
    get() {
      return currentFont;
    },
    set(nextFont) {
      explicitFont = supportedFonts.has(nextFont) ? nextFont : 'serif';
      currentFont = applyFont(explicitFont, true);
      return currentFont;
    },
    toggle() {
      return this.set(currentFont === 'geist' ? 'serif' : 'geist');
    },
    followSkin(skinName) {
      explicitFont = getSkinDefault(skinName);
      currentFont = applyFont(explicitFont, true);
      return currentFont;
    },
    syncBody() {
      applyFont(currentFont);
    }
  };

  PromptNotebook.config.font = font;
  window.addEventListener('DOMContentLoaded', () => font.syncBody(), { once: true });
})();

;
document.write([
      '<link rel="icon" type="image/png" sizes="64x64" href="./assets/branding/favicon.png?v=1">',
      '<link rel="stylesheet" href="./css/shell.7e3b3b35b620.css">',
      '<script defer src="./js/app.40d658ada096.js"><\/script>'
    ].join('\n'));
