# 项目结构与模块规范

## 文档目的

本文档是项目文件结构、模块职责、依赖关系、加载顺序和公开接口的唯一规范来源，主要供后续 AI 和维护者定位修改位置、判断依赖边界并复用视觉组件。

根目录 `AGENTS.md` 规定必须在修改前浏览本文档，并在结构、职责、依赖或公开接口变化时同步更新本文档。实际代码与本文档不一致时，不得默认文档或代码任一方正确；应先确认目标行为，再在同一次修改中恢复一致性。

## 完整目录

```text
prompt/
├─ AGENTS.md
├─ index.html
├─ README.md
├─ LICENSE
├─ css/
│  ├─ index.css
│  ├─ app/
│  │  └─ shell.css
│  ├─ foundations/
│  │  ├─ fonts.css
│  │  ├─ tokens.css
│  │  ├─ reset.css
│  │  └─ accessibility.css
│  ├─ layout/
│  │  ├─ page.css
│  │  ├─ workspace.css
│  │  └─ notes-grid.css
│  ├─ components/
│  │  ├─ brand-plaque.css
│  │  ├─ top-bar.css
│  │  ├─ note-card.css
│  │  ├─ copy-tab.css
│  │  ├─ ribbon.css
│  │  ├─ markdown.css
│  │  ├─ table-of-contents.css
│  │  ├─ banner.css
│  │  ├─ modal.css
│  │  ├─ toast.css
│  │  ├─ drag-overlay.css
│  │  └─ back-to-top.css
│  ├─ utilities/
│  │  ├─ animations.css
│  │  └─ states.css
│  └─ themes/
│     ├─ classic/
│     │  ├─ index.css
│     │  └─ semantic.css
│     └─ elegant/
│        ├─ index.css
│        ├─ semantic.css
│        └─ theme.css
├─ js/
│  ├─ namespace.js
│  ├─ config/
│  │  ├─ app-config.js
│  │  ├─ initial-skin-choice.js
│  │  ├─ app-loader.js
│  │  ├─ skin-config.js
│  │  ├─ font-config.js
│  │  └─ asset-manifest.js
│  ├─ core/
│  │  ├─ hash.js
│  │  ├─ layout-generator.js
│  │  ├─ markdown-inline.js
│  │  ├─ markdown-renderer.js
│  │  └─ prompt-parser.js
│  ├─ services/
│  │  ├─ content-loader.js
│  │  ├─ local-storage.js
│  │  ├─ file-import.js
│  │  ├─ clipboard.js
│  │  └─ lazy-assets.js
│  ├─ components/
│  │  ├─ brand-plaque.js
│  │  ├─ top-bar.js
│  │  ├─ note-card.js
│  │  ├─ ribbon.js
│  │  ├─ table-of-contents.js
│  │  ├─ markdown-content.js
│  │  ├─ status-banner.js
│  │  ├─ copy-modal.js
│  │  ├─ toast.js
│  │  ├─ drag-overlay.js
│  │  └─ back-to-top.js
│  └─ app/
│     ├─ state.js
│     ├─ explorer-renderer.js
│     ├─ event-controller.js
│     └─ bootstrap.js
├─ examples/
│  ├─ components.html
│  ├─ components.css
│  └─ components.js
├─ docs/
│  ├─ spec.md
│  ├─ component-api.md
│  ├─ fam.md
│  └─ legacy.md
└─ assets/
   ├─ branding/
   ├─ decor/
   ├─ fonts/
   ├─ notes/
   └─ textures/
```

`.git/` 等版本控制内部目录不属于项目结构规范。

## 根目录职责

| 文件 | 职责 |
| --- | --- |
| `AGENTS.md` | 规定结构同步、语言和维护约束 |
| `index.html` | 提供页面语义骨架、挂载点和外部资源加载顺序，不包含业务样式、业务脚本或内联事件 |
| `README.md` | 面向使用者介绍项目、内容格式和部署方式 |
| `LICENSE` | 保存第三方可识别的授权原文，不进行翻译 |

## CSS 职责

`css/index.css` 是供外部页面选择一次性加载两套皮肤的聚合入口，只导入 `classic` 与 `elegant` 两个独立皮肤入口。主应用为减少首屏请求，不使用该聚合入口，而由皮肤配置按需加载当前皮肤。

### 主应用层

- `app/shell.css`：只保存主应用实际使用的结构工具类，取代在线 Tailwind 运行时；不属于任何皮肤包，也不包含皮肤素材。

### 皮肤层

- `themes/classic/index.css`：经典拟物皮肤严格组件入口，组合既有基础、布局、组件和素材样式。
- `themes/elegant/index.css`：优雅扁平皮肤严格组件入口，不导入经典皮肤或图片素材。
- 两套 `semantic.css`：普通语义 HTML 适配入口，只在 `.pn-semantic-skin` 宿主内生效。
- 皮肤通过 `data-pn-skin` 和各自宿主类限定作用域，不得读取应用状态、本地存储、内容源或 URL，也不得相互引用。

### 基础层

