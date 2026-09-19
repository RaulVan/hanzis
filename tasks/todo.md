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

## 2026-09-19：SEO 生产发布

- 用户已明确授权提交和部署；目标为 GitHub `origin/main` → Cloudflare Pages → `https://hanzis.com/`。
- [x] 核对 SEO 提交 `0d050b3`、已有本地验收结果、远程配置和未提交改动。
- [x] 推送 SEO 提交并确认生产部署成功。
- [x] 核对正式域名正常缓存下的页面元数据、静态正文、结构化数据、robots/sitemap、404 与关键资源。
- [x] 记录生产结果并提交发布记录；保留游戏调研文档改动。

- SEO 代码提交：`0d050b3ff420342e61e484daea40ab005d48f47e`，已正常推送至 `origin/main`。
- Cloudflare Pages 部署：`ed6111ec-7cf9-4b91-9c4f-9c41250307dd`；GitHub 对应提交的 Pages 与 Workers Builds 检查均为 `success`。
- 正式域名验收：2026-09-19 07:38（Asia/Singapore），`https://hanzis.com/`；正常缓存请求遍历 sitemap 全部 42 页，标题/描述/canonical/OG/Twitter 与本地输出一致，静态正文及 JSON-LD 可读取，robots/sitemap 正常。
- 真实未知路由返回 404/noindex，MP3 Range 返回 206/32 字节，汉字/字典 JSON、manifest MIME 及 CSP/nosniff 正常。
- Playwright Chromium 1440×1000、390×844：首页与诗词详情无溢出，目录 → 静夜思 → 刷新 → 面包屑返回通过，控制台/运行错误均为 0；另以禁用 JavaScript 的上下文确认诗词标题直接可见。
- 证据：`/tmp/hanzis-seo-qa/production-result.json` 与同目录 `production-*.png`；搜索引擎实际收录/排名变化仍需后续观察，不作为部署成功条件。

## 2026-09-19：字典新增修订本与第三方整理来源

- 范围：保留现有简编本与开放词库，新增 g0v 修订本及 pwxcoo/chinese-xinhua 的汉字、词语、成语资料；各来源独立展示，不改写原文，不推送/部署。
- [x] 固定上游版本，导入可复现压缩快照与来源/许可说明。
- [x] 构建本地静态分片，扩展统一检索与按来源加载，隔离单源失败。
- [x] 沿用现有设计展示修订本、第三方释义及来源信息，更新帮助与数据说明。
- [x] 执行数据完整性/检索测试、构建、静态校验与桌面/手机浏览器验证。
- [x] 精确暂存并创建本地提交，保留其他任务改动。

- 数据：修订本 `a6dc997`，161,194 条；chinese-xinhua `fe6d6c2`，汉字 16,142、词语 264,434、成语 30,895，共 311,471 条记录，保留重复词头与原始字段。moedict-process 为上游处理工具，不另计来源。
- 验证：`npm run check`（lint、typecheck、33 项测试）通过；全量新增记录与 256 个分片逐条一致。`npm run build`、`npm run release:verify` 通过；导出 12,864 个文件、285,314,845 字节，四来源各 128 分片及许可文件完整。
- Playwright：`npx playwright test tests/e2e/dictionary-sources.spec.ts` 7/7 通过；覆盖 1440×900、375×812 四来源展开/原始异读、修订本独有查询、第三方汉字/成语字段、索引单源失败、释义单源失败、全释义失败与重试。两尺寸无横向溢出、无运行异常，axe WCAG A/AA 自动检查无违规。
- 视觉证据：`/tmp/hanzis-dictionary-1440.png`、`/tmp/hanzis-dictionary-375.png`，已检查来源分区、原文与窄屏换行。
- 本次仅本地提交，未推送或部署；保留既有游戏调研任务及 `docs/hanzi-game-research.md`。

## 2026-09-19：接入海棠诗社诗词资料与更新流程

