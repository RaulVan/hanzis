# Hanzis 数据来源与发布边界

本文件记录静态发布包中学习数据的来源、处理方式、规模与许可。构建脚本只读取版本化或已安装的本地输入，不在构建时联网下载数据。

## 汉字字形与笔顺

- 输入：`hanzi-writer-data` 2.0.1，共 9,574 个单字 JSON。
- 来源：<https://github.com/chanind/hanzi-writer-data>，其数据来自 Make Me A Hanzi。
- 处理：`scripts/prepare-assets.mjs` 不改写笔画内容，只将文件名转换为 Unicode code point，输出到 `public/hanzi/`，供 Hanzi Writer 同源加载。
- 许可：底层字形资料采用 Arphic Public License；完整文本见 `licenses/ARPHICPL.TXT`，归属说明见 `licenses/NOTICE.txt`。

## 开放字词释义

- 输入：`data/dictionary-source.json.gz`，包含 278,369 个字词键。
- 来源：cnchar-data 1.1.0，<https://github.com/theajack/cnchar>。
- 处理：词条内容不改写，按首个 Unicode code point 分为 128 个静态 JSON 分片，并生成检索索引。
- 压缩快照 SHA-256：`a433d1c954afb3f08309f57aafc58e084d557f13d490e636b2e415b7877fec76`。
- 许可：MIT License，见 `licenses/cnchar-data-MIT.txt`。词库含历史用法，个别条目可能缺少释义，页面会明确显示资料范围。

## 教育部《國語辭典簡編本》

- 输入：版本 `2014_20260626`，45,130 条原始记录，其中 6,028 个不同的单字词头。
- 来源：中華民國教育部《國語辭典簡編本》，<https://dict.concised.moe.edu.tw/>。
- 原始下载包 SHA-256：`fc83d27eb3fbf6fcfdb791e7d05ef60946b58ef8e8857ed165b612217b392806`。
- 本地压缩快照 SHA-256：`ecf26f7e6ecc48016598f4e4d156573083baa414a867d581e69d6135447510c2`。
- 处理：`scripts/import-moe-data.py` 保留所有原始字段、繁体字与音读，仅转换技术封装格式；`scripts/prepare-assets.mjs` 按词头分片。简体检索映射和网站学习提示独立呈现，不写回原始条目。
- 许可：CC BY-ND 3.0 TW 及教育部公众授权说明。归属与完整使用说明分别见 `licenses/MOE-Concised-NOTICE.txt` 和 `licenses/MOE-Concised-Usage.pdf`。本网站不代表资料著作权利人，也不表示获得其推荐。

## 拼音录音与系统语音

- 本地资源：`public/voice/` 中 1,678 个 MP3，文件名采用无调号拼音加 1–4 声；`ü` 在文件名中写作 `v`。
- 授权状态：项目所有者于 2026-09-01 确认已取得口头授权，书面授权说明后续补充。录音不包含在源码 MIT License 中。
- 使用边界：代码只播放 `data/audio-manifest.json` 白名单中的同源文件，不把轻声错误映射为一声；轻声或未收录的例音会明确回退到设备的系统中文语音。
- 验证：发布验收需核对清单、MP3 容器可读性和浏览器真实播放。授权状态与技术完整性分别记录。

## 诗词、拼音与学习说明

- 首发收录 30 首公版唐宋诗词，采用常见简体文本。
- 逐字拼音、译文与学习注释在项目中逐条编辑和校核，没有把第三方现代译注整库复制进发布包。
- 拼音标示字典本调；连读时可能发生变调。页面会提示这一差异，朗读由本地录音或设备系统语音完成。
- 自动化测试核对每句汉字数与拼音音节数一致、路由唯一、字帖导入不超过当前 200 字限制。

## 字体与软件库

- Noto Sans SC 与 Noto Serif SC：SIL Open Font License 1.1，许可文本位于 `licenses/Noto-*-OFL.txt`。
- cnchar 软件包：MIT License，见 `licenses/cnchar-MIT.txt`。
- 其他 npm 软件依赖的许可随各自包分发；它们不改变上述学习数据与录音的授权范围。

`scripts/prepare-assets.mjs` 会校验两个词典源快照的 SHA-256，生成 `data/asset-manifest.json`，并把许可文件复制到公开的 `/licenses/`。快照或归属信息发生变化时，构建会失败，必须先复核来源再更新校验值。

## 新增多来源字典（2026-09-19）

各来源独立呈现；同名记录、异读和原字段保留，跨来源不合并释义或改写繁体原文。检索时做简繁查询键映射，单源网络失败显示提示和重试，其他来源仍可阅读。部首、笔画、拼音过滤仍基于 cnchar 基础字形资料，不代表各词典完整覆盖这些检索字段。

