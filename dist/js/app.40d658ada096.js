/* js/config/app-config.js */
function getActiveSiteConfig() {
      const urlParams = new URLSearchParams(window.location.search);
      const siteParam = urlParams.get('site');
      if (siteParam === 'fam') {
        return {
          path: './docs/fam.md',
          filename: 'fam.md'
        };
      }
      return {
        path: './README.md',
        filename: 'README.md'
      };
    }

    // 根据当前站点配置更新动态文本

PromptNotebook.config.getActiveSite = getActiveSiteConfig;

;
/* js/config/asset-manifest.js */
(() => {
  const config = PromptNotebook.config;
  let baseUrl = './assets';
  const join = value => `${baseUrl}/${value}`;
  config.assets = {
    setBaseUrl(value) { baseUrl = String(value || './assets').replace(/\/$/, ''); },
    getBaseUrl() { return baseUrl; },
    branding: name => join(`branding/${name}`),
    decor: name => join(`decor/${name}`),
    texture: name => join(`textures/${name}`),
    note(variant, color) { return join(`notes/note-paper-${variant}-${color}.webp?v=4`); },
    noteShadow(variant, shadow) { return join(`notes/note-top-shadow-${variant}-${shadow}.webp?v=1`); },
    view(skinName) {
      if (skinName !== 'classic') return [];
      return [
        join('branding/prompt-systems-logo.webp?v=2'),
        join('textures/walnut-desk.webp'),
        join('textures/paper-fiber.webp'),
        join('decor/markdown-ribbon-navy.webp'),
        join('decor/copied-sticker-v6.webp?v=7')
      ];
    },
    at(value) {
      const scopedBase = String(value || './assets').replace(/\/$/, '');
      const scopedJoin = name => `${scopedBase}/${name}`;
      return {
        branding: name => scopedJoin(`branding/${name}`),
        decor: name => scopedJoin(`decor/${name}`),
        note: (variant, color) => scopedJoin(`notes/note-paper-${variant}-${color}.webp?v=4`),
        noteShadow: (variant, shadow) => scopedJoin(`notes/note-top-shadow-${variant}-${shadow}.webp?v=1`)
      };
    }
  };
})();

;
/* js/app/state.js */
let rawMarkdown = "";
let parsedItems = [];
PromptNotebook.app.state = {
  get rawMarkdown() { return rawMarkdown; },
  get parsedItems() { return parsedItems; }
};

;
/* js/core/hash.js */
function hashString(value) {
      let hash = 2166136261;
      for (let i = 0; i < value.length; i++) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
      }
      return hash >>> 0;
    }

PromptNotebook.core.hashString = hashString;

;
/* js/core/layout-generator.js */
const pageRotationSeed = (() => {
  if (window.crypto?.getRandomValues) {
    const values = new Uint32Array(2);
    window.crypto.getRandomValues(values);
    return `${values[0]}-${values[1]}`;
  }
  return `${Date.now()}-${Math.random()}`;
})();

function getBalancedTocToneFlags(categories) {
      const count = categories.length;
      if (count === 0) return [];

      const categoryKey = categories.map(item => item.title).join('\n');
      let randomState = hashString(`${pageRotationSeed}:toc-tone-shuffle:${categoryKey}`) || 0x9e3779b9;
      const nextRandom = () => {
        randomState ^= randomState << 13;
        randomState ^= randomState >>> 17;
        randomState ^= randomState << 5;
        return randomState >>> 0;
      };

      const shuffledIndexes = Array.from({ length: count }, (_, index) => index);
      for (let index = count - 1; index > 0; index--) {
        const swapIndex = nextRandom() % (index + 1);
        [shuffledIndexes[index], shuffledIndexes[swapIndex]] = [shuffledIndexes[swapIndex], shuffledIndexes[index]];
      }

      const deepCount = Math.floor(count / 2) + (count % 2 === 1 && (nextRandom() & 1) === 1 ? 1 : 0);
      const flags = Array(count).fill(false);
      shuffledIndexes.slice(0, deepCount).forEach(index => {
        flags[index] = true;
      });
      return flags;
    }

function getStableNoteLayout(key) {
      const hash = hashString(key);
      const rotationHash = hashString(`${pageRotationSeed}:note:${key}`);
      const copyTabRotationHash = hashString(`${pageRotationSeed}:copy-tab:${key}`);
      const copyTabOffsetHash = hashString(`${pageRotationSeed}:copy-tab-offset:${key}`);
      const decorationHash = hashString(`${pageRotationSeed}:decoration:${key}`);
      let rotation = -5 + ((rotationHash % 1001) / 1000) * 10;
      const copyTabRotation = -5 + ((copyTabRotationHash % 1001) / 1000) * 10;
      const copyTabOffsetX = copyTabOffsetHash % 7;
      const copyTabOffsetY = -((copyTabOffsetHash >>> 8) % 7);
      if (Math.abs(rotation) < 0.7) {
        rotation = (rotationHash & 1) === 0 ? -1.1 : 1.1;
      }

      return {
        rotation: rotation.toFixed(2),
        mobileRotation: rotation.toFixed(2),
        copyTabRotation: copyTabRotation.toFixed(2),
        copyTabOffsetX,
        copyTabOffsetY,
        offsetX: ((hash >>> 11) % 27) - 13,
        offsetY: ((hash >>> 16) % 21) - 10,
        originX: 47 + ((hash >>> 19) % 7),
        originY: 48 + ((hash >>> 22) % 8),
        shadowX: -6 + ((hash >>> 3) % 13),
        shadowY: 10 + ((hash >>> 6) % 9),
        shadowBlur: 5 + ((hash >>> 9) % 6),
        shadowOpacity: (0.58 + ((hash >>> 13) % 15) / 100).toFixed(2),
        contactShadowOpacity: (0.64 + ((hash >>> 18) % 17) / 100).toFixed(2),
        paperBrightness: (0.94 + ((hash >>> 24) % 6) / 100).toFixed(2),
        paperHoverBrightness: (0.98 + ((hash >>> 24) % 5) / 100).toFixed(2),
        topShadowVariant: (hash >>> 5) % 3,
        topShadowOpacity: (0.18 + ((hash >>> 18) % 21) / 100).toFixed(2),
        decoration: decorationHash % 20
      };
    }