- `fonts.css`：声明本地 `Gelasio`、思源宋体和 `Geist`，并提供皮肤无关的衬线与 `Geist + 系统中文` 两档字体契约。
- `tokens.css`：定义经典皮肤使用的颜色、字体和阴影变量；优雅皮肤变量由自身入口定义。
- `reset.css`：提供最小基础重置和滚动条基础样式。
- `accessibility.css`：集中响应式覆盖、低带宽模式和减少动画偏好。

### 布局层

- `page.css`：页面背景、木纹纹理和应用外壳。
- `workspace.css`：主工作区宽度和留白。
- `notes-grid.css`：便签网格、间距和层叠顺序。

### 组件层

既有组件样式文件由经典皮肤入口组合；优雅皮肤在自己的 `theme.css` 内完整实现相同的稳定组件契约。组件 JavaScript 只输出内容、操作、反馈挂载点和 `data-pn-*` 外观属性，不读取当前皮肤。

### 工具层

- `animations.css`：可跨组件复用的按压和进入动画。
- `states.css`：隐藏、截断等通用状态，不承载具体组件外观。

### CSS 规则

- 可复用类统一使用 `pn-` 前缀，宿主容器使用 `pn-theme`。
- 组件文件不得直接覆盖无作用域的 `body`、标题、表格或按钮；应用外壳所需的 `html` 和 `body.pn-app` 规则只允许位于 `page.css`。
- 组件不得依赖 Tailwind 工具类。`index.html` 中保留的 Tailwind 类只服务主应用骨架。
- CSS 自身无法调用 JavaScript 素材清单，因此字体和背景资源路径只允许出现在对应 CSS 文件中，并相对于该文件使用 `../../assets/`。业务 JavaScript 中的动态素材必须经过 `asset-manifest.js`。
- 响应式或无障碍覆盖集中在 `accessibility.css`；新增组件级媒体查询时，应优先与组件放置，只有跨组件协调时才放入该文件。

## JavaScript 职责与依赖

### 配置层

- `namespace.js`：创建唯一全局对象 `window.PromptNotebook`。
- `app-config.js`：解析内容源和站点参数。
- `initial-skin-choice.js`：在任何应用样式与内容加载前恢复已保存的皮肤；首次访问时使用浏览器原生确认框让用户选择经典拟物或优雅扁平皮肤并立即保存结果，选择完成后才引入应用资源加载器。
- `app-loader.js`：维护主应用样式与脚本的唯一加载清单和固定顺序，只能由首屏皮肤选择门在文档解析阶段引入。
- `skin-config.js`：消费首屏皮肤选择，只加载当前皮肤入口，并在用户首次切换时按需加载另一皮肤；公开皮肤读取、异步设置、异步切换、就绪等待和宿主同步能力。
- `font-config.js`：在首屏样式加载前恢复人工字体偏好；没有偏好时按经典衬线、典雅 `Geist` 选择默认字体，并公开字体读取、设置、切换和皮肤跟随能力。
- `asset-manifest.js`：维护全局及组件级动态素材根路径和路径生成函数。

### 核心层

- `hash.js`：提供无副作用哈希函数。
- `layout-generator.js`：持有当前页面布局种子，并生成经典皮肤所需的旋转、偏移、阴影、铭牌磨损和素材选择结果；不决定便签色调或其他皮肤外观。
- `markdown-inline.js`：转义并解析行内 Markdown。
- `markdown-renderer.js`：将 Markdown 文本块渲染为 HTML。
- `prompt-parser.js`：将 Markdown 文档解析为目录、标题、正文和提示词领域数据。

核心层不得访问 DOM、网络、文件、剪贴板或本地存储。除 `asset-manifest.js` 提供的素材路径函数外，核心层不得依赖服务层、组件层或应用层。

### 服务层

- `content-loader.js`：负责 HTTP 内容读取及错误抛出。
- `local-storage.js`：封装导入内容的读取、写入和清理。
- `file-import.js`：封装拖放监听和文件文本读取，通过回调向应用层返回结果。
- `clipboard.js`：封装剪贴板写入和兼容降级；当前还负责触发现有复制反馈，后续调整需保持服务不读取应用状态。
- `lazy-assets.js`：持有懒加载观察器，根据 `data-src` 延迟加载图片和背景素材，公开 `initLazyAssets(container)`。

服务层可以使用浏览器能力，但不得决定页面布局或内容源业务流程。

### 组件层

- `brand-plaque.js`：创建可复用铭牌。
- `top-bar.js`：创建可复用网页顶栏，根据调用方传入的标题、操作项和外观变量生成稳定结构，不读取主题或应用状态。
- `note-card.js`：创建可复用便签并通过回调交付复制和详情行为；经典皮肤的颜色与纸张变体由素材清单映射到对应彩色位图。
- `ribbon.js`：创建丝带分隔元素。
- `table-of-contents.js`：创建锚点目录。
- `markdown-content.js`：组合 Markdown 渲染器与内容容器。
- `status-banner.js`：根据应用传入的状态更新本地模式横幅。
- `copy-modal.js`：控制详情弹窗显示、关闭和键盘行为。
- `toast.js`：创建和移除消息提示。
- `drag-overlay.js`：提供拖放遮罩元素访问接口。
- `back-to-top.js`：控制返回顶部按钮可见性和滚动行为。

