(() => {
  const config = PromptNotebook.config;
  let baseUrl = './assets';
  const join = value => `${baseUrl}/${value}`;
  config.assets = {
    setBaseUrl(value) { baseUrl = String(value || './assets').replace(/\/$/, ''); },
    getBaseUrl() { return baseUrl; },
    branding: name => join(`branding/${name}`),
    decor: name => join(`decor/${name}`),
    texture: name => join(`textures/${name}`),
    note(variant, color) { return join(`notes/note-paper-${variant}-${color}.webp?v=4`); },
    noteShadow(variant, shadow) { return join(`notes/note-top-shadow-${variant}-${shadow}.webp?v=1`); },
    view(skinName) {
      if (skinName !== 'classic') return [];
      return [
        join('branding/prompt-systems-logo.webp?v=2'),
        join('textures/walnut-desk.webp'),
        join('textures/paper-fiber.webp'),
        join('decor/markdown-ribbon-navy.webp'),
        join('decor/copied-sticker-v6.webp?v=7')
      ];
    },
    at(value) {
      const scopedBase = String(value || './assets').replace(/\/$/, '');
      const scopedJoin = name => `${scopedBase}/${name}`;
      return {
        branding: name => scopedJoin(`branding/${name}`),
        decor: name => scopedJoin(`decor/${name}`),
        note: (variant, color) => scopedJoin(`notes/note-paper-${variant}-${color}.webp?v=4`),
        noteShadow: (variant, shadow) => scopedJoin(`notes/note-top-shadow-${variant}-${shadow}.webp?v=1`)
      };
    }
  };
})();
