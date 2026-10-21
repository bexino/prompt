# 部署说明（GitHub Actions → Cloudflare Pages + GitHub Pages）

每次推送到 `main` 分支，[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) 会自动构建并部署到两处：

- **Cloudflare Pages**：wrangler 上传 `dist/`，站点为 `https://<项目名>.pages.dev/`
- **GitHub Pages**：站点为 `https://bexino.github.io/prompt/`

两处互不影响；PR 只做构建校验，不部署。

## 一次性配置

### 1. Cloudflare 侧

1. 在 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **My Profile** → **API Tokens** 创建一个自定义令牌：
   - 权限：`Account` → `Cloudflare Pages` → `Edit`
   - 建议同时加上 `Account` → `Account Settings` → `Read`
2. 记下 **Account ID**（Dashboard 右侧边栏，或任意域名的 Overview 页）。

### 2. GitHub 侧

仓库 → **Settings** → **Secrets and variables** → **Actions**

| 类型 | 名称 | 值 |
| --- | --- | --- |
| Secret | `CLOUDFLARE_API_TOKEN` | 上面创建的令牌 |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID |
| Variable | `CLOUDFLARE_PAGES_PROJECT` | Pages 项目名，例如 `prompt`（不存在时首次部署会自动创建） |

配好之后，推送到 `main` 即自动部署。

> 凭据**没配齐**时不会报错：构建照常执行，部署步骤跳过并输出一条 notice。
> 这样可以先把仓库和 CI 跑通，回头再补密钥。

> wrangler 的 `pages deploy` 在 CI 里**不会**自动创建项目，所以工作流会先跑
> `pages project create`（项目已存在时忽略）。这要求 API 令牌有
> `Cloudflare Pages:Edit` 权限。

### 3. GitHub Pages 侧

首次运行时 `actions/configure-pages` 会尝试自动启用 Pages，但 **GITHUB_TOKEN
可能没有创建 Pages 站点的权限**（报 `Resource not accessible by integration`）。
遇到这种情况手动开一次即可：仓库 → **Settings** → **Pages** → Source 选
**GitHub Actions**。之后每次部署都不再需要这一步。

### 4. 避免双重部署（Cloudflare）

本工作流已经负责 Cloudflare 部署。**请不要**在 Cloudflare Pages 控制台里再
连接 Git 仓库，否则每次推送会触发两套构建、互相覆盖。
如果 Pages 项目已经连过 Git：Pages → 项目 → **Settings** → 断开 Git 集成即可。

## 工作流行为

| 事件 | 构建 | Cloudflare | GitHub Pages |
| --- | --- | --- | --- |
| push 到 `main` | ✅ | ✅ | ✅ |
| PR 到 `main` | ✅ | ❌ | ❌ |
| 手动 `workflow_dispatch` | ✅ | ✅ | ✅ |

产物保留 7 天；同一分支连续推送只保留最新一次运行（`concurrency`）。

## 本地验证

```bash
npm ci          # 严格按 package-lock.json 安装，与 CI 一致
npm run build
npm run verify  # 产物冒烟检查
```

`npm run verify` 会在部署前拦住几类「构建成功但页面是空的」事故：
snippets 没读进来、图标 sprite 丢失、产物里残留会 404 的绝对路径。

## 为什么这样配置

- **Node 版本固定在 22**（`.node-version` 与 workflow 一致），避免 CI 用了
  老 Node 导致 Vite 6 报 engine 错误。
- **只用 `npm ci`**，不跑 `npm install`，保证依赖树与 `package-lock.json` 完全一致。
- **产物全部相对路径**（`vite.config.js` 里 `base: './'`），
  所以 `dist/` 部署到 Pages 的任意子路径都能正常工作；verify 脚本会检查这一点。
- **`.gitattributes` 强制 LF**：`src/data.js` 靠行尾解析 `# Desc` / `# btn` 标记，
  如果 md 文件在 Windows 上被转成 CRLF，解析会静默失效。
- **哈希路由**（`#/`、`#/cat/<分类>`），不需要服务端 rewrite，
  Pages 不需要 `_redirects` 等额外配置。