function getStablePlaqueRotation(key) {
      const hash = hashString(`${pageRotationSeed}:plaque:${key}`);
      let rotation = -5 + ((hash % 1001) / 1000) * 10;
      if (Math.abs(rotation) < 1.2) {
        rotation = (hash & 1) === 0 ? -1.2 : 1.2;
      }

      return {
        rotation: rotation.toFixed(2),
        mobileRotation: (rotation * 0.65).toFixed(2)
      };
    }

function applyStableRibbonRotations(scope, namespace = 'page') {
      scope.querySelectorAll('.pn-ribbon').forEach((ribbon, index) => {
        const hash = hashString(`${pageRotationSeed}:ribbon:${namespace}:${index}`);
        const rotation = -5 + ((hash % 1001) / 1000) * 10;
        ribbon.style.setProperty('--ribbon-rotation', `${rotation.toFixed(2)}deg`);
      });
    }

function getStablePlaqueWear(key) {
      let state = hashString(`plaque-wear:${key}`);
      const random = () => {
        state += 0x6D2B79F5;
        let value = state;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
      };
      const between = (min, max) => min + random() * (max - min);

      return {
        aX: between(7, 31).toFixed(1),
        aY: between(19, 79).toFixed(1),
        aSize: between(4.5, 9).toFixed(1),
        aChip2Size: between(1.4, 3.6).toFixed(1),
        aAlpha: between(0.32, 0.55).toFixed(2),
        aLightAlpha: between(0.15, 0.31).toFixed(2),
        aChipDx: between(-3.2, 3.2).toFixed(1),
        aChipDy: between(-11, 11).toFixed(1),
        aChip2Dx: between(-3, 3).toFixed(1),
        aChip2Dy: between(-10, 10).toFixed(1),
        bX: between(38, 76).toFixed(1),
        bY: between(22, 82).toFixed(1),
        bSize: between(6, 11.5).toFixed(1),
        bChip2Size: between(1.6, 4.2).toFixed(1),
        bAlpha: between(0.35, 0.58).toFixed(2),
        bLightAlpha: between(0.16, 0.32).toFixed(2),
        bChipDx: between(-3.2, 3.2).toFixed(1),
        bChipDy: between(-12, 12).toFixed(1),
        bChip2Dx: between(-3, 3).toFixed(1),
        bChip2Dy: between(-10, 10).toFixed(1),
        cX: between(78, 94).toFixed(1),
        cY: between(18, 76).toFixed(1),
        cSize: between(3, 6.5).toFixed(1),
        cAlpha: between(0.2, 0.38).toFixed(2),
        scratchAngle: between(166, 188).toFixed(1),
        scratchStop: between(28, 72).toFixed(1),
        scratch2Angle: between(82, 108).toFixed(1),
        scratch2Stop: between(24, 76).toFixed(1)
      };
    }

