# 可复用组件接口

## 引入顺序

普通原生网页至少需要依次加载以下资源：

```html
<link rel="stylesheet" href="路径/css/index.css">
<script defer src="路径/js/namespace.js"></script>
<script defer src="路径/js/config/asset-manifest.js"></script>
<script defer src="路径/js/app/state.js"></script>
<script defer src="路径/js/core/hash.js"></script>
<script defer src="路径/js/core/layout-generator.js"></script>
<script defer src="路径/js/core/markdown-inline.js"></script>
<script defer src="路径/js/core/markdown-renderer.js"></script>
<script defer src="路径/js/services/lazy-assets.js"></script>
<script defer src="路径/js/components/note-card.js"></script>
```

宿主容器应添加 `pn-theme` 类。组件样式不依赖 Tailwind；主应用中的 Tailwind 仅用于尚未迁移的页面布局工具类。

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
| `theme` | 字符串 | `pn-note-red` 等颜色类 |
| `variant` |数字 | 纸张外形编号，按三种变体循环 |
| `assetBaseUrl` | 字符串 | 可选的组件级素材根路径，不修改全局配置 |
| `layout` | 对象 | 可选的布局参数；缺省时由核心层生成 |
| `copyLabel` | 字符串 | 复制按钮文字 |
| `onCopy` | 函数 | 首次点击复制按钮时调用 |
| `onOpenDetails` | 函数 | 已复制状态下再次点击时调用 |

创建后调用 `PromptNotebook.services.initLazyAssets(container)` 启动素材懒加载。移除组件无需额外销毁操作；宿主应自行清理其注册的业务回调引用。

## 铭牌组件

`PromptNotebook.components.createPlaque(options)` 创建铭牌，支持 `logo`、`logoAlt` 和 `title`。未提供 `logo` 时使用素材清单中的默认品牌图。

## 丝带组件

`PromptNotebook.components.createRibbon(options)` 创建分隔丝带。`options.rotation` 可指定旋转角度；素材背景由组件 CSS 提供。

## Markdown 内容组件

`PromptNotebook.components.createMarkdownContent(options)` 创建 Markdown 内容容器。`options.markdown` 为原始文本，`options.className` 可覆盖默认的 `pn-markdown-paper` 类。

当前解析器只支持项目所需的标题、列表、表格、引用、链接、强调和行内代码子集，不应视为完整 CommonMark 实现。

## 目录组件

`PromptNotebook.components.createTableOfContents(options)` 接收 `{ items: [{ id, title }] }`，返回指向页面锚点的目录元素。
