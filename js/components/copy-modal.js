function initCopyDetailModal() {
      const modal = document.getElementById('copy-detail-modal');
      if (!modal || modal.dataset.initialized === 'true') return;
      modal.dataset.initialized = 'true';

      modal.querySelectorAll('.pn-modal-done').forEach(button => {
        button.addEventListener('click', closeCopyDetails);
      });
      modal.addEventListener('click', event => {
        if (event.target === modal) closeCopyDetails();
      });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
          closeCopyDetails();
        }
      });
    }

function openCopyDetails(title, markdown) {
      const modal = document.getElementById('copy-detail-modal');
      const titleEl = document.getElementById('copy-detail-modal-title');
      const contentEl = document.getElementById('copy-detail-modal-content');
      if (!modal || !titleEl || !contentEl) return;

      titleEl.textContent = title || '已复制内容';
      const rendered = renderMarkdownToHtml(markdown || '');
      contentEl.innerHTML = rendered || '<p>复制内容为空。</p>';
      applyStableRibbonRotations(contentEl, `copy:${title || ''}`);
      contentEl.querySelectorAll('.pn-ribbon').forEach(ribbon => {
        ribbon.classList.add('pn-lazy-bg-loaded');
      });
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.classList.add('pn-modal-open');
      modal.querySelector('.pn-modal-frame')?.focus();
    }

function closeCopyDetails() {
      const modal = document.getElementById('copy-detail-modal');
      if (!modal) return;
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.classList.remove('pn-modal-open');
    }

    // 消息提示管理器

Object.assign(PromptNotebook.components, { initCopyDetailModal, openCopyDetails, closeCopyDetails });
