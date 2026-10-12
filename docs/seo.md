# SEO 维护说明

## 2026-10-12：Search Console 排除通知核查

本次实际进入 `hanzis.com` 域名资源核对报告（报告标注更新日期 2026-10-09）：39 个网址已编入索引，157 个未编入索引。用户收到的两类通知不是本次发现的代码故障，应保留现有规范化规则。

| 排除原因 | 实际网址 | 核查结果 |
| --- | --- | --- |
| 备用网页（有适当的规范标记） | 145 条，全部带查询参数：首页 `?text=` 71 条、字典 `?q=` 52 条、笔顺 `?char=` 16 条、诗词 `?poem=` 6 条 | 属于工具输入、查询或目录选择状态，沿用对应无参数页面的 canonical；不应让所有输入组合独立收录 |
| 网页会自动重定向 | 1 条：`http://hanzis.com/` | 正式响应为 301，直接指向 `https://hanzis.com/`；HTTPS 首页在网址检查中显示“网址已收录到 Google”，用户声明和 Google 选择的规范网址一致 |

正式站点验证：

- sitemap 中全部 49 条 URL 直接返回 200，无重定向，只有一个与自身 URL 一致的 canonical，且没有 robots meta noindex。
- 四类参数样本 `/?text=炉`、`/dictionary/?q=出`、`/stroke/?char=炉`、`/poetry/?poem=min-nong` 均返回 200，分别指向 `/`、`/dictionary/`、`/stroke/`、`/poetry/` 的 HTTPS canonical。
- Search Console 对 `/dictionary/?q=出` 的网址检查明确显示“备用网页（有适当的规范标记）”，抓取成功、允许编入索引，Google 选择的规范网址与用户声明的 `https://hanzis.com/dictionary/` 相同。
- `/pinyin` 正常 308 到 `/pinyin/`；sitemap 已使用最终带斜杠地址。
- 另有 10 条“已发现 - 尚未编入索引”和 1 条“已抓取 - 尚未编入索引”，属于其他状态，未将本轮规范化核查描述为解决这些索引选择问题。

无需删除 canonical、取消 HTTP→HTTPS 跳转、屏蔽参数 URL 抓取，或对这两项正常排除状态点击“验证修正情况”。现有参数链接仍承担用户输入与查询功能；保持其可用。正常排除记录可能继续显示，不以通知消失作为成功条件。

此次没有修改业务源码、推送、部署或重新请求索引；提交仅包含核查记录。临时证据：`/tmp/hanzis-gsc-alternates-20261012.json`、`/tmp/hanzis-seo-live-audit-20261012.json`、`/tmp/hanzis-gsc-home-indexed-20261012.png`。

官方依据：[Google 网页索引编制报告](https://support.google.com/webmasters/answer/7440203?hl=zh-Hans)将适当 canonical 的备用网页视为无需操作的正常状态；重定向源 URL 不收录，需要核对最终目标网址。

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
