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