可复用组件不得读取应用状态、内容源或本地存储；业务结果通过配置和回调传递。

### 应用层

- `state.js`：只保存当前 Markdown 和解析结果。
- `explorer-renderer.js`：把领域数据组合为目录、标题、正文和便签列表。
- `event-controller.js`：绑定页面按钮、皮肤切换、文件选择、拖放和页面级事件，协调服务与组件。
- `bootstrap.js`：唯一启动入口，识别低带宽环境、初始化动态素材与组件、加载内容、执行缓存降级并触发首次渲染。

应用层可以依赖其前面的所有层级，其他层不得反向依赖应用层。

### 加载顺序

`index.html` 先同步加载命名空间与首次皮肤选择门；没有保存值时，页面解析会暂停在浏览器原生确认框，在用户作出选择前不请求结构样式、皮肤或内容。选择完成后，选择门同步引入 `app-loader.js`，由该文件注入主应用结构样式、皮肤配置与字体配置，在首屏内容渲染前设置 `data-pn-skin`、`data-pn-font` 并请求唯一的当前皮肤入口；启动入口等待皮肤样式就绪。其余脚本使用经典 `defer`，顺序固定为：站点与素材配置、状态、核心、服务、基础组件（包括顶栏）、页面服务、应用渲染、事件控制、启动入口。主页面不依赖在线 CSS 运行时。新增依赖必须放在使用方之前，并同步更新本节、`app-loader.js` 和 `index.html`。

## 素材目录

- `assets/branding/`：经典皮肤 Logo 和全局站点图标。
- `assets/decor/`：经典皮肤胶带、图钉、丝带和复制贴纸。
- `assets/fonts/`：两档字体模式共用的 `Gelasio`、思源宋体和 `Geist` 本地字体，以及不可修改的第三方授权文本。
- `assets/notes/`：保存经典皮肤三种纸张变体的六色完整位图与既有顶部阴影素材；颜色、纹理和折角均由位图自身提供。
- `assets/textures/`：经典皮肤木纹和纸张纹理；优雅皮肤不得引用本目录。

禁止复制相同素材到组件目录。动态 JavaScript 素材路径通过 `PromptNotebook.config.assets` 生成；复用方调用 `setBaseUrl()` 调整根路径。

## 公开接口

- `PromptNotebook.components.createNote(options)`
- `PromptNotebook.components.createPlaque(options)`
- `PromptNotebook.components.createTopBar(options)`
- `PromptNotebook.components.createRibbon(options)`
- `PromptNotebook.components.createMarkdownContent(options)`
- `PromptNotebook.components.createTableOfContents(options)`
- `PromptNotebook.services.initLazyAssets(container)`
- `PromptNotebook.config.assets.setBaseUrl(path)`
- `PromptNotebook.config.assets.at(path)`
- `PromptNotebook.config.assets.note(variant, color)`
- `PromptNotebook.config.skin.get()`
- `PromptNotebook.config.skin.set(name)`，返回皮肤样式加载完成后的 `Promise<string>`
- `PromptNotebook.config.skin.toggle()`，返回皮肤样式加载完成后的 `Promise<string>`
- `PromptNotebook.config.skin.ready()`
- `PromptNotebook.config.font.get()`
- `PromptNotebook.config.font.set(name)`
- `PromptNotebook.config.font.toggle()`
- `PromptNotebook.config.font.followSkin(skinName)`

具体输入、回调和示例见 `docs/component-api.md`。创建函数返回 DOM 元素；宿主负责插入和移除元素。懒加载服务在容器内注册观察，元素移除后由浏览器和观察器自然清理。

## 新功能归属判断

1. 无 DOM、网络和存储依赖的确定性转换或计算放入 `js/core/`。
2. 对浏览器外部能力的封装放入 `js/services/`。
3. 可独立创建或控制的视觉单元放入 `js/components/` 和 `css/components/`。
4. 多个组件之间的排列放入 `css/layout/`。
5. 业务状态、页面流程和跨层协调放入 `js/app/`。
6. 站点、主题或素材路径配置放入 `js/config/`。
7. 独立复用演示放入 `examples/`，面向维护者的说明放入 `docs/`。
8. 不能明确归属时，先依据依赖方向选择最内层且职责完整的位置，不得为了省事放回 `index.html`。

## 结构变更检查清单

- 修改前已浏览本文档相关章节。
- 已确认新增代码的层级和依赖方向。
- 实际新增、删除、移动和重命名与目录树一致。
- 文件职责表、加载顺序和公开接口已同步。
- `index.html` 没有新增内联业务样式、脚本或事件。
- 自有代码注释和自然语言 Markdown 使用简体中文。
- 动态素材没有新增散落路径。
- JavaScript 语法检查、资源路径检查、主页面和独立示例验证均通过。

## 维护信息

- 结构版本：`2.0.0`
- 最后同步日期：`2026-08-25`
