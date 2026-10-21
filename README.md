# 木匠钉子 · Neil Chen

个人开发者主页。Astro + TypeScript，静态输出，无需后端。

- 个人介绍：我是木匠钉子(Neil Chen)
- 精选文章：直达现有 my-blog，不迁移文章
- 公开项目自动来自 GitHub，已删除、转私有、Fork 或归档的仓库不再展示
- 首屏展示一篇代表文章与一个自动排序的近期项目；项目排序仍参考 GitHub Star、默认分支最近提交和近 30 天活跃度
- 正文顺序：项目 → 博客 → 小工具；导航“小工具”点击展开目录
- 默认暖灰绿色浅色主题，卡片使用米灰色，支持深色；主题保存在浏览器本地
- 主页与博客共用导航名称与深浅色偏好，移动端导航始终可见；主页使用钉子标志和蓝绿色主色
- 响应式布局、键盘焦点、减少动效、404 页面

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

构建结果在 `dist/`。也可将 `dist/` 部署到其他静态托管平台。

## 内容维护

| 文件 | 内容 |
| --- | --- |
| `src/data/site.ts` | 名称、链接、项目中文文案覆盖 |
| `src/data/tools.json` | 工具目录，自动供主页正文、导航与博客菜单使用 |
| `src/data/repositories.json` | 可离线构建的 GitHub 公开数据快照 |
| `src/lib/catalog.mjs` | 统一仓库筛选与项目/工具目录 |
| `src/lib/live-catalog.ts` | 浏览器动态核对与页面更新 |
| `src/lib/recommendations.mjs` | 推荐排序与权重 |
| `src/data/posts.ts` | 精选文章标题、摘要、日期和链接 |
| `src/styles/global.css` | 浅色/深色颜色、布局与响应式样式 |
| `src/pages/index.astro` | 首页布局 |

项目无需手工录入：新增公开原创仓库会自动展示；`site.ts` 的项目条目只覆盖中文文案，不决定仓库是否存在。

增加工具时，只需在 `src/data/tools.json` 添加记录，已发布项目使用 `status: available` 并填写 `url`，`repository` 为对应仓库名。`/tools.json` 只提供已发布目录；主页和博客展开菜单时读取这一公共目录，并核对仓库与工具入口；空目录会清除旧链接。仓库被删除、转私有、归档、禁用或关闭 Pages，或工具地址返回 404/410 时隐藏入口，暂时的网络错误与限流保留已发布内容。不公开任何用户持仓数据。

## 自动推荐

候选为本人公开、非 Fork、未归档、未禁用且有提交的仓库，排除主页和博客站点仓库。既有项目保留中文说明；其它项目使用 GitHub 名称和简介。匹配已发布工具时优先直达工具，其余直达仓库。

评分为 `45% × Star 关注度 + 35% × 最近提交 + 20% × 活跃度`：

- Star 使用 `log(1+stars) / (log(1+stars)+log(11))`，避免热门仓库永久霸占推荐。
- 最近提交按默认分支提交时间指数衰减，时间常数为 30 天。
- 活跃度计算近 30 天提交，最多计入最近 20 次，以对数缩放限制刷屏影响。
- 首屏展示排序第一的项目，分数相同时以 Star、仓库名称保持确定顺序。

`npm run refresh:repos` 刷新本地快照。GitHub Actions 每小时第 17 分钟及推送时同步公开元数据后发布；实际运行时间受 GitHub 调度影响。主页打开时直接核对 GitHub 公开仓库列表，在前台每 5 分钟重新核对，所有分页成功后才替换推荐、正文项目和工具入口。仓库新增、删除、转私有或归档无需修改列表。浏览器只读取公开 API，不包含令牌；限流、离线或接口异常时保留最近同步内容，并显示核对失败提示。默认分支提交日期和活跃度由定时构建更新，浏览器核对保留这些已验证数据，新仓库未同步前不显示提交日期。

工具需同时满足目录声明、公开候选仓库及 Pages 可用性。同步时核对工具地址，404/410 将隐藏工具入口；网络异常不等同于删除。公开目录 `/tools.json` 也使用同一筛选规则，博客菜单在展开时额外核对仓库及地址。关闭 JavaScript 时仍可浏览最近构建的内容。

