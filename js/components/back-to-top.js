function initBackToTopButton() {
      const button = document.getElementById('pn-back-to-top');
      if (!button || button.dataset.initialized === 'true') return;
      button.dataset.initialized = 'true';

      let scrollFrame = null;
      const updateVisibility = () => {
        scrollFrame = null;
        const isVisible = window.scrollY > 96;
        button.classList.toggle('is-visible', isVisible);
        button.tabIndex = isVisible ? 0 : -1;
        button.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
      };

      window.addEventListener('scroll', () => {
        if (scrollFrame !== null) return;
        scrollFrame = window.requestAnimationFrame(updateVisibility);
      }, { passive: true });
      updateVisibility();

      button.addEventListener('click', () => {
        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: reduceMotion ? 'auto' : 'smooth'
        });
      });
    }

    // 每次访问使用新的页面种子，同一次渲染中的旋转保持稳定

PromptNotebook.components.initBackToTop = initBackToTopButton;
