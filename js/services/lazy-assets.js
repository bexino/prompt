let lazyAssetObserver = null;

function initLazyAssets(scope) {
      if (lazyAssetObserver) lazyAssetObserver.disconnect();

      applyStableRibbonRotations(scope);

      const targets = [
        ...scope.querySelectorAll('.pn-lazy-asset[data-src]'),
        ...scope.querySelectorAll('.pn-ribbon:not(.pn-lazy-bg-loaded)')
      ];

      const loadTarget = target => {
        if (target.classList.contains('pn-ribbon')) {
          target.classList.add('pn-lazy-bg-loaded');
          return;
        }

        const source = target.dataset.src;
        if (!source) return;
        if (target.classList.contains('pn-note-paper-base')) {
          const card = target.closest('.pn-note-card');
          const markReady = () => card?.classList.add('pn-note-assets-ready');
          target.addEventListener('load', markReady, { once: true });
          target.addEventListener('error', () => card?.classList.add('note-assets-failed'), { once: true });
        }
        target.src = source;
        target.removeAttribute('data-src');
        if (target.classList.contains('pn-note-paper-base') && target.complete && target.naturalWidth > 0) {
          target.closest('.pn-note-card')?.classList.add('pn-note-assets-ready');
        }
      };

      if (!('IntersectionObserver' in window)) {
        targets.forEach(loadTarget);
        return;
      }

      lazyAssetObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          loadTarget(entry.target);
          lazyAssetObserver.unobserve(entry.target);
        });
      }, {
        rootMargin: document.documentElement.classList.contains('low-bandwidth') ? '220px 0px' : '700px 0px',
        threshold: 0.01
      });

      targets.forEach(target => lazyAssetObserver.observe(target));
    }

    // 同步显示即时反馈，并在后台执行剪贴板写入

PromptNotebook.services.initLazyAssets = initLazyAssets;
const initializeLazyAssets = initLazyAssets;
