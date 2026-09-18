# Hanzis 发布版实施与验收

## 目标与边界

- 目标：完成字帖、拼音、笔顺、诗词、字典五个核心模块，统一设计并交付可部署的静态构建。
- 基线：2026-09-01；保留工作区原有及未提交改动，不执行未经授权的提交、推送或生产部署。
- 音频：1,678 个 MP3 已获口头授权并纳入发布，书面协议说明待补充。
- 范围外：账号/服务端、云同步、支付、多语言与生产基础设施变更。

## 架构

- `app/`：静态页面、SEO、错误与 404。
- `components/layout`、`components/ui`：全站壳层、shadcn/Radix 组件与交互语义。
- `components/{worksheet,pinyin,stroke,poetry,dictionary}`：按业务职责拆分页面功能。
- `lib/`、`stores/`：数据适配、导出、朗读、查询与版本化本地状态。
- `data/`、`public/`、`licenses/`：版本化内容、发布资产与许可。
- `Design.md`：设计 token、布局、状态、响应式与参考差异。

## 实施清单

- [x] 1. 基线审计：核对文档、入口、资源、依赖、Git 根与已有 diff。
- [x] 2. 设计系统：参考图、tokens、共用组件、桌面/移动导航、焦点与 44px 触控区。
- [x] 3. 字帖：输入、四类格子、注音/笔顺、描红、颜色、保存、多页 PDF/PNG/打印。
- [x] 4. 拼音与笔顺：分类、调值、录音/语音回退、综合练习、动画/分解/书写及错误恢复。
- [x] 5. 诗词与字典：来源明确的搜索、详情、译注/释义、朗读/背诵与跨模块入口。
- [x] 6. 发布加固：依赖、安全头、SEO、404、Range、MIME、静态生成与资源完整性。
- [x] 7. 完整 QA：干净安装、lint、类型、32 项单测、构建、审计、2 项 E2E、桌面与手机浏览器。
- [x] 8. 交付：更新 README/计划/进度/发现，补充 QA/部署文档，生成 ZIP 与 SHA-256。

## 验收结论

- 五个核心入口无占位内容。
- 12 个手机页面无横向溢出，字典最终快捷按钮修正后所有可见按钮不小于 44×44。
- PDF、PNG、打印 iframe、本地录音、系统语音回退、笔顺动画/练习、收藏、背诵与字典查询均有真实浏览器证据。
- 静态输出 12,644 文件，发布 ZIP 12,697 条目且完整性通过。
- 发布包：`release/hanzis-static-2026-09-01.zip`。

## 目标环境待办

以下项目不属于本轮代码阻塞：

- [x] 生产站点上传与域名/CDN 冒烟。
- [ ] 物理打印机纸张与边距确认。
- [ ] 真实中文输入法 composition 事件确认。
- [x] 生产托管平台实际安全头和 Range 确认。
- [ ] 拼音录音书面授权协议说明归档。

详见 [QA_REPORT.md](../QA_REPORT.md) 与 [DEPLOYMENT.md](../DEPLOYMENT.md)。

## 2026-09-01：输入框重复红框修复

- [x] 定位全局 focus outline 与 shadcn 表单组件 focus ring 的叠加来源。
- [x] 统一 `Input`、`Textarea`、`InputGroup` 为单层朱红焦点边界，保留错误状态语义。
- [x] 通过静态检查、构建和真实浏览器核对字帖、诗词、字典、笔顺输入框。
- [x] 推送 GitHub 并完成 Cloudflare 生产部署冒烟。

## 2026-09-19：网站 SEO 优化

- 范围：现有静态路由的搜索与分享元数据、可抓取正文/内链、真实内容结构化数据；沿用现有设计，不部署或推送。
- [x] 核对 Git 基线、现有 SEO、Next.js 本地文档与 Google Search Central 指引。
- [x] 统一页面 canonical、独立标题/描述及 Open Graph/Twitter 分享信息。
- [x] 增加服务端工具说明、完整诗词链接及首页/诗词结构化数据。
- [x] 验证全部导出页面、无 JavaScript 抓取与桌面/手机布局；执行检查、构建、静态发布校验。
- [x] 记录结果；仅暂存并本地提交本轮 SEO 文件及本节记录。
- 未执行：生产部署、搜索平台站点验证/提交与收录排名评估；这些需要部署或站长平台访问。

### 验证证据与实现说明

- `npm run check`：lint、TypeScript、32/32 单测通过；新增 E2E 后再次通过 lint/类型检查。
- `npm run build` 及最终修正后的 `npx next build`：静态构建通过；后者复用同一批已校验的本地资源。
- `npm run test:e2e`：4/4 通过，包含现有无障碍/PDF 回归及新增无 JavaScript SEO 测试。遍历 sitemap 全部 42 页，核对独立标题/描述、canonical、Open Graph、Twitter、语言、单一 H1、robots 和 404 noindex。
- `npm run release:verify`：12,601 个导出文件、45 个 HTML，静态内链和资源完整性通过。
- 浏览器：Browser plugin not available，使用项目 Playwright Chromium；预览地址 `http://127.0.0.1:4321`，1440×1000、390×844。核对首页、笔顺、字典、诗词目录和详情；无横向溢出、框架错误或控制台错误，目录 → 静夜思 → 面包屑返回通过。截图位于 `/tmp/hanzis-seo-qa/`。
- 修复实测发现的两项问题：首页不继承同层 layout 的 title template，统一显式绝对标题；全局 `app/loading.tsx` 将异步诗词详情置于需脚本显示的隐藏片段，移除此边界并保留工具局部 Suspense，确保静态正文直接可见。
- 结构化数据仅描述真实站点、诗词作品/作者与页面路径；JSON-LD 序列化转义 `<`，不添加虚构评分或无效搜索操作。
- 指引：[Google 标题规范](https://developers.google.com/search/docs/appearance/title-link)、[canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)、[站点名称](https://developers.google.com/search/docs/appearance/site-names)、本地 Next.js metadata/JSON-LD/static export/loading 文档。
- 构建存在 Node `module.register()` 弃用和 Browserslist 数据较旧提示，不影响本次通过；未扩展到依赖升级。
- 生产收录、排名和真实流量未验证；本轮没有推送、部署或向第三方提交站点。