function applyStablePlaqueWear(element, key) {
      if (!element) return;
      const wear = getStablePlaqueWear(key);
      element.style.setProperty('--wear-a-x', `${wear.aX}%`);
      element.style.setProperty('--wear-a-y', `${wear.aY}%`);
      element.style.setProperty('--wear-a-size', `${wear.aSize}px`);
      element.style.setProperty('--wear-a-chip-size', `${(Number(wear.aSize) * 0.46).toFixed(1)}px`);
      element.style.setProperty('--wear-a-chip2-size', `${wear.aChip2Size}px`);
      element.style.setProperty('--wear-a-alpha', wear.aAlpha);
      element.style.setProperty('--wear-a-light-alpha', wear.aLightAlpha);
      element.style.setProperty('--wear-a-chip-dx', `${wear.aChipDx}%`);
      element.style.setProperty('--wear-a-chip-dy', `${wear.aChipDy}%`);
      element.style.setProperty('--wear-a-chip2-dx', `${wear.aChip2Dx}%`);
      element.style.setProperty('--wear-a-chip2-dy', `${wear.aChip2Dy}%`);
      element.style.setProperty('--wear-b-x', `${wear.bX}%`);
      element.style.setProperty('--wear-b-y', `${wear.bY}%`);
      element.style.setProperty('--wear-b-size', `${wear.bSize}px`);
      element.style.setProperty('--wear-b-chip-size', `${(Number(wear.bSize) * 0.42).toFixed(1)}px`);
      element.style.setProperty('--wear-b-chip2-size', `${wear.bChip2Size}px`);
      element.style.setProperty('--wear-b-alpha', wear.bAlpha);
      element.style.setProperty('--wear-b-light-alpha', wear.bLightAlpha);
      element.style.setProperty('--wear-b-chip-dx', `${wear.bChipDx}%`);
      element.style.setProperty('--wear-b-chip-dy', `${wear.bChipDy}%`);
      element.style.setProperty('--wear-b-chip2-dx', `${wear.bChip2Dx}%`);
      element.style.setProperty('--wear-b-chip2-dy', `${wear.bChip2Dy}%`);
      element.style.setProperty('--wear-c-x', `${wear.cX}%`);
      element.style.setProperty('--wear-c-y', `${wear.cY}%`);
      element.style.setProperty('--wear-c-size', `${wear.cSize}px`);
      element.style.setProperty('--wear-c-alpha', wear.cAlpha);
      element.style.setProperty('--wear-scratch-angle', `${wear.scratchAngle}deg`);
      element.style.setProperty('--wear-scratch-stop', `${wear.scratchStop}%`);
      element.style.setProperty('--wear-scratch2-angle', `${wear.scratch2Angle}deg`);
      element.style.setProperty('--wear-scratch2-stop', `${wear.scratch2Stop}%`);
    }

function getNoteDecoration(decoration) {
  if (decoration >= 11) return null;
  return decoration % 2 === 0
    ? { className: 'tape', src: PromptNotebook.config.assets.decor('masking-tape.webp') }
    : { className: 'pin', src: PromptNotebook.config.assets.decor('brass-pin.webp') };
}

function getNotePaper(variant, colorTheme, shadowVariant) {
  const paperVariant = ['a', 'b', 'c'][variant % 3];
  const color = String(colorTheme || 'yellow').replace('pn-note-', '');
  return {
    variant: paperVariant,
    base: PromptNotebook.config.assets.note(paperVariant, color)
  };
}

Object.assign(PromptNotebook.core, { getBalancedTocToneFlags, getStableNoteLayout, getStablePlaqueRotation, applyStableRibbonRotations, getStablePlaqueWear, applyStablePlaqueWear, getNoteDecoration, getNotePaper });

