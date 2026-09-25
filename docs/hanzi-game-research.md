# 汉字 / 拼音 / 成语 / 词语 / 古诗词网页游戏调研与自研建议

> 调研日期：2026-09-19  
> 范围：GitHub 公开仓库、README、关键源码入口、仓库 API 元数据与许可证文件。  
> 结论性质：玩法和工程参考，不等同于对上游内容、题库、音频或代码的商业授权。

## 1. 结论先行

GitHub 上已经有几条值得借鉴的实现路线，但没有必要直接 Fork 一个项目作为 Hanzis 的新主干。最稳妥的方向是复用现有内容能力和视觉系统，自研轻量、短局、可重复游玩的小游戏。

推荐顺序：

1. **P0：汉字词语消除**。参考 `lapsea/hanzi-match-game`，规则直观、题库容易校验、无需音频，适合先做成独立路由。
2. **P0：拼音快答**。参考 `vivianluchen/PinyinGame` 的模式、计时、得分和提示闭环，但题库、声调规则和输入法处理要重新设计。
3. **P1：古诗词碎片重组**。参考 `bigxinxin-spec/chinese-poetry-game`，和现有诗词内容天然衔接，拖拽也可以降级为点击排序以适配手机。
4. **P1：成语接龙 / 词语链**。把词语释义、首尾字和难度结合起来，形成比单纯背诵更强的重复练习。
5. **P2：成语声韵 Wordle**。参考 `antfu/handle`、`cheeaun/chengyu-wordle` 和 `AllanChain/chinese-wordle`，玩法传播性强，但拼音拆分、重复字、题库质量和分享协议更复杂。
6. **暂缓：听音辨字**。现有项目仍有拼音录音书面授权待归档事项，新增音频玩法应等权利边界明确后再做。

总体判断：先做一个不依赖新媒体素材的 P0 小游戏，比同时开发多个入口更容易验证留存、移动端输入和题库质量。

## 2. 候选项目总览

