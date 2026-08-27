import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const checkOnly = process.argv.includes('--check');
const outputs = new Map();

const appScripts = [
  'js/config/app-config.js',
  'js/config/asset-manifest.js',
  'js/app/state.js',
  'js/core/hash.js',
  'js/core/layout-generator.js',
  'js/core/markdown-inline.js',
  'js/core/markdown-renderer.js',
  'js/core/prompt-parser.js',
  'js/services/local-storage.js',
  'js/services/content-loader.js',
  'js/services/lazy-assets.js',
  'js/components/ribbon.js',
  'js/components/brand-plaque.js',
  'js/components/top-bar.js',
  'js/components/markdown-content.js',
  'js/components/table-of-contents.js',
  'js/components/note-card.js',
  'js/components/status-banner.js',
  'js/components/back-to-top.js',
  'js/components/copy-modal.js',
  'js/components/toast.js',
  'js/components/drag-overlay.js',
  'js/components/loading-screen.js',
  'js/services/file-import.js',
  'js/services/clipboard.js',
  'js/services/view-assets.js',
  'js/app/explorer-renderer.js',
  'js/app/view-coordinator.js',
  'js/app/event-controller.js',
  'js/app/bootstrap.js'
];

function hash(content) {
  return createHash('sha256').update(content).digest('hex').slice(0, 12);
}

function normalize(value) {
  return value.split(path.sep).join('/');
}

async function read(relativePath) {
  return fs.readFile(path.join(root, relativePath), 'utf8');
}

function add(relativePath, content) {
  outputs.set(normalize(relativePath), Buffer.isBuffer(content) ? content : Buffer.from(content));
}