- 范围：深入核对 leozxl/haitang database 的结构、实际读取链路及更新缺口；固定源版本，补充诗词资料，保留现有 30 首校对内容与链接；仅本地提交。
- [x] 对比 SQLite/JSON、统计数据与缺失项，记录许可、来源和可复现更新流程。
- [x] 添加只读导入/差异检查工具、完整压缩源快照与校验元数据；构建不联网。
- [x] 以分页检索、按需分片扩展诗词阅读，支持来源/朝代/选集筛选、收藏、原文与现有学习入口。
- [x] 完成数据完整性、更新流程、构建/静态预算及桌面/手机交互验证。
- [x] 精确提交本次文件，保留既有游戏调研改动；不推送、不部署。

- 源版本：`leozxl/haitang@8b0ac46f8a69764ec561591f06095c9ccc67503f`。库内版本 `gvToP2VKK60l16PozICg` 标记为 2023-12-08；完整保留 9 表、11,407 篇作品、2,402 位作者，页面可浏览 387 个有本地作品的选集。
- 审计：SQLite integrity_check=ok；记录 145 条库外作品关联、collection_quotes 主键 1/dd 差异，保留 SQLite 原记录。仓库无完整抓取/同步更新脚本；Code MIT 不作为整库文字独立许可，保留西窗烛来源与上游声明。
- 更新：`scripts/import-haitang.py` 默认预览，报告新增/修改/删除 ID 与源文件校验值；`--write` 显式导入，SQLite/JSON 不一致须审阅并明确使用 `--allow-json-drift`。同版本再次预览各表变化均为 0。具体操作见 `docs/haitang-database.md`。
- 数据/代码检查：`npm run check` 36 项测试通过；新增源数据测试核对全部作品与 128 分片、原文/缺失字段、稳定 ID 筛选；导入 CLI 的 3 个隔离测试验证只读预览、版本差异、确定性 gzip、源库脏改动与差异阻断。最后改动后补跑相关数据/CLI 检查。
- 生产构建 `npm run build` 与 `npm run release:verify` 通过，导出 12,996 文件、334,435,532 字节。原 30 首静态页面、元数据、结构化数据与 sitemap 保留，新增资料使用 query 地址和按需分片，未生成 11,407 份 HTML。
- Browser plugin not available，使用项目 Playwright：诗词 8 场景通过，另 SEO 2 场景通过。覆盖 1440×900/375×812、译注/无拼音提示、朝代/选集/来源与分页、旧新收藏与重载、失败重试、无效 ID、长篇可编辑 200 字选段、作品链接/背诵、慢请求不覆盖当前作品。首次定位器角色错误已修正并复跑通过。
- 视觉证据：`/tmp/hanzis-haitang-1440.png`、`/tmp/hanzis-haitang-375.png`；已检查，两个尺寸无横向溢出、无浏览器运行或控制台错误，axe WCAG A/AA 自动检查无违规。
- 本次仅提交诗词接入及说明，保留已有游戏调研任务与 `docs/hanzi-game-research.md`。未推送、未部署，生产状态未作本次验收。


## 2026-09-19：统一诗词展示与移除来源品牌

- 范围：移除页面、筛选、帮助与 SEO 的原来源品牌；保留作品内容、收藏和既有链接，真实来源与许可在审计文件保留。按用户确认的最终来源关系，将页面来源统一标注 chinese-poetry，不更换当前数据。
- [x] 核对现有来源与 chinese-poetry 数据结构，区分参考链接和实际换库。
- [x] 修改诗词页面、提示、分类与说明。
- [x] 验证构建、桌面/手机阅读及收藏筛选，精确本地提交。
- 未执行：推送、部署。

- 验证：lint、生产构建（含 TypeScript）和静态导出校验通过；12,996 文件。既有诗词 8 场景、来源署名与原诗保留 1 场景、SEO 2 场景均通过。
- Browser plugin not available，沿用项目 Playwright；1440×900 与 375×812 无横向溢出、无控制台/运行错误，axe A/AA 自动检查通过，已查看截图。
- 范围说明：正文中 4 处平台版本署名仅在显示层去除，引用古籍、诗句与词牌保持；源码兼容 ID、原始快照、来源审计与许可文件保留。游戏调研的既有未提交改动保留。
