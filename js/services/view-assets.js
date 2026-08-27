(() => {
  const resourceTimeout = 15000;
  const viewTimeout = 30000;

  function withTimeout(promise, timeout, message) {
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error(message)), timeout);
      promise.then(
        value => { window.clearTimeout(timer); resolve(value); },
        error => { window.clearTimeout(timer); reject(error); }
      );
    });
  }

  async function decodeImage(url, targets) {
    const probe = new Image();
    probe.decoding = 'async';
    const loaded = new Promise((resolve, reject) => {
      probe.addEventListener('load', resolve, { once: true });
      probe.addEventListener('error', () => reject(new Error(`图片加载失败：${url}`)), { once: true });
    });
    probe.src = url;
    await withTimeout(
      probe.complete && probe.naturalWidth > 0 ? Promise.resolve() : loaded,
      resourceTimeout,
      `图片加载超时：${url}`
    );
    if (typeof probe.decode === 'function') {
      await Promise.race([
        probe.decode().catch(() => {}),
        new Promise(resolve => window.setTimeout(resolve, 3000))
      ]);
    }

    await Promise.all(targets.map(async target => {
      const targetLoaded = new Promise((resolve, reject) => {
        target.addEventListener('load', resolve, { once: true });
        target.addEventListener('error', reject, { once: true });
      });
      target.src = url;
      target.removeAttribute('data-src');
      if (!(target.complete && target.naturalWidth > 0)) {
        await withTimeout(targetLoaded, resourceTimeout, `卡片图片加载超时：${url}`);
      }
      if (typeof target.decode === 'function') {
        await Promise.race([
          target.decode().catch(() => {}),
          new Promise(resolve => window.setTimeout(resolve, 3000))
        ]);
      }
      if (target.classList.contains('pn-note-paper-base')) {
        target.closest('.pn-note-card')?.classList.add('pn-note-paper-ready');
      }
    }));
  }

  function collectImageResources(scope, skinName) {
    const resources = new Map();
    const add = (url, target = null) => {
      if (!url) return;
      if (!resources.has(url)) resources.set(url, []);
      if (target) resources.get(url).push(target);
    };

    PromptNotebook.config.assets.view(skinName).forEach(url => add(url));
    if (skinName === 'classic') {
      scope.querySelectorAll('img[data-src]').forEach(target => add(target.dataset.src, target));
      document.querySelectorAll('img[data-pn-classic-asset][src]').forEach(target => add(target.getAttribute('src')));
    }
    return resources;
  }

  function getFontTasks(skinName) {
    if (!document.fonts?.load) return [];
    const fonts = skinName === 'classic'
      ? [
          ['400 16px "Gelasio Local"', 'Prompt Systems'],
          ['400 16px "Prompt Source Han Serif SC"', '正在加载经典主题']
        ]
      : [['400 16px "Geist Local"', 'Prompt Systems']];
    return fonts.map(([font, sample]) => async () => {
      const loaded = await withTimeout(document.fonts.load(font, sample), resourceTimeout, `字体加载超时：${font}`);
      if (!loaded.length) throw new Error(`字体加载失败：${font}`);
    });
  }

  async function preloadViewAssets(scope, skinName) {
    const label = skinName === 'classic' ? '经典主题' : '典雅主题';
    const imageResources = collectImageResources(scope, skinName);
    const tasks = [
      ...[...imageResources.entries()].map(([url, targets]) => () => decodeImage(url, targets)),
      ...getFontTasks(skinName)
    ];
    let completed = 0;
    const failures = [];
    PromptNotebook.components.updateLoadingScreen({ message: `正在加载${label} 0/${tasks.length}`, completed, total: tasks.length });

    const work = Promise.all(tasks.map(async task => {
      try {
        await task();
      } catch (error) {
        failures.push(error);
      } finally {
        completed += 1;
        PromptNotebook.components.updateLoadingScreen({
          message: `正在加载${label} ${completed}/${tasks.length}`,
          completed,
          total: tasks.length
        });
      }
    }));

    let timedOut = false;
    await Promise.race([
      work,
      new Promise(resolve => window.setTimeout(() => { timedOut = true; resolve(); }, viewTimeout))
    ]);
    return { completed, total: tasks.length, failures, timedOut };
  }

  PromptNotebook.services.preloadViewAssets = preloadViewAssets;
})();
