# 木匠钉子 · Neil Chen

个人开发者主页。Astro + TypeScript，静态输出，无需后端。

- 保留灰绿色浅色主题、深色主题、鲨鱼头像与共享导航。
- 首屏展示一篇代表文章与固定的代表作品 PostgreSQL 实验台，不按 Star 或提交活跃度轮换。
- 首页将项目与工具合并为一个作品区：在线工具优先「打开使用」，同时保留「查看源码」；纯源码作品使用「查看项目」。默认展示四个作品，更多作品使用原生 details 展开。
- 实验台与仓位助手使用真实界面截图；TOTP、Code Mate 使用紧凑图标。文章使用现有主题封面。
- 访客打开主页或展开工具菜单均不请求 GitHub、不探测工具地址、不轮询、不重新排列内容。
- 项目目录在部署时刷新；网络异常时使用已验证静态快照。主页菜单直接使用构建时目录，其他站点可按需读取 `/tools.json` 静态文件一次。
- 保留 `/my-blog/`、`/#projects`、`/#tools`、公众号入口、RSS、键盘导航、减少动效与 404 页面。禁用 JavaScript 时主要内容、工具菜单与作品链接仍可用。

## 本地运行

需要 Node.js 24。

```sh
npm ci
npm run dev
```

检查与构建：

```sh
npm test
npm run check
npm run build
npm run preview
```

构建结果在 `dist/`，可部署到任意静态托管平台。

## 内容与展示维护

| 文件 | 内容 |
| --- | --- |
| `src/data/site.ts` | 个人资料、链接与目录组装 |
| `src/data/showcase.ts` | 固定代表作品、作品顺序、用途文案、主要功能与界面截图 |
| `src/data/posts.ts` | 精选文章标题、摘要、日期、链接与主题封面 |
| 各项目仓库的 `homepage.json` | 项目名称、展示信息、图标与可选在线入口 |
| `src/data/repositories.json` | GitHub 元数据与项目展示配置的静态快照 |
| `public/project-icons/` | 随快照保存的项目图标 |
| `public/images/` | 头像、公众号二维码、文章封面和工具界面预览 |
| `src/lib/catalog.mjs` | 构建时仓库筛选与项目/工具目录 |
| `src/lib/works.mjs` | 合并源码与在线入口、应用固定展示顺序 |
| `src/pages/index.astro` | 首页结构 |
| `src/styles/global.css` | 主页业务布局、阅读字号与响应式样式 |
| `packages/site-ui` | 跨站颜色、导航、页脚与主题行为的唯一来源 |

已发布作品仍由仓库快照决定：删除、转私有、Fork、归档或禁用的仓库不会因固定文案或截图配置而重新出现。新公开原创项目在下一次成功部署后进入目录，未指定顺序的项目按仓库名稳定排列。`featuredRepository` 只从现有作品中选择；该项目不再公开时隐藏推荐，不回退到随机活跃项目。

用途简介只需在 `showcase.ts` 维护一份，作品区、首屏与工具菜单共用。已有作品的名称、图标和在线入口继续来自各自仓库的 `homepage.json`。

### 界面预览

`pg-playground-preview.webp` 来自 PostgreSQL 实验台的临时数据库与内置执行计划示例；`portfolio-pilot-preview.webp` 来自仓位助手的虚构演示，不含用户持仓或账号数据。图片裁去全站导航、版本信息等易变内容，只保留主要操作区。它们是静态展示素材，不随访客访问生成；工具界面发生较大变化时再替换即可。

文章封面直接使用已有的 `btree-cleanup.webp`，保持约 2.35:1 比例。

## 项目自行声明展示信息

每个项目在仓库根目录维护 `homepage.json`：

```json
{
  "schemaVersion": 1,
  "name": "TOTP 验证器",
  "description": "在浏览器里管理动态验证码",
  "label": "隐私与安全",
  "tags": ["TypeScript", "本地加密"],
  "icon": "./assets/homepage-icon.svg",
  "tool": {
    "url": "https://cznail.github.io/totp/",
    "features": ["多账号", "本地加密", "加密备份"],
    "status": "available"
  }
}
```

- `schemaVersion` 必须为 `1`；其他展示字段可省略。图标使用仓库内相对路径，支持独立 SVG、PNG、WebP、JPEG，最大 512 KiB；SVG 不得包含脚本或外部引用。
- `tool` 可省略。声明 HTTPS 地址或本站相对路径，且状态为 `available` 时提供在线入口；纯源码项目仍可展示。
- 部署在同一提交读取配置和图标，将图片复制为本地资源；无需逐个访客请求仓库配置。图标失败时使用默认图标。
- 配置或图标的 404 视为明确移除；暂时网络错误、限流或无效配置保留上次已验证内容。入口 404/410 时只隐藏在线入口，保留源码作品。
- `/tools.json`、主页工具菜单与作品按钮使用同一份目录。主页菜单不需要加载目录请求；其他使用 `/tools-menu.js` 的站点可读取一次静态目录，失败则保留构建好的入口。

## GitHub Pages 部署

仓库：`czNail/cznail.github.io`。站点：`https://cznail.github.io/`。

推送 `main` 或手动运行 `Deploy homepage to GitHub Pages` 工作流时：

1. 从 GitHub 读取公开项目及 `homepage.json`，刷新构建快照。
2. 执行测试、类型检查和静态构建。
3. 发布 GitHub Pages。

不再每小时自动重建。项目新增、下线或调整展示信息后，手动触发部署或随下一次主页推送更新即可。工作流缓存最近成功快照与图标，缓存未命中时使用仓库快照；临时网络错误不会清空已验证目录。

本地刷新：

```sh
npm run refresh:repos
```

根站点不设置仓库名 base；现有博客继续使用独立仓库与 `/my-blog/` 路径。不要在主页添加遮蔽博客的 `public/my-blog/` 目录。

## 共享外观与验证

`packages/site-ui` 是主页、博客、TOTP 与仓位助手的共享视觉来源。其他站点使用带提交版本和 SHA-256 校验的生成副本；浏览器无需加载远程共享脚本。

1. 在共享包修改语义颜色、导航或主题行为，更新包版本。
2. 执行 `node scripts/sync-site-ui.mjs --manifest`、`npm test`、`npm run check`、`npm run build`。
3. `Shared site visual checks` 工作流将本次共享源码用于四站构建，检查 375/1280px、浅色/深色、导航、菜单、跨站与跨标签主题，并上传截图。
4. 消费者按原有工作流生成升级 PR，合并后随各站发布；不要手工修改生成副本。

本地跨站检查需要同级的 `homepage`、`my-blog`、`totp`、`portfolio-pilot` 四个仓库。用 `node scripts/sync-site-ui.mjs --from ../homepage` 在消费者加载本地共享源码，各自构建后在主页运行 `npm run test:visual`。截图位于 `artifacts/site-ui`。测试也覆盖主页不请求 GitHub、作品唯一、两个独立操作、静态预览图片加载和无 JavaScript 浏览。

[样式预览页](https://cznail.github.io/style-guide/) 集中展示颜色、排版和控件。

## 公众号

公众号二维码继续使用 `public/images/wechat-qrcode.jpg` 原图，不换色或裁切。原生 dialog 支持 Esc 关闭与焦点返回；禁用 JavaScript 时访问 `/wechat/` 独立关注页。
