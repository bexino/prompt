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
