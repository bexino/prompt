function parseAndRender() {
      const parsed = parseMarkdown(rawMarkdown);
      parsedItems = parsed.items;
      updateBrandSubtitle(rawMarkdown);
      return renderExplorer();
    }

function updateBrandSubtitle(markdown) {
      const titleMatch = markdown.match(/^\s*#\s+(.+?)\s*$/m);
      const titleMarkup = titleMatch ? parseInline(titleMatch[1].trim()) : '';
      const subtitles = [
        document.getElementById('brand-subtitle'),
        document.getElementById('classic-brand-subtitle')
      ].filter(Boolean);
      subtitles.forEach(subtitle => { subtitle.innerHTML = titleMarkup; });
      const titleText = subtitles[0]?.textContent.trim() || subtitles[1]?.textContent.trim();
      document.querySelector('.pn-top-bar')?.setAttribute('aria-label', titleText || '页面顶栏');
      document.querySelector('.pn-brand-plaque')?.setAttribute('aria-label', titleText ? `Prompt Systems — ${titleText}` : 'Prompt Systems');
    }

    // 平滑滚动辅助函数

function renderExplorer() {
      const root = document.getElementById('prompts-list-root');
      if (!root) return;
      const fragment = document.createDocumentFragment();
      const categories = parsedItems
        .map((item, index) => ({ item, index }))
        .filter(entry => entry.item.type === 'h2');

      const classicNoteThemes = [
        'pn-note-red',
        'pn-note-orange',
        'pn-note-yellow',
        'pn-note-green',
        'pn-note-blue',
        'pn-note-purple'
      ];
      let promptCounter = 0;

      let i = 0;
      while (i < parsedItems.length) {
        const item = parsedItems[i];

        if (item.type === 'toc') {
          if (categories.length > 0) {
            const tocEl = document.createElement('div');
            tocEl.className = "pn-catalog-panel pn-render-block p-6 sm:p-8 my-6 select-none w-full";

            let tocHtml = `
              <div class="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-500 uppercase tracking-wider mb-4">
                目录
              </div>
              <div class="pn-toc-list">
            `;

            const tocToneFlags = getBalancedTocToneFlags(categories.map(entry => entry.item));

            categories.forEach(({ item: catItem, index: catIdx }, categoryIndex) => {
              const toneClass = tocToneFlags[categoryIndex] ? ' toc-item-deep' : '';
              tocHtml += `
                <a href="#category-${catIdx}" data-target="category-${catIdx}"
                  class="pn-toc-item-link${toneClass} px-6 sm:px-7 py-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 hover:text-slate-950 transition-all text-base sm:text-lg font-extrabold group shadow-xs">
                  <span class="pn-toc-label">${parseInline(catItem.title)}</span>
                  <span class="pn-toc-arrow group-hover:translate-x-1 transition-transform shrink-0">→</span>
                </a>
              `;
            });

            tocHtml += `</div>`;
            tocEl.innerHTML = tocHtml;

            tocEl.querySelectorAll('.pn-toc-item-link').forEach(link => {
              link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('data-target');
                scrollToSection(e, targetId);
              });
            });

            fragment.appendChild(tocEl);
          }
          i++;
        } else if (item.type === 'h2') {
          const h2El = document.createElement('h2');
          const plaqueRotation = getStablePlaqueRotation(item.title);
          h2El.className = "pn-section-plaque text-2xl sm:text-3xl font-extrabold select-none";
          h2El.id = `category-${i}`;
          h2El.style.setProperty('--plaque-rotation', `${plaqueRotation.rotation}deg`);
          h2El.style.setProperty('--plaque-mobile-rotation', `${plaqueRotation.mobileRotation}deg`);
          applyStablePlaqueWear(h2El, item.title);
          h2El.innerHTML = parseInline(item.title);
          fragment.appendChild(h2El);
          i++;
        } else if (item.type === 'h3_heading') {
          const groupEl = document.createElement('section');
          groupEl.className = 'pn-subheading-group pn-render-block w-full';
          const h3El = document.createElement('h3');
          h3El.className = "pn-subheading-slip text-lg sm:text-xl font-bold mt-8 mb-4 select-none w-full";
          h3El.innerHTML = parseInline(item.title);
          groupEl.appendChild(h3El);
          if (parsedItems[i + 1]?.type === 'html') {
            const contentEl = document.createElement('div');
            contentEl.className = 'pn-markdown-paper text-base sm:text-lg leading-relaxed my-3 w-full';
            contentEl.innerHTML = parsedItems[i + 1].content;
            groupEl.appendChild(contentEl);
            i++;
          }
          fragment.appendChild(groupEl);
          i++;
        } else if (item.type === 'divider') {
          const dividerEl = document.createElement('div');
          dividerEl.className = "pn-divider-only w-full";
          dividerEl.innerHTML = item.content;
          fragment.appendChild(dividerEl);
          i++;
        } else if (item.type === 'html') {
          const div = document.createElement('div');
          div.className = "pn-markdown-paper pn-render-block text-base sm:text-lg leading-relaxed my-3 w-full";
          div.innerHTML = item.content;
          fragment.appendChild(div);
          i++;
        } else if (item.type === 'prompt') {
          // 将连续提示词卡片收集到响应式网格中，移动端两列，宽屏最多三列
          const promptGroup = [];
          while (i < parsedItems.length && parsedItems[i].type === 'prompt') {
            promptGroup.push({ item: parsedItems[i], idx: i });
            i++;
          }

          const gridEl = document.createElement('div');
          gridEl.className = "pn-notes-grid grid grid-cols-2 sm:grid-cols-3 my-5 w-full";

          promptGroup.forEach(({ item: promptItem, idx: promptIdx }) => {
            const promptId = `prompt-${promptIdx}`;
            promptCounter++;
            const noteKey = `${promptItem.title}\n${promptItem.code}`;
            const colorTheme = classicNoteThemes[hashString(noteKey) % classicNoteThemes.length];
            const noteLayout = getStableNoteLayout(noteKey);
            const promptEl = PromptNotebook.components.createNote({
              id: promptId,
              title: promptItem.title,
              content: promptItem.code,
              theme: colorTheme,
              variant: (promptCounter - 1) % 3,
              layout: noteLayout,
              onCopy(options) {
                const elegant = PromptNotebook.config.skin.get() === 'elegant';
                copyPromptCard(options.content, promptId, options.title, {
                  duration: elegant ? 4000 : 2000,
                  randomizeSticker: !elegant
                });
              },
              onOpenDetails(options) {
                openCopyDetails(options.title, options.content);
              }
            });
            gridEl.appendChild(promptEl);
          });

          fragment.appendChild(gridEl);
        } else {
          i++;
        }
      }
      root.replaceChildren(fragment);
      return root;
    }