;
/* js/core/markdown-inline.js */
function parseInline(text) {
      if (!text) return '';
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-slate-950">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-slate-900">$1</em>')
        .replace(/`([^`]+)`/g, '<code class="pn-inline-code text-sm sm:text-base font-mono">$1</code>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 hover:underline font-bold transition-colors">$1</a>');
    }

    // 将 Markdown 文本块转换为符合大字号可读性要求的 HTML

PromptNotebook.core.parseInline = parseInline;

;
/* js/core/markdown-renderer.js */
function renderMarkdownToHtml(mdText) {
      if (!mdText.trim()) return '';

      const lines = mdText.split('\n');
      const result = [];
      let inList = null;
      let inTable = false;

      function closeList() {
        if (inList) {
          result.push(`</${inList}>`);
          inList = null;
        }
      }

      function closeTable() {
        if (inTable) {
          result.push('</tbody></table></div>');
          inTable = false;
        }
      }

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let trimmed = line.trim();

        let isQuote = false;
        if (trimmed.startsWith('>')) {
          isQuote = true;
          trimmed = trimmed.replace(/^>\s?/, '');
        }

        if (trimmed === '---' || trimmed === '***') {
          closeList();
          closeTable();
          result.push('<div class="pn-ribbon" role="separator" aria-hidden="true"></div>');
          continue;
        }

        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          closeList();
          const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
          if (cells.every(c => /^:?-+:?$/.test(c))) continue;

          if (!inTable) {
            inTable = true;
            result.push('<div class="pn-table-wrap"><table class="pn-table text-sm sm:text-base text-left"><thead><tr>');
            cells.forEach(c => result.push(`<th class="px-4.5 py-3.5 text-base sm:text-lg">${parseInline(c)}</th>`));
            result.push('</tr></thead><tbody>');
          } else {
            result.push('<tr>');
            cells.forEach(c => result.push(`<td class="px-4.5 py-3.5 leading-relaxed">${parseInline(c)}</td>`));
            result.push('</tr>');
          }
          continue;
        } else {
          closeTable();
        }

        if (trimmed.startsWith('# ')) {
          closeList();
          result.push(`<h1 class="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter my-8 sm:my-12 leading-none select-none">${parseInline(trimmed.substring(2))}</h1>`);
          continue;
        }
        if (trimmed.startsWith('## ')) {
          closeList();
          result.push(`<h2>${parseInline(trimmed.substring(3))}</h2>`);
          continue;
        }
        if (trimmed.startsWith('### ')) {
          closeList();
          result.push(`<h3>${parseInline(trimmed.substring(4))}</h3>`);
          continue;
        }
        if (trimmed.startsWith('#### ')) {
          closeList();
          result.push(`<h4 class="text-lg sm:text-xl font-bold text-slate-900 my-4">${parseInline(trimmed.substring(5))}</h4>`);
          continue;
        }

        const ulMatch = trimmed.match(/^[-*]\s+(.*)/);
        if (ulMatch) {
          if (inList !== 'ul') {
            closeList();
            inList = 'ul';
            result.push('<ul class="list-disc list-inside space-y-2.5 my-4 text-base sm:text-lg text-slate-800 leading-relaxed">');
          }
          result.push(`<li>${parseInline(ulMatch[1])}</li>`);
          continue;
        }

        const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (olMatch) {
          if (inList !== 'ol') {
            closeList();
            inList = 'ol';
            result.push('<ol class="list-decimal list-inside space-y-2.5 my-4 text-base sm:text-lg text-slate-800 leading-relaxed">');
          }
          result.push(`<li value="${Number.parseInt(olMatch[1], 10)}">${parseInline(olMatch[2])}</li>`);
          continue;
        }

        closeList();

        if (trimmed) {
          const inlineContent = parseInline(trimmed);
          if (isQuote) {
            result.push(`<blockquote class="pn-markdown-quote text-base sm:text-lg italic">${inlineContent}</blockquote>`);
          } else {
            result.push(`<p class="text-base sm:text-lg text-slate-800 my-3 leading-relaxed">${inlineContent}</p>`);
          }
        }
      }

      closeList();
      closeTable();
      return result.join('');
    }

    // Markdown 解析器：二级标题为分类，三级标题为子标题，代码块为可复制提示词

PromptNotebook.core.renderMarkdownToHtml = renderMarkdownToHtml;

;
/* js/core/prompt-parser.js */
function parseMarkdown(mdText) {
      const lines = mdText.split(/\r?\n/);
      const items = [];
      let pendingTextLines = [];
      let lastHeadingTitle = "";

      function flushPendingText() {
        if (pendingTextLines.length === 0) return;
        const html = renderMarkdownToHtml(pendingTextLines.join('\n'));
        if (html.trim()) {
          items.push({ type: 'html', content: html });
        }
        pendingTextLines = [];
      }

      let i = 0;
      while (i < lines.length) {
        const line = lines[i];
        const cleanLine = line.trim();

        if (cleanLine === '[TOC]') {
          flushPendingText();
          items.push({ type: 'toc' });
          i++;
          continue;
        }

        // 匹配代码块：```
        if (/^`{3}(?!`)/.test(cleanLine)) {
          flushPendingText();
          const codeLines = [];
          i++;
          while (i < lines.length) {
            if (/^`{3}(?!`)/.test(lines[i].trim())) {
              i++;
              break;
            }
            codeLines.push(lines[i]);
            i++;
          }
          const code = codeLines.join('\n');

          let title = lastHeadingTitle || "一键复制 Prompt";
          if (items.length > 0 && items[items.length - 1].type === 'h3_heading') {
            title = items[items.length - 1].title;
            items.pop();
          }

          items.push({ type: 'prompt', title, code });
          lastHeadingTitle = "";
          continue;
        }

        // 页面标题已经由顶部皮革铭牌呈现
        if (cleanLine.startsWith('# ') && !cleanLine.startsWith('## ')) {
          flushPendingText();
          i++;
          continue;
        }

        if (cleanLine === '---' || cleanLine === '***') {
          flushPendingText();
          items.push({
            type: 'divider',
            content: '<div class="pn-ribbon" role="separator" aria-hidden="true"></div>'
          });
          i++;
          continue;
        }

        // 匹配二级标题（分类）
        if (cleanLine.startsWith('## ')) {
          flushPendingText();
          const title = cleanLine.substring(3).trim();
          items.push({ type: 'h2', title });
          lastHeadingTitle = title;
          i++;
          continue;
        }

        // 匹配三级标题（标题）
        if (cleanLine.startsWith('### ')) {
          flushPendingText();
          const title = cleanLine.substring(4).trim();
          items.push({ type: 'h3_heading', title });
          lastHeadingTitle = title;
          i++;
          continue;
        }

        pendingTextLines.push(line);
        i++;
      }

      flushPendingText();
      return { items };
    }

    // 核心解析与渲染控制器

PromptNotebook.core.parseMarkdown = parseMarkdown;

;
/* js/services/local-storage.js */
PromptNotebook.services.storage = {
  read() {
    const content = localStorage.getItem('local_readme_content');
    return content ? { content, filename: localStorage.getItem('local_readme_filename') || '', updated: localStorage.getItem('local_readme_updated') || '' } : null;
  },
  write(content, filename) {
    localStorage.setItem('local_readme_content', content);
    localStorage.setItem('local_readme_filename', filename);
    localStorage.setItem('local_readme_updated', new Date().toLocaleString());
  },
  clear() {
    localStorage.removeItem('local_readme_content');
    localStorage.removeItem('local_readme_filename');
    localStorage.removeItem('local_readme_updated');
  }
};

;
/* js/services/content-loader.js */
PromptNotebook.services.loadContent = async function loadContent(site) {
  const response = await fetch(site.path, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
};

;
/* js/services/lazy-assets.js */
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
        return;
      }

      lazyAssetObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          loadTarget(entry.target);
          lazyAssetObserver.unobserve(entry.target);
        });
      }, {
        rootMargin: document.documentElement.classList.contains('low-bandwidth') ? '160px 0px' : '320px 0px',
        threshold: 0.01
      });

      targets.forEach(target => lazyAssetObserver.observe(target));
    }

    // 同步显示即时反馈，并在后台执行剪贴板写入

