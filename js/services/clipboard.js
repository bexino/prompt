function copyPromptCard(text, promptId, title, feedbackOptions = {}) {
      const cardEl = document.getElementById(promptId);

      // 1. 立即显示同步反馈
      showCopyFeedback(cardEl, title, feedbackOptions);

      // 2. 在后台执行剪贴板写入
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .catch(err => {
            console.error('Clipboard copy error: ', err);
            showToast('复制失败，请尝试手动复制', 'error');
          });
      } else {
        try {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          const copied = document.execCommand('copy');
          document.body.removeChild(textarea);
          if (!copied) throw new Error('Fallback copy command returned false');
        } catch (err) {
          console.error('Fallback copy failed: ', err);
          showToast('复制失败，请尝试手动复制', 'error');
        }
      }
    }

    // 剪贴板反馈控制器：保留便签颜色并立即显示贴纸

function showCopyFeedback(cardEl, title, options = {}) {
      if (!cardEl) return;

      if (cardEl.copyTimeout) {
        clearTimeout(cardEl.copyTimeout);
      }

      if (options.randomizeSticker !== false) {
        const rotationDirection = Math.random() < 0.5 ? -1 : 1;
        const stickerRotation = rotationDirection * (8 + Math.random() * 7);
        const stickerOffsetX = -16 + Math.random() * 32;
        const stickerOffsetY = -16 + Math.random() * 32;
        cardEl.style.setProperty('--copied-sticker-x', `${stickerOffsetX.toFixed(2)}px`);
        cardEl.style.setProperty('--copied-sticker-y', `${stickerOffsetY.toFixed(2)}px`);
        cardEl.style.setProperty('--copied-sticker-rotation', `${stickerRotation.toFixed(2)}deg`);
      }

      cardEl.classList.add('copied');
      const feedbackEl = cardEl.querySelector('[data-pn-role="note-feedback"]');
      if (feedbackEl) feedbackEl.textContent = '复制成功';

      cardEl.copyTimeout = setTimeout(() => {
        cardEl.classList.remove('copied');
        if (feedbackEl) feedbackEl.textContent = '';
      }, options.duration || 2000);
    }

PromptNotebook.services.copyPromptCard = copyPromptCard;