function showErrorOverlay() {
      const errorState = document.getElementById('error-state');
      const root = document.getElementById('prompts-list-root');
      if (!errorState) return;

      const config = getActiveSiteConfig();
      const errorTitle = errorState.querySelector('h3');
      if (errorTitle) errorTitle.textContent = `无法加载同目录的 ${config.filename}`;

      const errorDesc = errorState.querySelector('p');
      if (errorDesc) {
        errorDesc.innerHTML = `
          由于浏览器的安全策略（CORS 限制），直接双击打开本地 HTML 文件时，网页无法主动读取磁盘上的文件。<br>
          <strong>解决办法：</strong><br>
          1. 运行本地 HTTP 服务器打开此页面（如 <code>python -m http.server</code>）。<br>
          2. 或者直接把同目录下的 <code>${config.filename}</code> 拖拽到本页面任意位置来手动导入。
        `;
      }

      const errorBtn = errorState.querySelector('button');
      if (errorBtn) {
        errorBtn.textContent = `手动导入 ${config.filename}`;
      }

      errorState.classList.remove('hidden');
      if (root) root.classList.add('hidden');
      PromptNotebook.components.updateStatusBanner({ visible: window.location.protocol === 'file:', imported: false, filename: config.filename });
    }

function hideErrorOverlay() {
      const errorState = document.getElementById('error-state');
      const root = document.getElementById('prompts-list-root');

      if (errorState) errorState.classList.add('hidden');
      if (root) root.classList.remove('hidden');
    }

Object.assign(PromptNotebook.app, { parseAndRender, renderExplorer, showErrorOverlay, hideErrorOverlay });