PromptNotebook.services.initLazyAssets = initLazyAssets;
const initializeLazyAssets = initLazyAssets;

;
/* js/components/ribbon.js */
PromptNotebook.components.createRibbon = function createRibbon(options = {}) {
  const element = document.createElement('div');
  element.className = 'pn-ribbon';
  element.dataset.pnRole = 'divider';
  element.setAttribute('role', 'separator');
  element.setAttribute('aria-hidden', 'true');
  if (options.rotation != null) element.style.setProperty('--ribbon-rotation', `${options.rotation}deg`);
  return element;
};

;
/* js/components/brand-plaque.js */
PromptNotebook.components.createPlaque = function createPlaque(options = {}) {
  const element = document.createElement('header');
  element.className = 'pn-brand-plaque';
  element.dataset.pnRole = 'brand';
  const image = document.createElement('img');
  image.className = 'pn-brand-plaque-logo pn-lazy-asset';
  image.dataset.pnClassicAsset = '';
  const assets = options.assetBaseUrl ? PromptNotebook.config.assets.at(options.assetBaseUrl) : PromptNotebook.config.assets;
  image.dataset.src = options.logo || assets.branding('prompt-systems-logo.webp?v=2');
  image.alt = options.logoAlt || 'Prompt Systems';
  const title = document.createElement('h1');
  title.textContent = options.title || '';
  element.append(image, title);
  return element;
};

;
/* js/components/top-bar.js */
PromptNotebook.components.createTopBar = function createTopBar(options = {}) {
  const element = document.createElement('header');
  element.className = `pn-top-bar${options.sticky === false ? ' pn-top-bar-static' : ''}${options.className ? ` ${options.className}` : ''}`;
  element.dataset.pnRole = 'top-bar';
  element.setAttribute('aria-label', options.ariaLabel || options.title || '页面顶栏');

  if (options.backgroundColor) {
    element.style.setProperty('--pn-top-bar-background', options.backgroundColor);
  }
  if (options.actionColor) {
    element.style.setProperty('--pn-top-bar-action-background', options.actionColor);
  }
  if (options.contentWidth) {
    element.style.setProperty('--pn-top-bar-content-width', options.contentWidth);
  }

  const inner = document.createElement('div');
  inner.className = 'pn-top-bar-inner';

  const title = document.createElement('h1');
  title.className = 'pn-top-bar-title';
  title.id = options.titleId || '';
  title.textContent = options.title || '';

  const actions = document.createElement('div');
  actions.className = 'pn-top-bar-actions';
  actions.setAttribute('aria-label', options.actionsLabel || '页面操作');

  (options.actions || []).forEach(action => {
    if (action?.element instanceof Element) {
      actions.append(action.element);
      return;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `pn-top-bar-action${action?.className ? ` ${action.className}` : ''}`;
    button.id = action?.id || '';
    button.textContent = action?.label || '';
    if (action?.title) button.title = action.title;
    if (action?.ariaLabel) button.setAttribute('aria-label', action.ariaLabel);
    if (action?.ariaPressed !== undefined) button.setAttribute('aria-pressed', String(action.ariaPressed));
    if (action?.disabled) button.disabled = true;
    Object.entries(action?.dataset || {}).forEach(([name, value]) => {
      button.dataset[name] = String(value);
    });
    if (typeof action?.onClick === 'function') button.addEventListener('click', action.onClick);
    actions.append(button);
  });

  inner.append(title, actions);
  element.append(inner);
  return element;
};

;
/* js/components/markdown-content.js */
PromptNotebook.components.createMarkdownContent = function createMarkdownContent(options = {}) {
  const element = document.createElement('div');
  element.className = options.className || 'pn-markdown-paper';
  element.dataset.pnRole = 'content';
  element.innerHTML = PromptNotebook.core.renderMarkdownToHtml(options.markdown || '');
  return element;
};

;
/* js/components/table-of-contents.js */
PromptNotebook.components.createTableOfContents = function createTableOfContents(options = {}) {
  const nav = document.createElement('nav');
  nav.className = 'pn-catalog-panel';
  nav.dataset.pnRole = 'toc';
  for (const item of options.items || []) {
    const link = document.createElement('a');
    link.className = 'pn-toc-item-link';
    link.href = `#${item.id}`;
    link.textContent = item.title;
    nav.append(link);
  }
  return nav;
};

;
/* js/components/note-card.js */
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

;
/* js/components/status-banner.js */
PromptNotebook.components.updateStatusBanner = function updateStatusBanner(options = {}) {
  const banner = document.getElementById('local-mode-banner');
  const statusText = document.getElementById('local-mode-status-text');
  const resetButton = document.getElementById('local-mode-reset-btn');
  if (!banner || !statusText || !resetButton) return;
  if (!options.visible) {
    banner.classList.add('hidden');
    return;
  }
  banner.classList.remove('hidden');
  if (options.imported) {
    statusText.innerHTML = `<h4 class="font-semibold text-slate-800 text-sm">已载入自定义配置</h4><p class="text-xs text-slate-500 mt-0.5">正在使用导入的 <strong>${options.filename}</strong>（更新于 ${options.updated}）。更改文件后可重新拖入。</p>`;
    resetButton.classList.remove('hidden');
  } else {
    statusText.innerHTML = `<h4 class="font-semibold text-slate-800 text-sm">本地离线模式</h4><p class="text-xs text-slate-500 mt-0.5">由于浏览器安全限制，无法自动加载您的 ${options.filename} 修改。请拖拽修改后的文件到此处，或点击导入。</p>`;
    resetButton.classList.add('hidden');
  }
};

;
/* js/components/back-to-top.js */
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

;
/* js/components/copy-modal.js */
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

;
/* js/components/toast.js */
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

;
/* js/components/drag-overlay.js */
PromptNotebook.components.getDragOverlay = function getDragOverlay() { return document.getElementById('drag-overlay'); };

;
/* js/components/loading-screen.js */
(() => {
  function getElements() {
    return {
      screen: document.getElementById('pn-loading-screen'),
      status: document.getElementById('pn-loading-status'),
      progress: document.getElementById('pn-loading-progress')
    };
  }

  function showLoadingScreen(message = '正在准备页面…') {
    const elements = getElements();
    document.body.classList.add('pn-loading');
    document.body.setAttribute('aria-busy', 'true');
    if (elements.screen) elements.screen.hidden = false;
    if (elements.status) elements.status.textContent = message;
    if (elements.progress) elements.progress.style.width = '0%';
  }

  function updateLoadingScreen({ message, completed = 0, total = 0 } = {}) {
    const elements = getElements();
    if (message && elements.status) elements.status.textContent = message;
    if (elements.progress) {
      const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
      elements.progress.style.width = `${percentage}%`;
    }
  }

  function hideLoadingScreen() {
    const elements = getElements();
    document.body.classList.remove('pn-loading');
    document.body.setAttribute('aria-busy', 'false');
    if (elements.screen) elements.screen.hidden = true;
  }

  Object.assign(PromptNotebook.components, { showLoadingScreen, updateLoadingScreen, hideLoadingScreen });
})();

;
/* js/services/file-import.js */
PromptNotebook.services.readMarkdownFile = function readMarkdownFile(file) {
  if (!file?.name?.toLowerCase().endsWith('.md')) return Promise.reject(new Error('请选择 Markdown 文件'));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => resolve({ content: String(event.target.result || ''), filename: file.name });
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file);
  });
};

