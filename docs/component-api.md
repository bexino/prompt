# 可复用组件接口

## 引入顺序

严格 `pn-*` 组件入口按需要选择一套皮肤：

```html
<link rel="stylesheet" href="路径/css/themes/classic/index.css">
<!-- 或只加载 路径/css/themes/elegant/index.css -->
<script defer src="路径/js/namespace.js"></script>
<script defer src="路径/js/config/asset-manifest.js"></script>
<script defer src="路径/js/app/state.js"></script>
<script defer src="路径/js/core/hash.js"></script>
<script defer src="路径/js/core/layout-generator.js"></script>
<script defer src="路径/js/core/markdown-inline.js"></script>
<script defer src="路径/js/core/markdown-renderer.js"></script>
<script defer src="路径/js/services/lazy-assets.js"></script>
<script defer src="路径/js/components/top-bar.js"></script>
<script defer src="路径/js/components/note-card.js"></script>
```

经典皮肤宿主添加 `data-pn-skin="classic"` 与 `pn-theme`，优雅皮肤宿主添加 `data-pn-skin="elegant"` 与 `pn-theme-elegant`。组件样式不依赖 Tailwind；主应用骨架只使用本地 `css/app/shell.css`。

普通语义 HTML 使用对应皮肤的 `semantic.css`，并在局部宿主上添加 `pn-semantic-skin` 与 `data-pn-skin`。适配规则不会影响宿主外部的标题、文章、按钮、列表或表格。

外部页面确实需要预先加载两套皮肤时可引入 `css/index.css`。主应用在任何应用样式之前同步加载 `initial-skin-choice.js`：无 `skin` 参数时默认进入经典拟物主题，`skin=elegant` 进入优雅扁平主题。`skin-config.js` 在当前文档中只请求网址指定的一套主题；`getUrl(name)` 生成并保留其他查询参数的目标网址，`navigate(name)` 与 `toggle()` 通过整页导航切换主题，进入经典主题时会删除 `skin` 参数。`ready()` 用于等待当前主题入口就绪。

字体模式独立于皮肤。`data-pn-font="serif"` 使用 `Gelasio Local` 拉丁字体与 `Prompt Source Han Serif SC` 中文衬线字体；`data-pn-font="geist"` 使用项目内置的 `Geist Local`，中文字符回退到操作系统的微软雅黑、苹方等无衬线字体。没有人工偏好时，经典皮肤默认 `serif`，典雅皮肤默认 `geist`；用户通过 `PromptNotebook.config.font.set(name)` 或 `toggle()` 选择后，该偏好优先于皮肤默认并保存到独立设置键。

## 素材根路径

```js
PromptNotebook.config.assets.setBaseUrl('../assets');
```

素材根路径应指向包含 `branding`、`decor`、`notes` 和 `textures` 子目录的位置。

## 便签组件

```js
const note = PromptNotebook.components.createNote({
  title: '标题',
  content: '待复制内容',
  theme: 'pn-note-yellow',
  variant: 0,
  assetBaseUrl: '../assets',
  onCopy(options, element) {
    navigator.clipboard.writeText(options.content);
    element.classList.add('copied');
  },
  onOpenDetails(options) {
    console.log(options.content);
  }
});
```

支持的配置如下：

| 字段 | 类型 | 作用 |
| --- | --- | --- |
| `title` | 字符串 | 便签标题 |
| `content` | 字符串 | 由回调消费的正文内容 |
| `theme` | 字符串 | 兼容 `pn-note-red` 等颜色类，同时输出对应 `data-pn-tone` |
| `variant` | 数字 | 稳定的外观变体编号，用于选择对应彩色纸张位图 |
| `assetBaseUrl` | 字符串 | 可选的组件级素材根路径，不修改全局配置 |
| `layout` | 对象 | 可选的布局参数；缺省时由核心层生成 |
| `copyLabel` | 字符串 | 复制按钮文字 |
| `onCopy` | 函数 | 首次点击复制按钮时调用 |
| `onOpenDetails` | 函数 | 已复制状态下再次点击时调用 |

创建后调用 `PromptNotebook.services.initLazyAssets(container)` 启动素材懒加载。服务只请求视口及邻近区域的纸张和装饰图片，并动态控制经典主题的完整绘制状态；离开邻近区域不会清除已加载图片。移除组件无需额外销毁操作；宿主应自行清理其注册的业务回调引用。

便签根元素稳定输出 `data-pn-role="note"`、`data-pn-tone` 和 `data-pn-variant`；内容、操作按钮和反馈区域分别输出 `data-pn-role="note-content"`、`note-action` 和 `note-feedback`。皮肤应依赖这些公开契约，不得读取主应用状态。

经典皮肤通过素材清单按 `data-pn-tone` 与 `data-pn-variant` 渐进加载对应的彩色 WebP 纸张位图；图片准备前显示轻量纯色纸张，进入视口邻近区域后才启用纹理、旋转、装饰与完整阴影。纸张颜色、纹理、毛边、卷角和原始明暗全部来自位图，不使用浏览器滤镜重新染色。`pn-note-detail-active` 是服务与经典皮肤之间的内部绘制状态，不属于组件公开 DOM 契约。`assetBaseUrl` 作用于纸张和装饰素材，素材清单保留的顶部阴影路径也使用同一素材根目录；优雅皮肤继续忽略全部纸张素材。

## 铭牌组件

`PromptNotebook.components.createPlaque(options)` 创建铭牌，支持 `logo`、`logoAlt` 和 `title`。未提供 `logo` 时使用素材清单中的默认品牌图。

## 顶栏组件

```js
const topBar = PromptNotebook.components.createTopBar({
  title: '项目标题',
  titleId: 'project-title',
  backgroundColor: '#6d5e4f',
  actionColor: '#dd6d61',
  contentWidth: '64rem',
  actions: [{
    id: 'theme-button',
    label: '换肤',
    ariaPressed: false,
    onClick() {
      console.log('由宿主处理皮肤切换');
    }
  }]
});
document.body.prepend(topBar);
```

`createTopBar(options)` 只负责渲染顶栏，不读取皮肤、应用状态或存储。`title`、`titleId`、`ariaLabel`、`actionsLabel`、`sticky` 和 `contentWidth` 控制结构；`backgroundColor` 与 `actionColor` 会分别写入 `--pn-top-bar-background` 和 `--pn-top-bar-action-background`。`actions` 支持 `dataset`、按钮配置，也可通过 `{ element }` 传入宿主自行创建的元素。事件既可由 `onClick` 提供，也可在组件创建后由宿主绑定。主应用仅在典雅主题显示该顶栏及其主题导航按钮；经典主题继续使用原有拟物铭牌，并将主题导航按钮放在主内容之后的页面底部。

## 丝带组件

`PromptNotebook.components.createRibbon(options)` 创建分隔丝带。`options.rotation` 可指定旋转角度；素材背景由组件 CSS 提供。

## Markdown 内容组件

`PromptNotebook.components.createMarkdownContent(options)` 创建 Markdown 内容容器。`options.markdown` 为原始文本，`options.className` 可覆盖默认的 `pn-markdown-paper` 类。

当前解析器只支持项目所需的标题、列表、表格、引用、链接、强调和行内代码子集，不应视为完整 CommonMark 实现。

## 目录组件

`PromptNotebook.components.createTableOfContents(options)` 接收 `{ items: [{ id, title }] }`，返回指向页面锚点的目录元素。
