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
