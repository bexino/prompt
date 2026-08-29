(() => {
  const url = new URL(window.location.href);
  const selectedSkin = url.searchParams.get('skin') === 'elegant' ? 'elegant' : 'classic';

  // 经典主题使用无 skin 参数的规范网址，避免产生两个等价入口。
  if (selectedSkin === 'classic' && url.searchParams.has('skin')) {
    url.searchParams.delete('skin');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  }

  PromptNotebook.config.initialSkinChoice = selectedSkin;
  document.write('<script src="./js/config/app-loader.js?v=11"><\/script>');
})();
