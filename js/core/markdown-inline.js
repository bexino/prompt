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
