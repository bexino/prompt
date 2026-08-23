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