PromptNotebook.services.watchFileDrops = function watchFileDrops(options = {}) {
  let depth = 0;
  window.addEventListener('dragenter', event => {
    event.preventDefault();
    depth += 1;
    options.onDragState?.(true);
  });
  window.addEventListener('dragover', event => event.preventDefault());
  window.addEventListener('dragleave', event => {
    event.preventDefault();
    depth = Math.max(0, depth - 1);
    if (depth === 0) options.onDragState?.(false);
  });
  window.addEventListener('drop', event => {
    event.preventDefault();
    depth = 0;
    options.onDragState?.(false);
    if (event.dataTransfer.files.length) options.onFile?.(event.dataTransfer.files[0]);
  });
};

;
/* js/services/clipboard.js */
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

;
/* js/services/view-assets.js */
(() => {
  const resourceTimeout = 15000;
  const viewTimeout = 30000;

  function withTimeout(promise, timeout, message) {
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error(message)), timeout);
      promise.then(
        value => { window.clearTimeout(timer); resolve(value); },
        error => { window.clearTimeout(timer); reject(error); }
      );
    });
  }

  async function decodeImage(url, targets) {
    const probe = new Image();
    probe.decoding = 'async';
    const loaded = new Promise((resolve, reject) => {
      probe.addEventListener('load', resolve, { once: true });
      probe.addEventListener('error', () => reject(new Error(`图片加载失败：${url}`)), { once: true });
    });
    probe.src = url;
    await withTimeout(
      probe.complete && probe.naturalWidth > 0 ? Promise.resolve() : loaded,
      resourceTimeout,
      `图片加载超时：${url}`
    );
    if (typeof probe.decode === 'function') {
      await Promise.race([
        probe.decode().catch(() => {}),
        new Promise(resolve => window.setTimeout(resolve, 3000))
      ]);
    }

    await Promise.all(targets.map(async target => {
      const targetLoaded = new Promise((resolve, reject) => {
        target.addEventListener('load', resolve, { once: true });
        target.addEventListener('error', reject, { once: true });
      });
      target.src = url;
      target.removeAttribute('data-src');
      if (!(target.complete && target.naturalWidth > 0)) {
        await withTimeout(targetLoaded, resourceTimeout, `卡片图片加载超时：${url}`);
      }
      if (typeof target.decode === 'function') {
        await Promise.race([
          target.decode().catch(() => {}),
          new Promise(resolve => window.setTimeout(resolve, 3000))
        ]);
      }
      if (target.classList.contains('pn-note-paper-base')) {
        target.closest('.pn-note-card')?.classList.add('pn-note-paper-ready');
      }
    }));
  }

  function collectImageResources(scope, skinName) {
    const resources = new Map();
    const add = (url, target = null) => {
      if (!url) return;
      if (!resources.has(url)) resources.set(url, []);
      if (target) resources.get(url).push(target);
    };

    PromptNotebook.config.assets.view(skinName).forEach(url => add(url));
    if (skinName === 'classic') {
      scope.querySelectorAll('img[data-src]').forEach(target => add(target.dataset.src, target));
      document.querySelectorAll('img[data-pn-classic-asset][src]').forEach(target => add(target.getAttribute('src')));
    }
    return resources;
  }

  function getFontTasks(skinName) {
    if (!document.fonts?.load) return [];
    const fonts = skinName === 'classic'
      ? [
          ['400 16px "Gelasio Local"', 'Prompt Systems'],
          ['400 16px "Prompt Source Han Serif SC"', '正在加载经典主题']
        ]
      : [['400 16px "Geist Local"', 'Prompt Systems']];
    return fonts.map(([font, sample]) => async () => {
      const loaded = await withTimeout(document.fonts.load(font, sample), resourceTimeout, `字体加载超时：${font}`);
      if (!loaded.length) throw new Error(`字体加载失败：${font}`);
    });
  }

  async function preloadViewAssets(scope, skinName) {
    const label = skinName === 'classic' ? '经典主题' : '典雅主题';
    const imageResources = collectImageResources(scope, skinName);
    const tasks = [
      ...[...imageResources.entries()].map(([url, targets]) => () => decodeImage(url, targets)),
      ...getFontTasks(skinName)
    ];
    let completed = 0;
    const failures = [];
    PromptNotebook.components.updateLoadingScreen({ message: `正在加载${label} 0/${tasks.length}`, completed, total: tasks.length });

    const work = Promise.all(tasks.map(async task => {
      try {
        await task();
      } catch (error) {
        failures.push(error);
      } finally {
        completed += 1;
        PromptNotebook.components.updateLoadingScreen({
          message: `正在加载${label} ${completed}/${tasks.length}`,
          completed,
          total: tasks.length
        });
      }
    }));

    let timedOut = false;
    await Promise.race([
      work,
      new Promise(resolve => window.setTimeout(() => { timedOut = true; resolve(); }, viewTimeout))
    ]);
    return { completed, total: tasks.length, failures, timedOut };
  }

  PromptNotebook.services.preloadViewAssets = preloadViewAssets;
})();