| 项目 | 类型与已核实玩法 | 技术 / 活跃度线索 | 许可证与复用判断 |
| --- | --- | --- | --- |
| [antfu/handle](https://github.com/antfu/handle) | “汉兜”，汉字 Wordle；README 说明答案库在 2023-02-28 后不再更新 | TypeScript；1,439 stars、217 forks；最近推送 2025-02-12；在线地址 [handle.antfu.me](https://handle.antfu.me) | [MIT](https://github.com/antfu/handle/blob/main/LICENSE)。适合作为汉字/成语 Wordle 的产品和数据组织参考；仍需单独审查题库来源。 |
| [cheeaun/chengyu-wordle](https://github.com/cheeaun/chengyu-wordle) | 6 次机会猜四字成语，支持中文本地化和结果分享；README 描述了原始数据、处理后题库和高频成语列表 | Preact + Vite + JavaScript；101 stars、25 forks；最近推送 2023-08-15；在线地址 [cheeaun.github.io/chengyu-wordle](https://cheeaun.github.io/chengyu-wordle/) | README 声明除 Wordle 外的部分使用 MIT，但仓库 API 未返回标准 license 字段。适合参考数据处理、结果分享和本地化，不建议直接复制题库。 |
| [AllanChain/chinese-wordle](https://github.com/AllanChain/chinese-wordle) | “拼成语”：按声母、韵母和位置猜成语，颜色提示区分位置、存在性和韵母组合，并提供难度提示、统计和链接分享 | Vue；21 stars、5 forks；最近推送 2023-05-03；在线地址 [allanchain.github.io/chinese-wordle](https://allanchain.github.io/chinese-wordle/) | [BSD-3-Clause](https://github.com/AllanChain/chinese-wordle/blob/main/LICENSE)。玩法机制很有参考价值，但汉语拼音拆分和数据来源要重新验证。 |
| [lapsea/hanzi-match-game](https://github.com/lapsea/hanzi-match-game) | 6×6 汉字棋盘；按正确顺序点出两个字组成词语并消除；3 个难度、15 关、提示、重开、自定义 txt 字库和本地保存 | React + TypeScript + Vite；16 stars、4 forks；最近推送 2026-08-20；在线地址 [hanzi-match.pages.dev](https://hanzi-match.pages.dev/) | 仓库 API 未返回 license 字段，README 也未声明公开许可证。只借鉴玩法和产品结构，不直接复制代码、题库或视觉资产。 |
| [vivianluchen/PinyinGame](https://github.com/vivianluchen/PinyinGame) | 拼音打字：初级/中级模式，显示汉字，输入拼音；答对加 10 分，计时 180 秒，可显示提示、跳过和反馈 | React + TypeScript + Vite；0 stars；最近推送 2025-01-09；[App.tsx](https://github.com/vivianluchen/PinyinGame/blob/main/src/App.tsx) 和 [Game.tsx](https://github.com/vivianluchen/PinyinGame/blob/main/src/components/game/Game.tsx) 可直接看到状态机 | [MIT](https://github.com/vivianluchen/PinyinGame/blob/main/LICENSE)。适合参考最小闭环，但其汉字库硬编码、题量和声调规则都不够生产化。 |
| [Cybernetic1/Pinyin-Game](https://github.com/Cybernetic1/Pinyin-Game) | 传统 HTML/JS 拼音游戏；屏幕按钮和键盘输入声母，显示拼音和音调，带背景音乐和音效 | HTML + Vanilla JS；0 stars；最近推送 2023-05-31；关键入口为 [index.html](https://github.com/Cybernetic1/Pinyin-Game/blob/main/index.html)、[game.js](https://github.com/Cybernetic1/Pinyin-Game/blob/main/game.js) 和 [chinese-words.txt](https://github.com/Cybernetic1/Pinyin-Game/blob/main/chinese-words.txt) | 未看到公开 license 字段或许可文件。仅作为输入交互和音调展示的灵感，不进入直接复用名单；音频也不应复制。 |
| [chuiziyao/xixi-poem-game](https://github.com/chuiziyao/xixi-poem-game) | 面向学生的诗词闯关；选择题、填空题、限时模式、主题关卡、连击、成就、称号、进度解锁、诗人简介和原文赏析 | 纯前端 HTML5 + JavaScript；4 stars；最近推送 2026-04-20；在线地址见 [README](https://github.com/chuiziyao/xixi-poem-game/blob/main/README.md) | [MIT](https://github.com/chuiziyao/xixi-poem-game/blob/main/LICENSE)，但 README 明确说明背景音乐和音效来自第三方版权方。可参考关卡与成就结构，不复制音频。 |
| [bigxinxin-spec/chinese-poetry-game](https://github.com/bigxinxin-spec/chinese-poetry-game) | 古诗词连连看；把诗句文字打散，再拖拽组成完整诗句，支持动画、难度和进度保存 | React 18 + TypeScript + Vite + React DnD + Framer Motion + Zustand；0 stars；最近推送 2024-11-26；见 [README](https://github.com/bigxinxin-spec/chinese-poetry-game/blob/main/README.md) | 仓库 API 未返回 license 字段，README 未声明公开许可证。只参考交互和状态拆分，不直接复用。 |

## 3. 值得借鉴的实现模式

### 3.1 短局 + 即时反馈

成熟项目大多把一局压缩到几十秒或几分钟内：

- `PinyinGame` 用 180 秒倒计时、答对加分、错误反馈和自动换题构成循环。
- `chengyu-wordle` 用固定次数猜测和颜色提示制造“再试一次”的动机。
- `xixi-poem-game` 用 30 秒限时、答对加时、答错扣生命值制造节奏。

Hanzis 的第一版应避免复杂账号和服务端排行榜，先把“出题 -> 作答 -> 反馈 -> 下一题 -> 本地进度”做完整。

### 3.2 内容数据与游戏逻辑分离

`handle`、`chengyu-wordle` 和 `hanzi-match-game` 都体现了内容层独立于界面层的价值：

- 成语、拼音、释义、难度、标签应是可版本化的数据文件。
- 游戏运行时只读取经过校验的题目，不在组件中散落大量题目。
- 自定义字库应走明确的数据格式、重复项检查和最小题量检查。
- 每条内容应保留 `source`、`license`、`reviewStatus` 等元数据，避免“题库能跑但来源说不清”。

建议的通用题目结构：

```ts
type LearningItem = {
  id: string;
  kind: "hanzi" | "word" | "chengyu" | "poem";
  prompt: string;
  answer: string;
  pinyin?: string;
  explanation?: string;
  level: 1 | 2 | 3;
  tags: string[];
  source: string;
  license?: string;
  reviewStatus: "unreviewed" | "reviewed";
};
```

### 3.3 难度不是单纯加速

`AllanChain/chinese-wordle` 的价值在于它把难度放在提示数量和获得提示的条件上，而不只是减少时间。可以迁移到 Hanzis：

- 入门：显示完整拼音或释义，允许跳过。
- 进阶：只显示声母、韵母、首字或部件。
- 挑战：限制错误次数，加入重复字和近义词干扰。

### 3.4 分享与本地进度可以后置到最小版本

`chengyu-wordle` 的结果分享和 `xixi-poem-game` 的成就系统值得保留为扩展点，但不应阻塞第一个可玩的版本。首版优先使用 `localStorage` 保存：

- 今日完成次数和连续天数。
- 每个游戏的最高分、最快时间和已解锁关卡。
- 题库版本号，避免题库更新后旧进度解释错误。

## 4. Hanzis 的自研小游戏候选

| 优先级 | 游戏 | 核心循环 | 教学目标 | MVP 范围 | 主要风险 |
| --- | --- | --- | --- | --- | --- |
| P0 | 汉字词语消除 | 6×6 棋盘点选两个字，按顺序组成词语后消除 | 识字、组词、词序 | 3 个难度、每级 5 关、提示、重开、过关反馈、本地进度 | 词语合法性和歧义需要题库校验；无许可证题库不可直接搬运 |
| P0 | 拼音快答 | 显示汉字或词语，输入不带调/带调拼音，答对得分 | 拼音拼写、声母韵母、声调 | 单字与双字词两种模式、90/180 秒、错误提示、跳过、结果页 | 真实中文输入法 composition 事件、ü/v、轻声和多音字规则 |
| P1 | 古诗词碎片重组 | 打散诗句，点击或拖拽排列，完成后显示作者、出处和译注 | 诗句记忆、顺序和语境 | 20 首来源明确的诗，点击排序优先，拖拽增强，难度分级 | 诗句文本版本、断句、教材版本差异 |
| P1 | 成语接龙 / 词语链 | 根据前一个词的末字选择下一个词，显示释义和例句 | 词汇联想、字形和语义 | 单人闯关、错误原因、有限提示、关卡词库 | 多音字、同字异音、成语边界和题库分支 |
| P2 | 成语声韵 Wordle | 猜四字成语，反馈字位置、声母、韵母、声调和释义线索 | 成语、拼音和语音结构 | 固定每日题、6 次机会、结果分享、简单/困难提示 | 拼音算法复杂；题库和分享结果需要稳定版本 |
| P2 | 听音辨字 | 播放音频，选择汉字或拼音 | 听辨、声调和词义 | 只有在音频授权归档后再设计 | 音频版权、浏览器自动播放、录音质量和设备差异 |

## 5. 推荐的首个自研版本

### 方案：汉字词语消除

选择它的理由：

- 不依赖录音、TTS 或第三方音乐，避开当前授权待办。
- 规则可在一屏内解释，移动端点击操作比复杂输入更稳。
- 能直接连接现有字典、词语和汉字内容，不需要先做拼音解析器。
- 具备自然的关卡、提示、重开、星级和本地进度扩展点。
- `lapsea/hanzi-match-game` 已验证这一玩法方向，但没有公开许可证，因此只把它当作交互参考。

建议的第一版规则：

1. 棋盘 4×4 起步，保证手机屏幕上每个格子有足够的触控面积。
2. 每关由 8 个二字词组成，共 16 个汉字；只有按正确词序点选才算成功。
3. 点错时说明“顺序不对”“不是本关词语”或“先完成其他组合”，不要只显示失败。
4. 提示只高亮一个合法词对，并消耗一次提示或星级。
5. 通关后展示词语释义、拼音和一个例句，避免游戏与学习脱节。
6. 题库只使用已审校内容，题目记录来源和授权状态。

建议路由：`/games/hanzi-match`

### 后续共用组件

如果 P0 验证通过，再抽取轻量的游戏壳层，而不是一开始建设完整游戏引擎：

- `GameShell`：标题、返回、暂停、进度和结果页。
- `QuestionCard`：题面、提示和解释。
- `GameFeedback`：正确、错误、连击、提示和完成状态。
- `ProgressStore`：版本化本地存储。
- `ContentValidator`：题目重复、空答案、字符数和来源状态检查。

这些组件可以被拼音快答、古诗词重组和成语游戏复用；题型规则仍应保留在各游戏模块中，避免一个“大而全”的状态机。

## 6. 许可证、题库和素材边界

这次调研最重要的复用结论不是“哪个仓库最好”，而是“代码、题库、图片、字体、音频不能视为同一种资产”。

- MIT 和 BSD-3-Clause 通常允许在满足保留版权和许可文本等条件下使用代码，但仍要逐项检查仓库中的第三方依赖和数据来源。
- 没有 `LICENSE` 或仓库 API 未返回许可证的项目，只作为玩法和架构参考，不直接复制代码。
- `chengyu-wordle` 的 README 明确区分原始数据、处理后题库和高频成语数据；Hanzis 若采用类似数据，必须记录来源和再分发条件。
- `AllanChain/chinese-wordle` 的 README 指出成语和拼音参考 THUOCL、汉典、`pypinyin` 等来源；这些上游数据的授权边界不能由下游仓库的 BSD 许可证自动覆盖。
- `xixi-poem-game` 虽声明 MIT，但 README 同时说明背景音乐和音效来自第三方版权方，不能随 MIT 代码一起复制。
- 当前 Hanzis 的拼音录音仍有书面授权说明待归档，因此本报告不建议把任何上游音频纳入新小游戏。

## 7. 实施建议与验收门槛

### 实施顺序

1. 先为 `/games/hanzi-match` 建立独立页面和本地题库，不动现有五个核心入口。
2. 先用 15 至 30 关经过人工审校的内容验证规则、手机布局和重复游玩。
3. 再补拼音快答，先支持不带调输入，明确多音字和声调策略后再扩展。
4. 最后考虑成语 Wordle、分享和排行榜；分享功能应使用可版本化的题目 ID，而不是把答案直接写入 URL。

### 最小验收门槛

- 桌面和手机宽度下无横向溢出，所有主要触控目标不小于项目现有规范。
- 首屏能在无需注册、无需联网 API 的情况下开始游戏。
- 每道题都能回溯到题库记录的来源和审校状态。
- 错误反馈能解释原因，结果页能回看答案、拼音和释义。
- 刷新页面后进度不丢失，题库版本变化不会错误恢复旧关卡。
- 不引入未确认授权的音频、图片、字体或题库文件。

## 8. 本次调研的证据边界

- “玩法存在”依据仓库 README 或关键源码确认。
- “活跃度”只表示 GitHub API 返回的最近推送、stars、forks 和归档字段，不代表项目仍有稳定维护者或生产质量。
- “可借鉴”是工程判断，不是上游作者授权。
- 没有对这些仓库执行本地构建、在线游戏全流程或真机兼容性测试；需要采用某个项目的代码前，应单独做依赖、许可证、题库和运行验证。

