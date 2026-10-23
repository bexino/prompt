# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static site (提示词仓库 / "prompt repo") for browsing and copying prompt snippets, styled in Smartisan OS UI. Data source is `snippets/` — category folders (`1图片`, `5Win工具`, `10娱乐`…) containing md files with numeric prefixes (`1图片8K高清.md`). Numeric prefixes on folders and filenames drive strict sorting; titles shown in the UI have the prefix (and `.md`) stripped.

## Commands

```bash
npm run dev      # dev server (also: preview via .claude/launch.json, "prompt-repo", port 5173)
npm run build    # output in dist/, base is relative (./) so dist/ deploys anywhere
npm run preview
```

No tests or linter configured.

## Architecture

- **`vite.config.js`** — custom `snippets-loader` plugin reads `snippets/**/*.md` from disk and injects them as a virtual module `virtual:snippets`. Sent to `src/data.js` as `[{ category, name, text }]`. Triggers full reload on md changes.
- **`src/data.js`** — parses category/file structure, numeric-prefix sorting, and the md content convention:
  - `# Desc` section → dialog description (rendered as markdown with `marked`); missing → description hidden.
  - `# btnN (label)` followed by a fenced code block → textarea content; `(label)` is the tab name (default 方案N); only one btn → no tabs.
- **`src/main.js`** — hash routing: `#/` (category list) and `#/cat/<category>` (file list). Home list rows show the *category's own* numeric prefix as the badge (not file count).
- **`src/ui.js`** — prompt dialog, search overlay, copy-to-clipboard + toast, marked rendering.
- **`src/smartisan.css` / `smartisan.js` / `tailwind.preset.js`** — copied verbatim from the `smartisan-ui` skill (`C:\Users\Honor\.claude\skills\smartisan-ui\`). Do not edit smartisan.css; dark mode lives in `src/dark.css`.
- **`src/theme.js` / `src/dark.css`** — three-state theme: auto (follows `prefers-color-scheme`) / day / dark, set from the `#/settings` page (`renderSettings` in main.js). Explicit choice is persisted as URL param `theme=day|dark`; no param = follow device. Applied via `html[data-theme]`; dark overrides token values and hardcoded light colors. URL param `hide=theme` (comma-separated list; `hiddenSettings()` in main.js reads it via `urlParam()`) hides the theme group in settings — entry point only; a manually-specified `theme` param still applies.
- **`src/url.js`** — URL-param reading that tolerates address-bar typos: standard `?hide=theme` plus path-segment form `/hide=theme#/` (typed without the `?`; only keys `theme`/`hide` are treated as params, other path segments untouched). `initUrl()` at startup rewrites path-form params back into the query string via replaceState.
- **`index.html`** — inlined SVG icon sprite (`<symbol>` elements inside an outer `<svg>`); self-hosted Geist fonts via `<link href="./src/geist.css">`. Interface icons use the inline sprite.
- **`src/geist.css` + `public/fonts/`** — self-hosted Geist / Geist Mono (woff2 variable, subsetted). No font CDN request at runtime, so the site renders identically offline. Font files come from npm `@fontsource-variable/geist` / `-geist-mono`; only the `*-wght-normal.woff2` subsets are vendored (no italics used). `scripts/verify-build.mjs` fails the build if an external font URL or Google Fonts reference reappears.

More context (history, feature list, verification checklist) in `docs/HANDOFF.md`.

## Hard-won pitfalls — do not regress these

1. **File names contain `#`** (e.g. `9视频/1人像转视频 #1.md`): `import.meta.glob` fails on them (`#` parsed as fragment). The custom disk-reading plugin in vite.config.js is required — don't switch back to glob.
2. **Icon sprite in index.html**: the outer `<svg xmlns…>` wrapper tag is what makes the `<symbol>`s work; don't drop it when editing index.html.
3. **Dialog**: explicit white background + border-radius needed (`.s-dialog` has no bg). max-height 640px; only the body scroll region scrolls (needs `flex:1 1 auto; min-height:0`), header/buttons fixed.
4. **Textarea is full-height and must NOT scroll internally**: `overflow:hidden` plus JS setting explicit height, iterating until `scrollHeight` stabilizes (single measurement is off by 100+px due to scrollbar reservation). Use setTimeout, not rAF (rAF pauses in hidden tabs).
5. **Copy button**: placed inside `.s-copy-anchor` (sticky, height:0, text-align:right) at the top of the scroll region so it pins top-right while text slides under it. Not `position:absolute` over the textarea.
6. Home page badge = category's own numeric prefix (user corrected this once; it is not the file count).
7. Copy uses `navigator.clipboard` with `execCommand` fallback; toast auto-dismisses in 1.8s — verify via `.s-toast-host` state, not a slow screenshot.
8. esbuild install needs `npm install-scripts approve esbuild` on this machine (`allowScripts` in package.json).
