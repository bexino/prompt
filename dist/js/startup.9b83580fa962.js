window.PromptNotebook = window.PromptNotebook || {
  config: {}, core: {}, services: {}, components: {}, app: {}
};

;
(() => {
  const url = new URL(window.location.href);
  const selectedSkin = url.searchParams.get('skin') === 'elegant' ? 'elegant' : 'classic';

  // 经典主题使用无 skin 参数的规范网址，避免产生两个等价入口。
  if (selectedSkin === 'classic' && url.searchParams.has('skin')) {
    url.searchParams.delete('skin');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  }

  PromptNotebook.config.initialSkinChoice = selectedSkin;
})();

;
(() => {
  const supportedSkins = new Set(['classic', 'elegant']);
  const stylesheetUrls = {"classic":"./css/classic.d752ba4f6e21.css","elegant":"./css/elegant.9a8783fa36d0.css"};
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

  function applySkin(skin) {
    const selected = supportedSkins.has(skin) ? skin : 'classic';
    document.documentElement.dataset.pnSkin = selected;
    if (document.body) {
      document.body.classList.toggle('pn-theme', selected === 'classic');
      document.body.classList.toggle('pn-theme-elegant', selected === 'elegant');
    }
    return selected;
  }

  function getUrl(nextSkin) {
    const selected = supportedSkins.has(nextSkin) ? nextSkin : 'classic';
    const url = new URL(window.location.href);
    if (selected === 'elegant') url.searchParams.set('skin', 'elegant');
    else url.searchParams.delete('skin');
    return `${url.pathname}${url.search}${url.hash}`;
  }

  const currentSkin = applySkin(PromptNotebook.config.initialSkinChoice || 'classic');
  const ready = ensureSkinStylesheet(currentSkin);
  const skin = {
    get() {
      return currentSkin;
    },
    getUrl,
    navigate(nextSkin) {
      const selected = supportedSkins.has(nextSkin) ? nextSkin : 'classic';
      if (selected === currentSkin) return currentSkin;
      PromptNotebook.config.font?.followSkin(selected);
      window.location.assign(getUrl(selected));
      return selected;
    },
    toggle() {
      return this.navigate(currentSkin === 'classic' ? 'elegant' : 'classic');
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
      '<link rel="stylesheet" href="./css/shell.732c60ec68b2.css">',
      '<script defer src="./js/app.32a5d5823353.js"><\/script>'
    ].join('\n'));
