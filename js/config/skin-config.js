(() => {
  const supportedSkins = new Set(['classic', 'elegant']);
  const stylesheetVersions = { classic: '20', elegant: '12' };
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