| 来源 | 固定版本 | 实际导入记录数 |
| --- | --- | ---: |
| [g0v/moedict-data 修订本](https://github.com/g0v/moedict-data/tree/a6dc997417507eb510fc29822bc514de2c92728c) | a6dc997417507eb510fc29822bc514de2c92728c | 161,194 |
| [pwxcoo/chinese-xinhua](https://github.com/pwxcoo/chinese-xinhua/tree/fe6d6c2e8baa82187f4c96bbe042e43f96c05666) 汉字 | fe6d6c2e8baa82187f4c96bbe042e43f96c05666 | 16,142（14,810 个不同词头） |
| 同上，词语 | 同上 | 264,434（264,374 个不同词头） |
| 同上，成语 | 同上 | 30,895 |

- 修订本使用 `dict-revised.json.xz`，未使用混合其他翻译辞典的 translated 或 pack 数据。上游 README 标示版次为「中華民國110年11月臺灣學術網路第六版」，不把 GitHub 提交时间当作官方数据版本。原始罕用字标记如 `{[8ff0]}` 保留，未猜测替换。
- [moedict-process](https://github.com/g0v/moedict-process/tree/735443d3e19bbda117c3dab6fa18039ed73f4246) 是该数据生态的处理工具，不是第三套独立释义。本项目采用 moedict-data 已转换的 JSON，未运行其转换器；本地只作无损压缩、按词头分片。
- 修订本正文版权归教育部，CC BY-ND 3.0 TW；上游格式整理部分 CC0。保留 `licenses/moedict-data-README.txt` 与完整授权说明 `licenses/MOE-Revised-Usage.txt`（官方 PDF 全文转录，仅调整换行）。
- chinese-xinhua 明确标注第三方网络整理，非官方《新华字典》版本。保留仓库 MIT License 与上游完整 README 的 Copyright 声明；MIT 不代表已逐条核验所抓取内容的权利。本次不含歇后语。
- 上游 README 标称成语 31,648 条，但固定提交的 JSON 实际为 30,895 条，以文件实测为准。三类共 311,471 条记录；多音、多条同名数据均保留，数字不表示独立字词数量。

### 复现

`data/dictionary-sources.json` 记录下载 URL、提交、原始文件 SHA-256、gzip 快照 SHA-256 和记录数。将四个 URL 对应文件下载为 `dict-revised.json.xz`、`word.json`、`ci.json`、`idiom.json` 后运行：

```sh
python3 scripts/import-dictionary-sources.py /path/to/downloads
npm run assets
```

导入前校验固定上游 SHA-256；gzip 固定 mtime，解压后与上游 JSON 字节一致。正常构建只读取仓库快照，核验校验和与条目数，然后生成每来源 128 个同源静态分片。修订本、第三方字典另有完整词头索引，成语附分类索引。快照不作为前端 bundle 导入。

## 扩展诗词资料（内部溯源）

- 固定 [leozxl/haitang 8b0ac46](https://github.com/leozxl/haitang/tree/8b0ac46f8a69764ec561591f06095c9ccc67503f/src/database)，从 SQLite 只读导出全部 9 张表，共 11,407 篇作品、2,402 位作者、18 个朝代、663 个选集、7,216 条佳句。完整记录保留于 `data/haitang-source.json.gz`，来源文件与快照校验值记录于 `data/haitang-manifest.json`。
- 数据库 `version` 表标记日期为 2023-12-08，GitHub 2026-09-15 提交时间不表示资料更新时间。数据含诗、词、文、曲、赋及当代作品；不把整库声明为公版古诗。
- 上游 README 注明数据来自西窗烛，并明确「Code License: MIT」，未给数据库全部文字单独许可；保留 `licenses/haitang-MIT.txt`、`licenses/haitang-README.txt`。不联网抓取图片、鉴赏书籍或 `online_data=1` 指向的外部内容。
- 网站保留 30 首本站校对精选及原有 URL、收藏。扩展作品使用 `haitang-<id>`，同名不同作者或同作不同来源不按标题去重。按需加载 128 个详情分片，目录分页展示。原始数据库没有拼音字段；本站构建时另生成机器注音，原始字段保持不变，译文、注解缺失时如实提示。
- 完整性边界：145 条选集关系指向库外作品；保留于源快照，目录不生成不存在作品。`collection_quotes` 的一条主键在 JSON 为 `1`、SQLite 为 `dd`，只读保留并明确记录，不自动改动源库。
- 上方扩展目录检索标题、作者、朝代、类别、开篇 120 字；未宣称整库全文搜索。扩展作品通过 `/poetry/?poem=haitang-<id>` 分享，不为 11,407 篇逐一生成静态 HTML，以保留当前部署文件预算；原 30 首静态正文、结构化数据及 sitemap 路由保持。
- 完整架构、差异审计、上游更新和本站导入步骤见 [docs/haitang-database.md](docs/haitang-database.md)。

- 展示约定（2026-09-19）：网站阅读页、目录、帮助与 SEO 不再显示来源品牌或来源分类。项目方确认原库最终来源相同，要求页面统一标注 `chinese-poetry/chinese-poetry`；本次依该确认修改展示署名，未替换数据库，未独立逐篇核验其与该仓库的对应关系。上述快照、来源链、许可与稳定 ID 保留，便于更新和兼容原收藏。
- 显示层另移除译注中 4 处“西窗烛…版本据”的平台署名，保留所引古籍；诗句、词牌及文学引用中的同名词语不变。压缩源数据及生成分片不改写。

## 诗词自动注音

- 使用 MIT 许可的 `pinyin-pro@3.29.4`，通过本站现有校对诗句和作品位置纠音补充；与原文来源署名分开，不宣称上游提供拼音。
- 原有 30 首人工注音保持不变，扩展作品标明自动注音；未知读音保留空位。生成方法、更新/缓存规则与人工纠音见 [docs/poetry-pinyin.md](docs/poetry-pinyin.md)。
