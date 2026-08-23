function copyPromptCard(text, promptId, title) {
      const cardEl = document.getElementById(promptId);

      // 1. 立即显示同步反馈
      showCopyFeedback(cardEl, title);

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

function showCopyFeedback(cardEl, title) {
      if (!cardEl) return;

      if (cardEl.copyTimeout) {
        clearTimeout(cardEl.copyTimeout);
      }

      const stickerEl = cardEl.querySelector('.pn-copied-sticker');
      if (stickerEl) {
        const rotationDirection = Math.random() < 0.5 ? -1 : 1;
        const stickerRotation = rotationDirection * (8 + Math.random() * 7);
        const stickerOffsetX = -16 + Math.random() * 32;
        const stickerOffsetY = -16 + Math.random() * 32;
        stickerEl.style.transform = `translate(${stickerOffsetX.toFixed(2)}px, ${stickerOffsetY.toFixed(2)}px) rotate(${stickerRotation.toFixed(2)}deg)`;
        stickerEl.style.animation = 'none';
        void stickerEl.offsetWidth;
        stickerEl.style.removeProperty('animation');
      }

      cardEl.classList.add('copied');

      cardEl.copyTimeout = setTimeout(() => {
        cardEl.classList.remove('copied');
      }, 2000);
    }

PromptNotebook.services.copyPromptCard = copyPromptCard;