async function bundleCss(entryPath, outputDirectory, visited = new Set()) {
  const absoluteEntry = path.join(root, entryPath);
  if (visited.has(absoluteEntry)) return '';
  visited.add(absoluteEntry);
  let source = await fs.readFile(absoluteEntry, 'utf8');
  const imports = [...source.matchAll(/@import\s+url\((['"]?)([^'")]+)\1\)\s*;/g)];
  imports.forEach((match, index) => { source = source.replace(match[0], `__PN_CSS_IMPORT_${index}__`); });

  source = source.replace(/url\((['"]?)([^'")]+)\1\)/g, (full, quote, value) => {
    if (/^(?:data:|https?:|#)/i.test(value)) return full;
    const question = value.indexOf('?');
    const pathname = question >= 0 ? value.slice(0, question) : value;
    const suffix = question >= 0 ? value.slice(question) : '';
    const absoluteAsset = path.resolve(path.dirname(absoluteEntry), pathname);
    let rewritten = normalize(path.relative(path.join(root, outputDirectory), absoluteAsset));
    if (!rewritten.startsWith('.')) rewritten = `./${rewritten}`;
    return `url('${rewritten}${suffix}')`;
  });
  for (let index = 0; index < imports.length; index += 1) {
    const importPath = imports[index][2].split('?')[0];
    const absoluteImport = path.resolve(path.dirname(absoluteEntry), importPath);
    const nested = await bundleCss(normalize(path.relative(root, absoluteImport)), outputDirectory, visited);
    source = source.replace(`__PN_CSS_IMPORT_${index}__`, nested);
  }
  return source;
}

async function copyTree(sourceRelative, destinationRelative = sourceRelative) {
  const source = path.join(root, sourceRelative);
  for (const entry of await fs.readdir(source, { withFileTypes: true })) {
    const sourceChild = path.join(sourceRelative, entry.name);
    const destinationChild = path.join(destinationRelative, entry.name);
    if (entry.isDirectory()) await copyTree(sourceChild, destinationChild);
    else add(destinationChild, await fs.readFile(path.join(root, sourceChild)));
  }
}

async function buildOutputs() {
  await copyTree('assets');
  add('README.md', await read('README.md'));
  add('docs/fam.md', await read('docs/fam.md'));
  add('LICENSE', await read('LICENSE'));

  const shellCss = await read('css/app/shell.css');
  const shellName = `shell.${hash(shellCss)}.css`;
  add(`css/${shellName}`, shellCss);

  const themeNames = {};
  for (const skin of ['classic', 'elegant']) {
    const css = await bundleCss(`css/themes/${skin}/index.css`, 'css');
    const name = `${skin}.${hash(css)}.css`;
    themeNames[skin] = `./css/${name}`;
    add(`css/${name}`, css);
  }

  const appParts = [];
  for (const script of appScripts) appParts.push(`/* ${script} */\n${await read(script)}`);
  appParts.push(`
window.addEventListener('load', () => {
  if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').catch(error => console.warn('离线缓存注册失败：', error));
  }
}, { once: true });`);
  const appBundle = `${appParts.join('\n;\n')}\n`;
  const appName = `app.${hash(appBundle)}.js`;
  add(`js/${appName}`, appBundle);

  let choice = await read('js/config/initial-skin-choice.js');
  choice = choice.replace(/\s*document\.write\([^\n]+app-loader\.js[^\n]+\);\s*/, '\n');
  let skinConfig = await read('js/config/skin-config.js');
  skinConfig = skinConfig
    .replace(/const stylesheetVersions = \{[^;]+\};/, `const stylesheetUrls = ${JSON.stringify(themeNames)};`)
    .replace("link.href = `./css/themes/${skin}/index.css?v=${stylesheetVersions[skin]}`;", 'link.href = stylesheetUrls[skin];');
  if (!skinConfig.includes('stylesheetUrls[skin]')) throw new Error('无法生成皮肤样式映射');
  const startupParts = [
    await read('js/namespace.js'),
    choice,
    skinConfig,
    await read('js/config/font-config.js'),
    `document.write([
      '<link rel="icon" type="image/png" sizes="64x64" href="./assets/branding/favicon.png?v=1">',
      '<link rel="stylesheet" href="./css/${shellName}">',
      '<script defer src="./js/${appName}"><\\/script>'
    ].join('\\n'));`
  ];
  const startupBundle = `${startupParts.join('\n;\n')}\n`;
  const startupName = `startup.${hash(startupBundle)}.js`;
  add(`js/${startupName}`, startupBundle);

  let html = await read('index.html');
  html = html.replace(
    /\s*<script src="\.\/js\/namespace\.js"><\/script>\s*<script src="\.\/js\/config\/initial-skin-choice\.js\?v=\d+"><\/script>/,
    `\n  <script src="./js/${startupName}"></script>`
  );
  if (!html.includes(startupName)) throw new Error('无法替换发布入口脚本');
  add('index.html', html);

  const cacheVersion = hash(`${startupName}:${appName}:${shellName}:${Object.values(themeNames).join(':')}`);
  const precache = ['./', './index.html', `./js/${startupName}`, `./js/${appName}`, `./css/${shellName}`, ...Object.values(themeNames)];
  const serviceWorker = `const CACHE_NAME = 'prompt-notebook-${cacheVersion}';
const PRECACHE = ${JSON.stringify(precache, null, 2)};

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith('prompt-notebook-') && key !== CACHE_NAME).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  const url = new URL(event.request.url);
  const networkFirst = event.request.mode === 'navigate' || url.pathname.endsWith('.md');
  if (networkFirst) {
    event.respondWith(fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(response => response || caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    return response;
  })));
});
`;
  add('sw.js', serviceWorker);
}

async function listFiles(directory, prefix = '') {
  const files = [];
  try {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const relative = normalize(path.join(prefix, entry.name));
      if (entry.isDirectory()) files.push(...await listFiles(path.join(directory, entry.name), relative));
      else files.push(relative);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  return files.sort();
}

async function verifyOutputs() {
  const actualFiles = await listFiles(dist);
  const expectedFiles = [...outputs.keys()].sort();
  if (actualFiles.join('\n') !== expectedFiles.join('\n')) throw new Error('dist/ 文件清单与源码构建结果不一致');
  for (const [relative, expected] of outputs) {
    const actual = await fs.readFile(path.join(dist, relative));
    if (!actual.equals(expected)) throw new Error(`dist/${relative} 与源码构建结果不一致`);
  }
}

async function writeOutputs() {
  const resolvedDist = path.resolve(dist);
  if (path.dirname(resolvedDist) !== root || path.basename(resolvedDist) !== 'dist') throw new Error('拒绝清理非预期发布目录');
  await fs.rm(resolvedDist, { recursive: true, force: true });
  for (const [relative, content] of outputs) {
    const target = path.join(resolvedDist, relative);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content);
  }
}

await buildOutputs();
if (checkOnly) {
  await verifyOutputs();
  console.log('dist/ 与源码一致。');
} else {
  await writeOutputs();
  console.log(`已生成 dist/，共 ${outputs.size} 个文件。`);
}