## GitHub Pages

目标仓库为 `czNail/cznail.github.io`，目标地址为 `https://cznail.github.io/`。

1. 新建公开仓库 `cznail.github.io`，上传源码到 `main`。
2. 仓库 Settings → Pages → Build and deployment，将 Source 设为 GitHub Actions。
3. 推送到 `main` 或手动运行 Deploy homepage to GitHub Pages 工作流。
4. 工作流执行类型检查、构建和部署。查看 Actions 中返回的站点地址。

根站点不设置 `/仓库名/` base。现有 `my-blog` 仓库与 `/my-blog/` 博客保持独立。不要在本仓库添加会遮蔽博客的 `public/my-blog/` 目录。

当前代码已准备部署；仓库创建和在线部署状态以 GitHub 的实际结果为准。

## 标志与公众号

- `src/components/NailMark.astro` 与 `public/favicon.svg` 使用相同的倾斜钉子轮廓。
- 首屏、文章区和页脚都有公众号入口。支持原生 dialog、Esc 关闭与焦点返回；禁用 JavaScript 时访问 `/wechat/` 独立关注页。
- `public/images/wechat-qrcode.jpg` 直接使用用户提供的原图，不做换色或裁切。公众号名称与地址在 `src/data/site.ts` 中维护。
- 项目卡片在自动更新后仍保留对应图形；工具的状态检查使用正式站点地址，避免本地预览把不存在的挂载路径误判为下线。

## 封面素材

`public/images/btree-cleanup.webp` 为本次通过内置 imagegen 生成的文章插画。原始图像保留，页面按 2.35:1 展示。生成提示词：

> Use case: illustration-story. Asset type: cover illustration for a Chinese developer's technical blog, article about cleaning duplicate keys and obsolete records in PostgreSQL B-tree indexes. Create a tasteful minimalist flat cartoon editorial illustration, widescreen aspect ratio exactly 2.35:1 (1880x800 if possible). A simple visual metaphor: two small rounded archival trays holding an orderly set of pale blue-green paper index cards; a few faded old paper slips are being gently swept to the side by one small warm ochre brush. A restrained, quiet composition with only a few clear objects, ample negative space, light warm off-white background #F2F4EF, low-saturation teal / blue / gray-green, tiny warm orange accents. Slight dimensionality and soft contact shadows, smooth rounded forms, polished contemporary illustration with subtle paper-like finish. The scene should read as tidying old duplicates, without explaining the algorithm. Main grouping in middle, leaving generous breathing room all around. No text, no letters, no numbers, no typography, no logos, no watermark, no UI, no code, no architecture diagram, no arrows, no people.


## 跨项目外观维护

`packages/site-ui` 是主页、博客、TOTP 与仓位助手的共享视觉基础。主页直接使用源码，其他项目使用带提交版本和 SHA-256 校验的构建副本。主题、图标和导航均随各站部署，浏览器无需加载远程共享脚本。

1. 修改共享包中的语义变量、公共组件或主题逻辑，更新 `package.json` 版本。
2. 执行 `node scripts/sync-site-ui.mjs --manifest`、`npm test`、`npm run check` 和 `npm run build`。
3. `Shared site visual checks` 工作流把本次共享源码接入四站构建，检查 375/1280px、浅色/深色、菜单、主题跨站与跨标签同步，上传截图供审查。
4. 推送后，消费者每日检查上游，构建通过后自动创建副本升级 PR。合并升级 PR 后，各自发布新版。紧急同步可手动触发各仓库 `Update shared site UI` 工作流。

[样式预览页](https://cznail.github.io/style-guide/) 集中展示颜色、排版与控件。截图检查用于发现视觉变化，仍需人工确认改版是否符合预期。

本地跨站检查要求四个仓库位于同级目录（主页目录名为 `homepage`），各自构建后在主页执行 `npx playwright install chromium`、`npm run test:visual`。截图位于 `artifacts/site-ui`。