;
/* js/app/explorer-renderer.js */
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

;
/* js/app/view-coordinator.js */
(() => {
  async function prepareAndReveal({ render = false, message = '正在准备页面…', alreadyVisible = false } = {}) {
    if (!alreadyVisible) PromptNotebook.components.showLoadingScreen(message);
    const root = render
      ? PromptNotebook.app.parseAndRender()
      : document.getElementById('prompts-list-root');
    if (!root) {
      PromptNotebook.components.hideLoadingScreen();
      return { completed: 0, total: 0, failures: [], timedOut: false };
    }

    try {
      const result = await PromptNotebook.services.preloadViewAssets(root, PromptNotebook.config.skin.get());
      PromptNotebook.services.initLazyAssets(root);
      if (result.failures.length || result.timedOut) {
        console.warn('部分页面资源未能在限定时间内完成，已使用降级显示。', result);
      }
      return result;
    } finally {
      PromptNotebook.components.hideLoadingScreen();
    }
  }

  PromptNotebook.app.prepareAndReveal = prepareAndReveal;
})();

;
/* js/app/event-controller.js */
function updateDynamicTexts() {
      const config = getActiveSiteConfig();
      const dragOverlayFilename = document.getElementById('drag-overlay-filename');
      if (dragOverlayFilename) {
        dragOverlayFilename.textContent = config.filename;
      }
    }

    // 初始化应用

function scrollToSection(event, id) {
      if (event) event.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        const headerOffset = 40;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }

async function applyImportedFile(file) {
  try {
    const imported = await PromptNotebook.services.readMarkdownFile(file);
    rawMarkdown = imported.content;
    PromptNotebook.services.storage.write(imported.content, imported.filename);
    await PromptNotebook.app.prepareAndReveal({ render: true, message: `正在载入 ${imported.filename}…` });
    PromptNotebook.components.updateStatusBanner({ visible: window.location.protocol === 'file:', imported: true, filename: imported.filename, updated: new Date().toLocaleString() });
    PromptNotebook.components.showToast(`${imported.filename} 导入成功并已更新`, 'success');
  } catch (error) {
    PromptNotebook.components.showToast(error.message || '读取文件失败，请重试', 'error');
  }
}

