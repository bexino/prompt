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
