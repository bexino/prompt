let lazyAssetObserver = null;
let noteDetailObserver = null;

function initLazyAssets(scope) {
      if (lazyAssetObserver) lazyAssetObserver.disconnect();
      if (noteDetailObserver) noteDetailObserver.disconnect();

      applyStableRibbonRotations(scope);

      const targets = [
        ...scope.querySelectorAll('.pn-lazy-asset[data-src]'),
        ...scope.querySelectorAll('.pn-ribbon:not(.pn-lazy-bg-loaded)')
      ];
      const noteCards = [...scope.querySelectorAll('.pn-note-card')];

      const loadTarget = target => {
        if (target.classList.contains('pn-ribbon')) {
          target.classList.add('pn-lazy-bg-loaded');
          return;
        }

        const source = target.dataset.src;
        if (!source) return;
        const isNotePaper = target.classList.contains('pn-note-paper-base');
        const isNoteAsset = isNotePaper || target.classList.contains('pn-note-top-shadow');
        if (isNoteAsset) {
          const card = target.closest('.pn-note-card');
          const markReady = () => card?.classList.add(isNotePaper ? 'pn-note-paper-ready' : 'pn-note-assets-ready');
          target.addEventListener('load', markReady, { once: true });
          target.addEventListener('error', () => card?.classList.add('note-assets-failed'), { once: true });
        }
        target.src = source;
        target.removeAttribute('data-src');
        if (isNoteAsset && target.complete && target.naturalWidth > 0) {
          target.closest('.pn-note-card')?.classList.add(isNotePaper ? 'pn-note-paper-ready' : 'pn-note-assets-ready');
        }
      };

      if (!('IntersectionObserver' in window)) {
        targets.forEach(loadTarget);
        noteCards.forEach(card => card.classList.add('pn-note-detail-active'));
        return;
      }

      const isLowBandwidth = document.documentElement.classList.contains('low-bandwidth');
      const isCompactViewport = window.matchMedia('(max-width: 639px)').matches;

      lazyAssetObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          loadTarget(entry.target);
          lazyAssetObserver.unobserve(entry.target);
        });
      }, {
        rootMargin: isLowBandwidth ? '120px 0px' : (isCompactViewport ? '180px 0px' : '320px 0px'),
        threshold: 0.01
      });

      targets.forEach(target => lazyAssetObserver.observe(target));

      noteDetailObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          entry.target.classList.toggle('pn-note-detail-active', entry.isIntersecting);
        });
      }, {
        rootMargin: isLowBandwidth ? '64px 0px' : (isCompactViewport ? '120px 0px' : '240px 0px'),
        threshold: 0.01
      });

      noteCards.forEach(card => noteDetailObserver.observe(card));
    }

    // 同步显示即时反馈，并在后台执行剪贴板写入

PromptNotebook.services.initLazyAssets = initLazyAssets;
const initializeLazyAssets = initLazyAssets;
