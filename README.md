# HanShu 汉书 · 产品发布页

Minecraft 剧情 / RPG 内容创作工具链 **HanShu（汉书）** 的官方发布页。
同时介绍两端：**创作 IDE（HanShuWebUI）** 与 **Mod 运行引擎（HanShu RPG Tool Kit）**。

- 纯静态站点：只有 HTML / CSS / JS / SVG，**无构建步骤、无依赖、无 npm install**
- 可直接部署到 **GitHub Pages**（仓库根目录即站点根目录）
- 默认深色、品牌橙色主题，像素风点缀，取自 WebUI 仓库的品牌素材
- 中英双语一键切换（记住选择；首次访问按浏览器语言判断）
- 响应式：桌面 / 平板 / 手机；支持键盘导航、`prefers-reduced-motion`、无 JS 时内容仍然可见

## 目录结构

```
.
├── index.html              # 唯一页面（全部内容与中英文案）
├── css/style.css           # 全部样式（设计 token 在文件顶部 :root）
├── js/main.js              # 语言切换、菜单、滚动动效、示例 Tab、终端重放
├── assets/
│   ├── icon.svg            # 像素渐变圆标（来自 HanShuWebUI/src/brand）
│   ├── wordmark.svg        # HANSHU 字标（同上）
│   └── wordmark-mark.svg   # 仅 "HAN" 的紧凑字标（备用）
├── favicon.svg             # 站点图标
└── .nojekyll               # 让 GitHub Pages 跳过 Jekyll 处理
```

## 本地预览

任选一种：

```sh
# 1) 任意静态服务器，例如 Python
python -m http.server 8000

# 2) Node（无依赖）
npx serve .
```

然后打开 http://localhost:8000 。直接双击 `index.html` 也能看，只是 `file://` 下个别浏览器行为不同，建议用本地服务器。

## 部署到 GitHub Pages

仓库 `main` 分支根目录即发布内容，两种方式任选：

**A. 分支部署（推荐，最简单）**
1. 仓库 → Settings → Pages
2. Source 选 **Deploy from a branch**
3. Branch 选 `main`，目录选 `/ (root)`，保存
4. 等待 1–2 分钟后访问 `https://<org>.github.io/ProductPage/`

**B. Actions 部署**
在 Settings → Pages 把 Source 改成 **GitHub Actions**，再用官方静态站点工作流发布根目录。

> 站点内所有资源都用相对路径（`./css/...`、`./assets/...`），因此放在仓库子路径下（`/ProductPage/`）也能正常工作，不需要改任何配置。若之后绑定自定义域名，加一个 `CNAME` 文件即可。

## 常见修改点

| 想改什么 | 去哪里 |
| --- | --- |
| 文案（中/英） | `index.html`，每个中文都用 `<span data-l="zh">…</span><span data-l="en">…</span>` 成对书写 |
| 配色 / 字号 / 圆角 | `css/style.css` 顶部 `:root` 中的设计 token |
| 下载链接 | 搜索 `#download` 区块里的 `href="https://github.com/HanShu-RPG-Tool-Kit/...` |
| 版本号 / 平台矩阵 | Hero 的 `badge`、`#download` 里的 `<dl class="dl-meta">`、`#specs` 表格 |
| 规格状态（stable / draft） | `#specs` 表格，`<span class="status stable">` 或 `draft` |
| FAQ | `#faq` 里的 `<details>/<summary>`，默认打开的在 `<details ... open>` |

### 加一段双语文案

```html
<p>
  <span data-l="zh">中文内容</span>
  <span data-l="en">English content</span>
</p>
```

> 全局规则会把 `data-l` 设为 `display:inline`；如果元素原本需要 `block`（如 `.f-label b`），记得在 CSS 里单独覆盖，参考 `style.css` 里的 `.float-card` 一节。
> 代码示例（`<pre>`）里的注释是固定中文，不参与切换。

## 内容口径说明

页面上的产品信息取自 `HanShuWebUI` 仓库与其 `src/help/docs/`（`about.md`、`welcome.md` 等），包括：

- 基线：Minecraft **26.1.2** / NeoForge **26.1.2.109** / Java **25**
- 许可：WebUI **MIT**，模组 **BUSL 1.1**（发布满两年转 MIT）
- 能力与边界：C/S 权威写入、工程历史、局域网协作、Devtool Server、PAK 分包、IBE Python 插件宿主
- 规范状态：`hanshu.kit.expr` V1 为正式版，`hanshu.kit.runtime` V1 为草案

**需要你确认后再上线的占位内容**（页面已用 ⓘ 标注，发布前请替换）：

- 版本号 `v0.1`（WebUI 的 `package.json` 是 `0.0.0`，不代表发布版本）
- 「前往 Releases」「获取模组」目前都指向仓库首页；等 Releases 真正发布后换成具体安装包链接
- 示例工程（`rainy-night`、阿岚、礼包 `boss_reward`）为演示用的虚构内容，不对应任何真实示例工程

## 浏览器支持

现代常青浏览器（Chrome / Edge / Firefox / Safari 近两年版本）。用到了 `:has`?否；主要依赖 CSS 变量、`clip-path`、`color-mix()`（较新浏览器），旧浏览器下配色会退化为纯色但不影响可读性。

## 许可

页面代码可自由修改；文中的 **HanShu / 汉书** 名称、图标与字标属于项目商标，不随代码许可开放。
