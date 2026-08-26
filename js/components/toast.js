function showToast(message, type = 'success', subtitle = '') {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');

      toast.className = `
        flex items-start justify-between gap-3 p-4.5 rounded-2xl shadow-lg border backdrop-blur-md transform translate-y-2 opacity-0 transition-all duration-300 ease-out max-w-sm w-full
        ${type === 'success'
          ? 'pn-toast-success text-white border-transparent shadow-md'
          : 'bg-white/95 border-rose-500/30 text-slate-800 shadow-rose-500/5'}
      `;

      toast.innerHTML = `
        <div class="flex-1 min-w-0">
          <p class="pn-toast-message text-sm font-semibold leading-relaxed"></p>
        </div>
        <button type="button" class="pn-toast-close ${type === 'success' ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-slate-600'} transition-colors font-bold text-sm" aria-label="关闭消息">
          &times;
        </button>
      `;
      toast.querySelector('.pn-toast-message').textContent = message;
      if (subtitle) {
        const subtitleElement = document.createElement('p');
        subtitleElement.className = `text-xs ${type === 'success' ? 'text-white/80' : 'text-slate-400'} mt-0.5 truncate`;
        subtitleElement.textContent = subtitle;
        toast.firstElementChild.appendChild(subtitleElement);
      }
      toast.querySelector('.pn-toast-close').addEventListener('click', () => toast.remove());

      container.appendChild(toast);

      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
      });

      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        toast.addEventListener('transitionend', () => {
          toast.remove();
        });
      }, 3500);
    }

PromptNotebook.components.showToast = showToast;