function initPageEvents() {
  const input = document.getElementById('local-file-input');
  const skinToggles = [...document.querySelectorAll('[data-pn-skin-toggle]')];
  document.getElementById('local-import-btn')?.addEventListener('click', () => input?.click());
  document.getElementById('error-import-btn')?.addEventListener('click', () => input?.click());
  const updateSkinToggle = () => {
    const useElegantSkin = PromptNotebook.config.skin.get() === 'elegant';
    skinToggles.forEach(skinToggle => {
      skinToggle.setAttribute('aria-pressed', String(useElegantSkin));
      skinToggle.title = useElegantSkin ? '切换为经典拟物皮肤' : '切换为优雅扁平皮肤';
    });
  };
  const toggleSkin = async () => {
    if (skinToggles.some(skinToggle => skinToggle.getAttribute('aria-busy') === 'true')) return;
    skinToggles.forEach(skinToggle => skinToggle.setAttribute('aria-busy', 'true'));
    PromptNotebook.components.showLoadingScreen('正在切换主题…');
    try {
      const selected = await PromptNotebook.config.skin.toggle();
      PromptNotebook.config.font.followSkin(selected);
      if (selected === 'classic') {
        document.querySelectorAll('[data-pn-classic-asset][data-pn-asset]').forEach(element => {
          const [group, name] = element.dataset.pnAsset.split(':');
          const attribute = element.dataset.pnAssetAttribute || 'src';
          if (PromptNotebook.config.assets[group]) element.setAttribute(attribute, PromptNotebook.config.assets[group](name));
        });
      }
      await PromptNotebook.app.prepareAndReveal({ alreadyVisible: true });
      updateSkinToggle();
    } catch (error) {
      PromptNotebook.components.showToast(error.message || '皮肤加载失败，请重试', 'error');
    } finally {
      PromptNotebook.components.hideLoadingScreen();
      skinToggles.forEach(skinToggle => skinToggle.removeAttribute('aria-busy'));
    }
  };
  skinToggles.forEach(skinToggle => skinToggle.addEventListener('click', toggleSkin));
  updateSkinToggle();
  document.getElementById('local-mode-reset-btn')?.addEventListener('click', () => {
    PromptNotebook.services.storage.clear();
    window.location.reload();
  });
  input?.addEventListener('change', event => {
    if (event.target.files.length) applyImportedFile(event.target.files[0]);
    event.target.value = '';
  });
  PromptNotebook.services.watchFileDrops({
    onDragState(visible) { document.getElementById('drag-overlay')?.classList.toggle('hidden', !visible); },
    onFile: applyImportedFile
  });
}

Object.assign(PromptNotebook.app, { updateDynamicTexts, scrollToSection, initPageEvents, applyImportedFile });

;
/* js/app/bootstrap.js */
(() => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const constrained = connection && (connection.saveData || /(^|-)2g$/i.test(connection.effectiveType || ''));
  if (constrained) document.documentElement.classList.add('low-bandwidth');
})();

window.addEventListener('DOMContentLoaded', async () => {
  try {
    await PromptNotebook.config.skin.ready();
  } catch (error) {
    console.warn('当前皮肤样式加载失败，页面将继续使用基础结构样式：', error);
  }
  document.querySelectorAll('[data-pn-asset]').forEach(element => {
    if (PromptNotebook.config.skin.get() === 'elegant' && element.hasAttribute('data-pn-classic-asset')) return;
    const [group, name] = element.dataset.pnAsset.split(':');
    const attribute = element.dataset.pnAssetAttribute || 'src';
    if (PromptNotebook.config.assets[group]) element.setAttribute(attribute, PromptNotebook.config.assets[group](name));
  });
  const topBarRoot = document.getElementById('app-top-bar-root');
  if (topBarRoot) {
    topBarRoot.replaceChildren(PromptNotebook.components.createTopBar({
      title: '一键复制库',
      titleId: 'brand-subtitle',
      className: 'pn-app-elegant-top-bar',
      actionsLabel: '页面显示设置',
      backgroundColor: '#6d5e4f',
      actionColor: '#dd6d61',
      actions: [{
        id: 'skin-toggle-btn',
        label: '换肤',
        title: '切换为优雅扁平皮肤',
        ariaPressed: false,
        dataset: { pnSkinToggle: '' }
      }]
    }));
  }
  PromptNotebook.app.initPageEvents();
  PromptNotebook.components.initCopyDetailModal();
  PromptNotebook.components.initBackToTop();
  PromptNotebook.app.updateDynamicTexts();

  const plaque = document.querySelector('.pn-brand-plaque');
  if (plaque) {
    const rotation = PromptNotebook.core.getStablePlaqueRotation('prompt-notebook-brand');
    plaque.style.setProperty('--plaque-rotation', `${rotation.rotation}deg`);
    plaque.style.setProperty('--plaque-mobile-rotation', `${rotation.mobileRotation}deg`);
    PromptNotebook.core.applyStablePlaqueWear(plaque, 'prompt-notebook-brand');
  }

  const site = PromptNotebook.config.getActiveSite();
  let loaded = false;
  try {
    rawMarkdown = await PromptNotebook.services.loadContent(site);
    PromptNotebook.services.storage.clear();
    loaded = true;
  } catch (error) {
    console.warn(`获取 ${site.filename} 失败，将尝试本地存储：`, error);
  }

  if (!loaded) {
    const stored = PromptNotebook.services.storage.read();
    if (stored) {
      rawMarkdown = stored.content;
      loaded = true;
      PromptNotebook.components.updateStatusBanner({ visible: window.location.protocol === 'file:', imported: true, filename: stored.filename || site.filename, updated: stored.updated });
    }
  }

  if (loaded) {
    PromptNotebook.app.hideErrorOverlay();
    await PromptNotebook.app.prepareAndReveal({ render: true, alreadyVisible: true });
  } else {
    PromptNotebook.app.showErrorOverlay();
    await PromptNotebook.app.prepareAndReveal({ alreadyVisible: true });
  }
});

;

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').catch(error => console.warn('离线缓存注册失败：', error));
  }
}, { once: true });
