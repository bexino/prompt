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
    parseAndRender();
    PromptNotebook.components.updateStatusBanner({ visible: window.location.protocol === 'file:', imported: true, filename: imported.filename, updated: new Date().toLocaleString() });
    PromptNotebook.components.showToast(`${imported.filename} 导入成功并已更新`, 'success');
  } catch (error) {
    PromptNotebook.components.showToast(error.message || '读取文件失败，请重试', 'error');
  }
}

function initPageEvents() {
  const input = document.getElementById('local-file-input');
  document.getElementById('local-import-btn')?.addEventListener('click', () => input?.click());
  document.getElementById('error-import-btn')?.addEventListener('click', () => input?.click());
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
