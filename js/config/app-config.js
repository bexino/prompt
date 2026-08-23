function getActiveSiteConfig() {
      const urlParams = new URLSearchParams(window.location.search);
      const siteParam = urlParams.get('site');
      if (siteParam === 'fam') {
        return {
          path: './docs/fam.md',
          filename: 'fam.md'
        };
      }
      return {
        path: './README.md',
        filename: 'README.md'
      };
    }

    // 根据当前站点配置更新动态文本

PromptNotebook.config.getActiveSite = getActiveSiteConfig;
