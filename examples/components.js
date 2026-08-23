window.addEventListener('DOMContentLoaded', () => {
  PromptNotebook.config.assets.setBaseUrl('../assets');
  const root = document.getElementById('example-root');
  ['red', 'yellow', 'blue'].forEach((color, index) => {
    const note = PromptNotebook.components.createNote({
      title: `可复用便签示例 ${index + 1}`,
      content: '组件不依赖主应用状态。',
      theme: `pn-note-${color}`,
      variant: index,
      onCopy(_options, element) { element.classList.add('copied'); }
    });
    root.append(note);
  });
  PromptNotebook.services.initLazyAssets(root);
});
