# 木匠钉子 · Neil Chen

个人开发者主页。Astro + TypeScript，静态输出，无需后端。

- 个人介绍：我是木匠钉子(Neil Chen)
- 精选文章：直达现有 my-blog，不迁移文章
- 公开项目：GMKit、Code Mate
- 工具：Portfolio Pilot 预留卡片，开发中时没有跳转链接
- 默认浅色，支持深色；主题保存在浏览器本地
- 响应式布局、移动导航、键盘焦点、减少动效、404 页面

## 本地运行

需要 Node.js 24。

```sh
npm ci
npm run dev
```

检查与构建：

```sh
npm run check
npm run build
npm run preview
```

构建结果在 `dist/`。也可将 `dist/` 部署到其他静态托管平台。

## 内容维护

| 文件 | 内容 |
| --- | --- |
| `src/data/site.ts` | 名称、链接、项目、工具及其状态 |
| `src/data/posts.ts` | 精选文章标题、摘要、日期和链接 |
| `src/styles/global.css` | 浅色/深色颜色、布局与响应式样式 |
| `src/pages/index.astro` | 首页布局 |

发布仓位计算器后，在 `src/data/site.ts` 中将对应工具的 `status` 改为 `available`，并把 `url` 设为实际发布地址。卡片自动显示“打开工具”。主页不会读取仓位或持仓数据。

## GitHub Pages

目标仓库为 `czNail/cznail.github.io`，目标地址为 `https://cznail.github.io/`。

1. 新建公开仓库 `cznail.github.io`，上传源码到 `main`。
2. 仓库 Settings → Pages → Build and deployment，将 Source 设为 GitHub Actions。
3. 推送到 `main` 或手动运行 Deploy homepage to GitHub Pages 工作流。
4. 工作流执行类型检查、构建和部署。查看 Actions 中返回的站点地址。

根站点不设置 `/仓库名/` base。现有 `my-blog` 仓库与 `/my-blog/` 博客保持独立。不要在本仓库添加会遮蔽博客的 `public/my-blog/` 目录。

当前代码已准备部署；仓库创建和在线部署状态以 GitHub 的实际结果为准。
