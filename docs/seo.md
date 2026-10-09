# SEO 维护说明

## 当前实现

- 百度搜索资源平台使用根 layout 的 `baidu-site-verification` 标签验证 https://hanzis.com。2026-10-09 标签随 66fbfbe 部署，正式首页可读取，百度后台提示验证成功；保留标签以维持状态。所有权验证不等于抓取或收录。后续尝试 sitemap 提交时，百度显示该站点今日额度为 0，输入框与提交按钮不可用，未能提交。正式 sitemap HTTP 200，包含 49 个 URL；配额开放后再提交。
- 同日尝试手动提交页面链接（每批最多 20 条）：填入首批 20 条、点击提交并由用户处理验证码后，百度返回“您今日的链接提交量已达上限，请改天提交”，未确认任何链接接收成功。49 条页面链接已按 20/20/9 分批，余下两批未提交。API 与手动提交共享配额，暂不追加 API 推送；配额恢复后再提交并核对实际接收结果。
- 正式域名为 `https://hanzis.com`，页面统一尾斜杠。`lib/seo.ts` 生成各页独立标题、描述、canonical、Open Graph 和 Twitter 大图卡片。
- `public/social-card.png` 为 1200 × 630 PNG；调整品牌图后运行 `npx tsx scripts/generate-share-image.tsx`，检查图片并提交产物与源码。
- sitemap 当前包含 19 个固定入口与 30 首精选诗词。新增可索引页面时同步 `app/sitemap.ts`；SEO 浏览器测试会检测固定页面遗漏。
- 拼音 6 个页面分别输出课程 H1、说明和面包屑。JSON-LD 对应可见导航；诗词详情保留原文与作品结构化数据，诗词和游戏目录的 ItemList 与实际链接共用数据。
- 查询参数页面沿用该工具页 canonical，不为每次查询、字帖内容或每日题目建立重复索引页。
- `/poetry/read/` 保留 `noindex, follow` 且不进入 sitemap：扩展诗库在浏览器加载，当前不具备独立作品的静态正文与元数据。现有扩展作品可用、可分享，不等于每篇已具备搜索收录条件。后续扩展静态作品页需单独评估内容质量、重复作品与静态文件数量预算。
- robots 允许抓取，不屏蔽上述 noindex 阅读页，确保爬虫能够读取 noindex 指令。404 保留 noindex。
- `public/llms.txt` 发布为 `/llms.txt`，使用 Markdown 提供网站说明、栏目与课程链接、资料来源和使用限制。栏目、路径或来源说明变化时同步维护；它是 AI 工具的辅助导航，不替代 robots、sitemap 或真实正文，也不保证 AI 引用与收录。规范参考：[llms.txt 提案](https://llmstxt.org/)。

## 本地验证

```sh
npm run check
npm run build
npm run release:verify
npx playwright test tests/e2e/seo.spec.ts
```

SEO 测试对 sitemap 所有 URL 关闭 JavaScript，核对状态码、标题和描述唯一性、canonical、分享信息、单一 H1；同时检查图片 PNG 及尺寸、参数页 canonical、阅读页 noindex、结构化数据链接，以及拼音页手机/桌面布局和导航。

## 发布后的独立验收

本地提交不代表部署或搜索引擎收录。经授权部署后，复查正式域名上的 robots、sitemap、分享图、HTML 和真实不存在地址的 404 状态；在已验证的网站管理账号中提交 `https://hanzis.com/sitemap.xml`，使用 URL 检查确认抓取与索引状态。搜索流量、排名与富媒体展示需持续观察，不能由本地测试保证。

参考：[Google sitemap 指南](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)、[面包屑结构化数据](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)。sitemap 帮助发现 URL，结构化数据表达页面内容，两者都不保证收录或特定搜索展示。
