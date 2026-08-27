(() => {
  const resources = [
    '<link rel="icon" type="image/png" sizes="64x64" data-pn-asset="branding:favicon.png?v=1" data-pn-asset-attribute="href">',
    '<link rel="stylesheet" href="./css/app/shell.css?v=3">',
    '<script src="./js/config/skin-config.js?v=14"><\/script>',
    '<script src="./js/config/font-config.js?v=2"><\/script>',
    '<script defer src="./js/config/app-config.js"><\/script>',
    '<script defer src="./js/config/asset-manifest.js?v=6"><\/script>',
    '<script defer src="./js/app/state.js"><\/script>',
    '<script defer src="./js/core/hash.js"><\/script>',
    '<script defer src="./js/core/layout-generator.js?v=4"><\/script>',
    '<script defer src="./js/core/markdown-inline.js"><\/script>',
    '<script defer src="./js/core/markdown-renderer.js"><\/script>',
    '<script defer src="./js/core/prompt-parser.js"><\/script>',
    '<script defer src="./js/services/local-storage.js"><\/script>',
    '<script defer src="./js/services/content-loader.js?v=2"><\/script>',
    '<script defer src="./js/services/lazy-assets.js?v=4"><\/script>',
    '<script defer src="./js/components/ribbon.js"><\/script>',
    '<script defer src="./js/components/brand-plaque.js"><\/script>',
    '<script defer src="./js/components/top-bar.js?v=2"><\/script>',
    '<script defer src="./js/components/markdown-content.js"><\/script>',
    '<script defer src="./js/components/table-of-contents.js"><\/script>',
    '<script defer src="./js/components/note-card.js?v=8"><\/script>',
    '<script defer src="./js/components/status-banner.js"><\/script>',
    '<script defer src="./js/components/back-to-top.js?v=3"><\/script>',
    '<script defer src="./js/components/copy-modal.js"><\/script>',
    '<script defer src="./js/components/toast.js"><\/script>',
    '<script defer src="./js/components/drag-overlay.js"><\/script>',
    '<script defer src="./js/components/loading-screen.js"><\/script>',
    '<script defer src="./js/services/file-import.js"><\/script>',
    '<script defer src="./js/services/clipboard.js"><\/script>',
    '<script defer src="./js/services/view-assets.js"><\/script>',
    '<script defer src="./js/app/explorer-renderer.js?v=5"><\/script>',
    '<script defer src="./js/app/view-coordinator.js"><\/script>',
    '<script defer src="./js/app/event-controller.js?v=4"><\/script>',
    '<script defer src="./js/app/bootstrap.js?v=5"><\/script>'
  ];

  // 只在首屏解析阶段注入资源，确保确认框关闭前浏览器无法预取应用资源。
  document.write(resources.join('\n'));
})();
