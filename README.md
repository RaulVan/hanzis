# 汉字网 Hanzis

一个无需账号、可离线构建的中文学习工具站。当前发布版已完整提供字帖生成、拼音学习、汉字笔顺、古诗词与中文字典，并可导出为纯静态站点。

## 功能

| 模块 | 路径 | 发布版能力 |
| --- | --- | --- |
| 字帖生成 | `/` | 四类字格、拼音、笔顺、描红、颜色与排版、多页 PDF、PNG、打印、配置保存与链接导入 |
| 拼音学习 | `/pinyin/` | 声母、韵母、整体认读、四声与轻声、同源录音、系统语音回退、10 题综合练习 |
| 汉字笔顺 | `/stroke/` | 单字查询、动画速度与暂停、逐笔分解、互动书写、错误恢复与跨模块入口 |
| 古诗词 | `/poetry/` | 30 首校对精选（含拼音）及 11,407 篇诗词作品、分页筛选、来源注解、收藏、朗读与选段字帖 |
| 中文字典 | `/dictionary/` | 汉字、词语、拼音、部首与笔画检索，分页结果、四来源释义与笔顺/字帖入口 |

全站另含响应式导航、键盘焦点、错误页、404、站点地图、robots、Web App Manifest、来源说明和隐私说明。

## 技术架构

- Next.js 16 App Router 静态导出、React 19、TypeScript 5.9、Tailwind CSS v4。
- shadcn 组件约定、Radix primitives、Lucide 图标与语义 Design Token。
- Zustand 只保存本机字帖设置；收藏与配置不上传服务器。
- Hanzi Writer 与本地 9,574 字笔画数据；jsPDF 在浏览器内生成 A4 文件。
- 简编本、修订本、第三方整理 chinese-xinhua 与开放词库分别按 128 个分片发布；构建过程不联网拉取数据。
- 所有主要页面、字典、笔画、录音和字体均可由普通静态服务器托管。

设计约定见 [Design.md](Design.md)，数据来源、许可和校验值见 [DATA_SOURCES.md](DATA_SOURCES.md)。

## 本地开发

要求 Node.js `>=20.9`，发布验收使用 Node.js `20.20.2`。

```bash
npm ci
npm run dev
```

开发服务器默认位于 <http://localhost:3000>。首次开发或构建会从已安装依赖和版本化快照生成静态笔画、词典、录音清单与公开许可文件。

## 检查与构建

```bash
npm run check
npm run build
npm run release:verify
npm run preview -- --port=4317
npm run test:e2e
```

- `check`：ESLint、TypeScript 和单元测试。
- `build`：生成 `out/` 纯静态站点。
- `release:verify`：核对页面、资源数量和关键入口。
- `preview`：用带安全响应头、Range 请求和正确 MIME 的本地服务器预览 `out/`。
- `test:e2e`：对核心页面执行 axe WCAG A/AA 扫描，并验证真实 PDF 下载。

本轮实测结果记录于 [QA_REPORT.md](QA_REPORT.md)。

## 发布

`out/` 中的内容可直接部署到静态站点根目录。已生成的根目录发布包位于：

```text
release/hanzis-static-2026-09-01.zip
```

详细上传、校验、冒烟检查和回滚步骤见 [DEPLOYMENT.md](DEPLOYMENT.md)。生产站点已通过 GitHub `main` 自动部署到 [hanzis.com](https://hanzis.com/)。

## 数据、授权与隐私

- 教育部《國語辭典簡編本》原始记录、cnchar-data、Hanzi Writer 字形数据和 Noto 字体均保留来源、版本与许可说明。
- `public/voice/` 中 1,678 个 MP3 已由项目所有者确认取得口头授权；书面授权协议说明待后续补充。录音不包含在源码 MIT License 中。
- 应用不提供账号，不接入广告或营销 Cookie；字帖导出在浏览器本地完成。生产环境使用 Cloudflare Web Analytics 汇总匿名访问与性能指标，托管方仍可能按其政策记录常规访问日志；详见站内隐私说明。

## 项目文档

- [task_plan.md](task_plan.md)：本轮范围、架构与实施结果。
- [progress.md](progress.md)：当前功能与验证进度。
- [findings.md](findings.md)：关键技术发现、修复和风险边界。
- [DATA_SOURCES.md](DATA_SOURCES.md)：数据来源、处理和授权状态。
- [QA_REPORT.md](QA_REPORT.md)：自动化与浏览器验收证据。
- [DEPLOYMENT.md](DEPLOYMENT.md)：发布与回滚手册。

诗词来源结构、导入与更新方法见 [诗词数据库说明](docs/haitang-database.md)。`npm run poetry:import -- --repo /path/to/haitang` 默认仅预览变更，明确加 `--write` 才导入。
