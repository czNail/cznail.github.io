# 木匠钉子 · Neil Chen

个人开发者主页。Astro + TypeScript，静态输出，无需后端。

- 个人介绍：我是木匠钉子(Neil Chen)
- 精选文章：直达现有 my-blog，不迁移文章
- 公开项目：GMKit、Code Mate
- 首屏推荐根据 GitHub Star、默认分支最近提交和近 30 天活跃度自动排序
- 正文顺序：项目 → 博客 → 小工具；导航“小工具”点击展开目录
- 默认浅色，支持深色；主题保存在浏览器本地
- 主页与博客共用导航名称、蓝色主题与深浅色偏好，移动端导航始终可见
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
| `src/data/site.ts` | 名称、链接、项目 |
| `src/data/tools.json` | 工具目录，自动供主页正文、导航与博客菜单使用 |
| `src/data/repositories.json` | 可离线构建的 GitHub 公开数据快照 |
| `src/lib/recommendations.mjs` | 推荐排序与权重 |
| `src/data/posts.ts` | 精选文章标题、摘要、日期和链接 |
| `src/styles/global.css` | 浅色/深色颜色、布局与响应式样式 |
| `src/pages/index.astro` | 首页布局 |

增加工具时，只需在 `src/data/tools.json` 添加记录，已发布项目使用 `status: available` 并填写 `url`，`repository` 为对应仓库名。`/tools.json` 只提供已发布目录；主页和博客展开菜单时读取这一公共目录，加载失败仍可用静态入口。不公开任何用户持仓数据。

## 自动推荐

候选为本人公开、非 Fork、未归档、未禁用且有提交的仓库，排除主页和博客站点仓库。既有项目保留中文说明；其它项目使用 GitHub 名称和简介。匹配已发布工具时优先直达工具，其余直达仓库。

评分为 `45% × Star 关注度 + 35% × 最近提交 + 20% × 活跃度`：

- Star 使用 `log(1+stars) / (log(1+stars)+log(11))`，避免热门仓库永久霸占推荐。
- 最近提交按默认分支提交时间指数衰减，时间常数为 30 天。
- 活跃度计算近 30 天提交，最多计入最近 20 次，以对数缩放限制刷屏影响。
- 展示前 3 项，分数相同时以 Star、仓库名称保持确定顺序。

`npm run refresh:repos` 刷新本地快照。GitHub Actions 每日 UTC 00:00（北京时间 08:00）及推送时同步公开元数据后发布，访问者不调用 GitHub API。接口不可用时沿用随代码保存的快照，页面显示数据更新日期；实际运行时间受 GitHub 调度影响。默认分支提交读取失败时，仅为仍公开的候选保留旧提交数据。

## GitHub Pages

目标仓库为 `czNail/cznail.github.io`，目标地址为 `https://cznail.github.io/`。

1. 新建公开仓库 `cznail.github.io`，上传源码到 `main`。
2. 仓库 Settings → Pages → Build and deployment，将 Source 设为 GitHub Actions。
3. 推送到 `main` 或手动运行 Deploy homepage to GitHub Pages 工作流。
4. 工作流执行类型检查、构建和部署。查看 Actions 中返回的站点地址。

根站点不设置 `/仓库名/` base。现有 `my-blog` 仓库与 `/my-blog/` 博客保持独立。不要在本仓库添加会遮蔽博客的 `public/my-blog/` 目录。

当前代码已准备部署；仓库创建和在线部署状态以 GitHub 的实际结果为准。
