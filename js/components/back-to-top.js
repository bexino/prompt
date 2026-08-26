function initBackToTopButton() {
      const button = document.getElementById('pn-back-to-top');
      if (!button || button.dataset.initialized === 'true') return;
      button.dataset.initialized = 'true';

      let scrollFrame = null;
      let returnFrame = null;
      let previousScrollBehavior = null;
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

      const cancelReturnAnimation = () => {
        if (returnFrame !== null) {
          window.cancelAnimationFrame(returnFrame);
          returnFrame = null;
        }
        if (previousScrollBehavior !== null) {
          document.documentElement.style.scrollBehavior = previousScrollBehavior;
          previousScrollBehavior = null;
        }
      };

      ['wheel', 'touchstart'].forEach(eventName => {
        window.addEventListener(eventName, cancelReturnAnimation, { passive: true });
      });

      button.addEventListener('click', () => {
        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        cancelReturnAnimation();

        const startY = window.scrollY;
        if (reduceMotion || startY <= 0) {
          window.scrollTo(0, 0);
          return;
        }

        const startTime = performance.now();
        const duration = 560;
        previousScrollBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
        const animateReturn = currentTime => {
          const progress = Math.min((currentTime - startTime) / duration, 1);
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          window.scrollTo(0, Math.round(startY * (1 - easedProgress)));

          if (progress < 1) {
            returnFrame = window.requestAnimationFrame(animateReturn);
          } else {
            returnFrame = null;
            document.documentElement.style.scrollBehavior = previousScrollBehavior;
            previousScrollBehavior = null;
          }
        };

        returnFrame = window.requestAnimationFrame(animateReturn);
      });
    }

    // 每次访问使用新的页面种子，同一次渲染中的旋转保持稳定

PromptNotebook.components.initBackToTop = initBackToTopButton;
