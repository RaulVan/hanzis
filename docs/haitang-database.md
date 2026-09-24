# 海棠诗社 database：实际结构、接入方式与更新流程

核对日期：2026-09-19。仓库固定为 [`leozxl/haitang@8b0ac46f8a69764ec561591f06095c9ccc67503f`](https://github.com/leozxl/haitang/tree/8b0ac46f8a69764ec561591f06095c9ccc67503f)，以下结论来自源码和实际 SQLite/JSON 对比，不以 README 的历史描述代替当前实现。

## 结论

数据可以复用，但不能仅复制 `src/database` 就让本站直接使用。海棠依赖 Astro、better-sqlite3 和 Drizzle，本站是 Next.js 静态导出；本站通过只读导出把完整数据库转换为可校验的本地快照，在构建时生成静态索引和 128 个正文分片，不引入 SQLite 服务端或海棠的应用依赖。

数据有 11,407 篇作品，包含诗、词、文、曲、赋，不只是唐宋诗。本站保留原有 30 首校对精选；海棠资料另标来源，不覆盖原 URL、已校对拼音、译文或收藏。同名作品不按标题去重，扩展标识固定为 `haitang-<works.id>`。

## 海棠实际怎样读取数据

| 部分 | 实际入口和作用 |
| --- | --- |
| SQLite | [`src/database/poetry.db`](https://github.com/leozxl/haitang/blob/8b0ac46f8a69764ec561591f06095c9ccc67503f/src/database/poetry.db)，约 62.4 MB；包含 9 张表，是详情页使用的数据 |
| 数据访问 | [`localdb.ts`](https://github.com/leozxl/haitang/blob/8b0ac46f8a69764ec561591f06095c9ccc67503f/src/database/localdb.ts) 用 `better-sqlite3` 的 `readonly: true, fileMustExist: true` 打开文件，再传给 Drizzle。注释虽然提到 migration，实际没有执行迁移、建表或种子导入 |
| 类型映射 | [`schema_sqlite.ts`](https://github.com/leozxl/haitang/blob/8b0ac46f8a69764ec561591f06095c9ccc67503f/src/database/schema_sqlite.ts) 定义 ORM 表和字段；不是数据库自动同步器，也不是原始数据下载脚本 |
| 作品详情 | [`src/pages/works/[id].astro`](https://github.com/leozxl/haitang/blob/8b0ac46f8a69764ec561591f06095c9ccc67503f/src/pages/works/%5Bid%5D.astro) 按 ID 查 `works`，再查 `collection_works` 和 `quotes`，显示原文、注解、翻译、简介、评价和佳句 |
| 搜索 | [`scripts/build_search.js`](https://github.com/leozxl/haitang/blob/8b0ac46f8a69764ec561591f06095c9ccc67503f/scripts/build_search.js) 读取 JSON 的 works/authors/collections，写 `public/search.json`；它只重建搜索索引，不更新诗词或同步 SQLite |
| 每日推荐 | [`scripts/build_date.js`](https://github.com/leozxl/haitang/blob/8b0ac46f8a69764ec561591f06095c9ccc67503f/scripts/build_date.js) 从 quotes.json 按顺序生成 `.json/date.json`，以 2024-04-15 为起点映射作品 ID；不是内容更新器 |
| 构建/部署 | 当前 `astro.config.mjs` 为 `output: 'server'`，作者、选集和作品详情 `prerender=false`；Vercel 打包显式包含 poetry.db。README「纯静态」描述已不足以说明当前代码 |

**没有发现**自动从西窗烛同步、增量抓取、定时更新、编辑后台或 JSON ↔ SQLite 数据同步脚本。`yarn generate` 只是调用 drizzle-kit 的 schema migration 命令，不能当作诗词数据更新命令；仓库中也没有配套的 drizzle-kit 配置和完整迁移应用链路。

## 数据表与真实覆盖

| 表 | 条数 | 关系/用途 |
| --- | ---: | --- |
| works | 11,407 | 作品正文，主键 id，author_id 关联作者 |
| authors | 2,402 | 作者资料 |
| dynasties | 18 | 朝代与介绍 |
| collections | 663 | 选集、主题等分类；其中 online_data=0 有 387 个、=1 有 276 个 |
| collection_kinds | 15 | 选集分类类型 |
| collection_works | 14,261 | 选集与作品的多对多关系、show_order |
| quotes | 7,216 | 佳句，work_id 关联作品 |
| collection_quotes | 8,300 | 选集与佳句的关系 |
| version | 1 | `gvToP2VKK60l16PozICg`，generated_at=`2023-12-08 00:41:10` |

作品类别：诗 3,290、词 4,741、文 2,971、曲 378、赋 27。朝代覆盖上古至当代，其中当代 98 篇。上游 2026-09-15 的代码提交不代表数据库内容更新到了该日期。

作品字段包括 `title/content/foreword/intro/annotation/translation/master_comment`，及相应繁体字段；有 `layout=center/indent`。**无拼音字段**。5,799 篇无注解，6,241 篇无译文，6,769 篇无简介；本站不填造缺失内容。

对比 SQLite 与 JSON：

- works 的共有字段逐项相同，但 SQLite 多 `appreciations` 字段，其中 4,447 篇非空，内容为鉴赏书籍/文章元数据及短摘录。JSON 的 `appreciations_tr` 不是这个字段的替代。本次保留于源快照，前端不展示这些书籍摘录，也不抓取远端文章。
- quotes 与 collection_quotes 的 SQLite 多出字体错误标记列，不能通过 JSON 重建整表时无意丢掉这些字段。
- collection_quotes 的首条逻辑关系，在 JSON 主键为整数 `1`，SQLite 主键为文本 `dd`。本站记录差异并以 SQLite 原记录为准，未修改源库。
- 145 条 collection_works 指向库内不存在的作品。快照保留，前端过滤无效关联，实际可浏览作品的选集为 387 个。选集计数使用现有有效关系重算，不盲信来源的 works_count。
- SQLite `PRAGMA integrity_check` 为 `ok`；物理完整不代表上述逻辑关系没有缺失。

## 本站怎样使用

```text
固定版本的 poetry.db + 对应 JSON + LICENSE/README
  → scripts/import-haitang.py（只读审计，默认预览）
  → data/haitang-source.json.gz + haitang-manifest.json
  → npm run assets / npm run build
  → public/poetry/haitang/index.json + 00..7f.json
  → 目录分页、按需读取正文、收藏和学习入口
```

- 完整 9 表快照保留全部原字段。manifest 记录 Git SHA、源数据库和每个 JSON 的 SHA-256、压缩与原始快照 SHA-256、表计数、差异和缺失引用。
- 网站正文分片仅发布阅读所需字段及实际可用的选集和佳句，原文不改写；显示时只把 CRLF/CR 换行规范为 LF。所有文本按 React 文本节点显示，不执行来源 HTML。
- 索引包含标题、作者、朝代、类别、开篇 120 字和选集 ID，约 4.3 MB；不会把整库约 18.5 MB 正文塞进首屏或 JS bundle。检索范围明确标示为开篇检索，正文按需加载。
- 目录每页 24 条，支持来源、朝代、选集和收藏筛选。缓存附快照版本，失败可重试，切换作品防止旧请求覆盖新选择。
- 目录选择沿用 `/poetry/?poem=haitang-10103` 这样的稳定 ID；“打开作品链接”进入 `/poetry/read/?poem=haitang-10103` 独立阅读。该入口复用详情分片，不加载完整目录。原 30 首独立 HTML、SEO 正文和 sitemap 保留；11,407 篇扩展作品不逐一静态生成（当前发布文件预算少于 20,000）。这些 query 阅读状态不作为新增的独立可抓取 SEO 页面。
- 海棠来源不显示伪造拼音；长段落暂不提供逐句默写。长篇字帖使用明确可编辑选段，继续遵守每次 200 汉字上限，不静默截断原文。
- 收藏仍用既有 localStorage 字符串数组，增加 `haitang-<id>`，原收藏不迁移。移除的源 ID 保留在本机收藏中，目录仅显示仍可用作品；直接访问已移除作品会提示。

## 更新本站：推荐操作

先取得一个固定、干净的源仓库版本。以下示例只操作独立的来源目录，不能用本站目录代替：

```sh
git clone https://github.com/leozxl/haitang.git /tmp/haitang-update
git -C /tmp/haitang-update checkout 8b0ac46f8a69764ec561591f06095c9ccc67503f

# 在 Hanzis 根目录运行；默认只读预览，不修改本站数据。
npm run poetry:import -- --repo /tmp/haitang-update --report /tmp/haitang-update-report.json
```

后续更新时先在来源目录 `git fetch origin`，审阅目标提交，checkout 到选定 SHA，然后再次预览。比较报告中的：

1. `revision` 与 `databaseVersion`，区分代码版本与内容版本；源文件 `sourceSha256` 是否实际变化。
2. 各表 `changes` 和 `changeIds`：新增、修改、移除记录数及精确 ID；不要用作品名当主键。
3. `jsonComparison`、`missingReferences`，特别是删除作品、丢失关联和共同字段不一致。
4. LICENSE/README 与内容来源是否改变。

确认后显式写入：

```sh
npm run poetry:import -- --repo /tmp/haitang-update --write
```

如果仍是本次已核对的 `collection_quotes` 主键差异，默认写入会拒绝。**先查看报告，确认差异可以接受**，再显式以 SQLite 为准：

```sh
npm run poetry:import -- --repo /tmp/haitang-update --report /tmp/haitang-update-report.json --write --allow-json-drift
npm run assets
npm run check
npm run build
npm run release:verify
npx playwright test tests/e2e/poetry-haitang.spec.ts tests/e2e/seo.spec.ts
```

`--allow-json-drift` 不是同步命令，也不修复或忽略记录：差异完整保留在报告和 manifest。不要把该参数加入无人值守自动任务去接受未知差异。脚本要求来源数据库和许可文件没有未提交改动，并以只读方式打开源 SQLite。

审阅本站 `data/haitang-*`、`licenses/haitang-*` 及来源说明的差异后提交。构建和部署不会自动抓取最新诗词；推送/部署另按项目发布流程执行。

## 若要维护 haitang 自己的 database

单改 JSON 不会改变海棠详情页；单改 SQLite 不会同步搜索和日期推荐。所以应选 SQLite 为编辑主数据，在独立分支和备份上修改，再导出对应 JSON。

- 先备份 poetry.db 和 json 目录，在 SQLite 事务内按主键更新已有作品。新增作品同时检查 author_id、dynasty、collection_works、quotes/collection_quotes 关系；勿通过覆盖整表丢掉 SQLite 独有字段。
- 发布新 ID 后保持稳定；修改标题不更换 ID。删除前检查引用，不借用其他作品的旧 ID。
- 导出 JSON 时按表保存 `{ "表名": [记录...] }`，按稳定主键排序；保留原 JSON 字段合同，不用手写截断列表覆盖整库。若要对齐两份格式中的额外字段，先审查消费代码。
- 同步 `version` 表与 `version.json`，用真实内容修改日期；只重新构建网站不应伪造数据库内容更新时间。
- 执行 integrity_check、重复 ID、孤立关联及 SQLite/JSON 一致性检查，再提交数据库与 JSON。当前 `collection_quotes.id='dd'` 如需修正，必须单独核查后修改两份，不由本站导入器自动修复。
- 在海棠仓库运行 `yarn build_search`、`yarn build_date`、`yarn build`，才能重建派生资源和网站。这些命令本身不会下载新诗词。没有得到许可的远端或在线专属资料，不因 `online_data` 字段存在就自动补抓。

## 来源与许可边界

[上游 README](https://github.com/leozxl/haitang/blob/8b0ac46f8a69764ec561591f06095c9ccc67503f/README.md) 明确感谢西窗烛，并将 MIT 标为 **Code License**。因此保留上游作者/来源声明，不能据此把所有数据库文字、现代译注、书籍摘录和当代作品视为 MIT 或公版。本次不调用远端服务、不下载图片或鉴赏正文；来源与文本权利边界在关于页和作品资料区可见。
