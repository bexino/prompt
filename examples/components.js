window.addEventListener('DOMContentLoaded', () => {
  PromptNotebook.config.assets.setBaseUrl('../assets');
  document.getElementById('top-bar-root')?.append(PromptNotebook.components.createTopBar({
    title: '可复用顶栏',
    sticky: false,
    actions: [{ label: '操作', ariaLabel: '示例操作' }]
  }));
  const examples = [
    { root: document.getElementById('classic-root'), colors: ['red', 'yellow'] },
    { root: document.getElementById('elegant-root'), colors: ['green', 'blue'] }
  ];
  examples.forEach(({ root, colors }) => {
    colors.forEach((color, index) => {
      const note = PromptNotebook.components.createNote({
        title: `可复用便签示例 ${index + 1}`,
        content: '组件不依赖主应用状态。',
        theme: `pn-note-${color}`,
        variant: index,
        onCopy(_options, element) { element.classList.add('copied'); }
      });
      root.append(note);
    });
  });
  PromptNotebook.services.initLazyAssets(document);
});
