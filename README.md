[![Commit Activity](https://img.shields.io/github/commit-activity/t/bexino/prompt?color=red)](https://github.com/bexino/ptompt/commits/main/)
[![License](https://img.shields.io/github/license/bexino/prompt?color=orange)](https://github.com/bexino/ptompt/blob/main/LICENSE)
[![MadeWith♥](https://img.shields.io/badge/@bexino-Made_With_♥-yellow)](https://github.com/bexino)
[![ViewInGithub](https://img.shields.io/badge/Github-bexino%2Fprompt-white?logo=github&logoColor=auto&labelColor=555555&color=000000)](https://github.com/bexino/prompt/)

# 提示词仓库

静态提示词浏览站点。

## 特性

1. 分类浏览；
2. 搜索；
3. 一键复制；
4. 日/夜主题。

## 技术细节

### 部署

```bash
npm install   # 首次需 npm install-scripts approve esbuild
npm run dev   # 开发，端口 5199
npm run build # 构建到 dist/（base 为相对路径，可部署任意静态托管）
```

### 添加提示词

在 `snippets/<分类>/<序号>标题.md` 新建 md 文件即可，序号决定排序，UI 中自动去掉前缀显示标题。

格式约定：

- `# 描述` 段落 → 弹窗说明（支持 Markdown，可省略）
- `# btnN (标签)` + 代码块 → 文本框内容，`(标签)` 为方案名（默认「方案N」）；仅一个方案时不显示标签页

### 结构

- `snippets/` — 数据源，按分类文件夹组织
- `vite.config.js` — 自定义 snippets-loader 插件读取 md 注入为虚拟模块
- `src/data.js` — 解析分类/文件结构与 md 约定
- `src/main.js` — hash 路由（`#/` 分类列表、`#/cat/<分类>` 文件列表）
- `src/ui.js` — 弹窗、搜索、复制
- `src/theme.js` / `dark.css` — 三态主题（跟随系统/日间/夜间），以 `?theme=` 参数持久化

## 鸣谢

[smartisan-ui-skill](https://github.com/lemonteaau/smartisan-ui-skill)

## 许可证

Apache-2.0 license