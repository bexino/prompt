PromptNotebook.components.createNote = function createNote(options = {}) {
  const layout = options.layout || PromptNotebook.core.getStableNoteLayout(`${options.title || ''}\n${options.content || ''}`);
  const theme = options.theme || 'pn-note-yellow';
  const variant = ['a', 'b', 'c'][(options.variant || 0) % 3];
  const color = theme.replace('pn-note-', '');
  const assets = options.assetBaseUrl ? PromptNotebook.config.assets.at(options.assetBaseUrl) : PromptNotebook.config.assets;
  const paper = {
    variant,
    base: assets.note(variant, color)
  };
  const decoration = layout.decoration >= 11 ? null : {
    className: layout.decoration % 2 === 0 ? 'tape' : 'pin',
    src: assets.decor(layout.decoration % 2 === 0 ? 'masking-tape.webp' : 'brass-pin.webp')
  };

  const element = document.createElement('article');
  element.id = options.id || '';
  element.className = `group/card pn-note-card pn-note-variant-${paper.variant} ${theme} aspect-square p-3.5 sm:p-5 lg:p-6 flex flex-col justify-between cursor-pointer relative select-none pn-pressable`;
  element.dataset.pnRole = 'note';
  element.dataset.pnTone = color;
  element.dataset.pnVariant = paper.variant;
  const variables = {
    '--note-rotation': `${layout.rotation}deg`,
    '--note-mobile-rotation': `${layout.mobileRotation}deg`,
    '--note-tab-rotation': `${layout.copyTabRotation}deg`,
    '--note-tab-offset-x': `${layout.copyTabOffsetX}px`,
    '--note-tab-offset-y': `${layout.copyTabOffsetY}px`,
    '--note-x': `${layout.offsetX}px`,
    '--note-y': `${layout.offsetY}px`,
    '--note-origin-x': `${layout.originX}%`,
    '--note-origin-y': `${layout.originY}%`,
    '--note-shadow-x': `${layout.shadowX}px`,
    '--note-shadow-y': `${layout.shadowY}px`,
    '--note-shadow-blur': `${layout.shadowBlur}px`,
    '--note-shadow-opacity': layout.shadowOpacity,
    '--note-contact-shadow-opacity': layout.contactShadowOpacity,
    '--pn-note-variant-brightness': layout.paperBrightness,
    '--pn-note-variant-hover-brightness': layout.paperHoverBrightness
  };
  Object.entries(variables).forEach(([name, value]) => element.style.setProperty(name, value));

  element.innerHTML = `
    <div class="pn-note-paper" aria-hidden="true">
      <img class="pn-note-paper-base pn-lazy-asset" data-src="${paper.base}" loading="lazy" decoding="async" fetchpriority="low" alt="">
    </div>
    ${decoration ? `<img class="pn-note-decoration pn-note-decoration-${decoration.className} pn-lazy-asset" data-src="${decoration.src}" loading="lazy" decoding="async" fetchpriority="low" alt="" aria-hidden="true">` : ''}
    <div class="pn-note-content flex flex-col h-full w-full" data-pn-role="note-content">
      <div class="w-full text-left overflow-hidden">
        <h3 class="text-lg sm:text-xl md:text-2xl lg:text-2xl font-black line-clamp-4 sm:line-clamp-5 leading-snug tracking-tight break-words">${PromptNotebook.core.parseInline(options.title || '')}</h3>
      </div>
    </div>
    <button type="button" class="pn-copy-tab select-none" data-pn-role="note-action" aria-label="复制提示词；复制成功后可查看详情">
      <span class="pn-copy-label-default">${options.copyLabel || '复制'}</span>
      <span class="pn-copy-label-success">查看</span>
    </button>
    <div class="pn-copied-overlay absolute inset-0 flex items-center justify-center pointer-events-none select-none" data-pn-role="note-feedback" aria-live="polite"></div>
  `;

  element.querySelector('.pn-copy-tab')?.addEventListener('click', event => {
    if (element.classList.contains('copied')) {
      event.stopPropagation();
      options.onOpenDetails?.(options, element);
    }
  });
  element.addEventListener('click', () => options.onCopy?.(options, element));
  return element;
};
