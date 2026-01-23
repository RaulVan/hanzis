# Hanzis.com - 中文学习平台规划

## 项目概述

**网站**: https://hanzis.com  
**定位**: 综合性中文学习工具平台  
**目标用户**: 汉字初学者、小学生、中文学习者、海外华人子女

**核心模块**:

| 模块 | 功能 | 状态 | 优先级 |
|------|------|------|--------|
| 字帖生成器 | 生成田字格/米字格字帖，支持拼音、笔顺 | **已完成** | P0 |
| 拼音学习 | 拼音字母表、声母韵母、声调练习 | pending | P1 |
| 汉字笔顺 | 单字笔顺查询、笔顺动画、笔画练习 | **已完成** | P1 |
| 古诗词 | 古诗词库、朗读、注释、背诵练习 | pending | P2 |
| 中文字典 | 汉字查询、释义、组词、例句 | pending | P2 |

---

## 模块一：字帖生成器 [complete]

**路径**: `/` (首页)  
**功能**: 生成可打印的汉字练习字帖

### 已完成功能

- [x] 汉字输入（手动输入）
- [x] 格子类型（田字格/米字格/回宫格/空白格）
- [x] 拼音显示（四线三格样式）
- [x] 笔顺显示（fanning式笔画分解）
- [x] 描红模式（首字高亮 + 描红字）
- [x] 颜色自定义（描字/首字/线条/拼音/笔顺）
- [x] 方格数量动态计算
- [x] PDF导出（多页）
- [x] 打印支持
- [x] 本地设置持久化
- [x] Cloudflare Pages 部署

### 技术栈

```
框架: Next.js 16+ (App Router) + TypeScript
UI: Tailwind CSS v4 + shadcn/ui
汉字处理: cnchar + cnchar-poly + cnchar-order + cnchar-radical
笔画渲染: hanzi-writer (SVG paths)
PDF生成: jspdf + html2canvas
状态管理: Zustand (persist)
部署: Cloudflare Pages
```

---

## 模块二：拼音学习 [pending]

**路径**: `/pinyin`  
**功能**: 系统学习汉语拼音

### 功能规划

| 子功能 | 描述 | 优先级 |
|--------|------|--------|
| 拼音字母表 | 完整26字母对应拼音 | P1 |
| 声母表 | 23个声母，发音示例 | P1 |
| 韵母表 | 24个韵母（单韵母/复韵母/鼻韵母） | P1 |
| 整体认读音节 | 16个整体认读音节 | P1 |
| 声调练习 | 四声+轻声，听音辨调 | P1 |
| 拼音拼读 | 声母+韵母组合练习 | P2 |
| 拼音字帖 | 生成拼音练习字帖 | P2 |

### 数据结构

```typescript
// 声母定义
interface Initial {
  letter: string;       // 'b'
  pinyin: string;       // 'bō'
  audio?: string;       // 发音音频URL
  examples: string[];   // ['爸', '不', '北']
}

// 韵母定义
interface Final {
  letter: string;       // 'a'
  pinyin: string;       // 'ā'
  type: 'single' | 'compound' | 'nasal';
  audio?: string;
  examples: string[];
}

// 整体认读音节
interface WholeReadSyllable {
  syllable: string;     // 'zhi'
  pinyin: string;       // 'zhī'
  characters: string[]; // ['知', '织', '之']
}
```

### 页面结构

```
/pinyin
├── /initials          # 声母表
├── /finals            # 韵母表
├── /syllables         # 整体认读音节
├── /tones             # 声调练习
└── /practice          # 综合练习
```

---

## 模块三：汉字笔顺 [pending]

**路径**: `/stroke`  
**功能**: 查询单字笔顺、观看动画、练习书写

### 功能规划

| 子功能 | 描述 | 优先级 |
|--------|------|--------|
| 笔顺查询 | 输入汉字查看笔顺信息 | P1 |
| 笔顺动画 | hanzi-writer 动画演示 | P1 |
| 笔画分解 | 显示每一笔的名称和形状 | P1 |
| 笔顺测验 | 用户按顺序书写验证 | P2 |
| 常用字列表 | 按年级/难度分类 | P2 |
| 汉字详情 | 拼音/部首/结构/释义 | P2 |

### 数据结构

```typescript
interface StrokeInfo {
  char: string;              // '我'
  pinyin: string;            // 'wǒ'
  strokeCount: number;       // 7
  radical: string;           // '戈'
  structure: string;         // '独体字'
  strokes: StrokeDetail[];   // 笔画详情
}

interface StrokeDetail {
  index: number;             // 1-7
  name: string;              // '撇'
  shape: string;             // '㇒'
  path: string;              // SVG path data
}
```

### 页面结构

```
/stroke
├── /[char]            # 单字详情页 /stroke/我
├── /practice          # 笔顺练习
├── /common            # 常用字列表
└── /search            # 搜索页
```

### 技术实现

- 使用 `hanzi-writer` 提供笔画数据和动画
- 使用 `cnchar-order` 提供笔画名称
- 动态路由 `[char]` 支持任意汉字

---

## 模块四：古诗词 [pending]

**路径**: `/poetry`  
**功能**: 古诗词学习与背诵

### 功能规划

| 子功能 | 描述 | 优先级 |
|--------|------|--------|
| 诗词库 | 唐诗宋词元曲等 | P2 |
| 诗词详情 | 原文/拼音/注释/译文 | P2 |
| 作者介绍 | 诗人生平与风格 | P3 |
| 背诵模式 | 逐句显示/填空练习 | P3 |
| 语音朗读 | TTS或真人朗读 | P3 |
| 诗词字帖 | 生成诗词练习字帖 | P2 |

### 数据来源

- 开源诗词数据库：[chinese-poetry](https://github.com/chinese-poetry/chinese-poetry)
- 包含：唐诗、宋词、元曲、诗经、楚辞等

---

## 模块五：中文字典 [pending]

**路径**: `/dictionary`  
**功能**: 汉字/词语查询

### 功能规划

| 子功能 | 描述 | 优先级 |
|--------|------|--------|
| 汉字查询 | 拼音/部首/笔画/释义 | P2 |
| 词语查询 | 词义/例句/近反义词 | P2 |
| 成语查询 | 释义/出处/用法 | P2 |
| 部首检索 | 按部首查字 | P3 |
| 拼音检索 | 按拼音查字 | P3 |
| 笔画检索 | 按笔画数查字 | P3 |

---

## 技术架构

### 整体架构

```
Hanzis/
├── app/
│   ├── layout.tsx              # 全局布局
│   ├── page.tsx                # 首页（字帖生成器）
│   ├── globals.css
│   ├── pinyin/                 # 拼音学习模块
│   │   ├── page.tsx
│   │   ├── initials/page.tsx
│   │   ├── finals/page.tsx
│   │   └── ...
│   ├── stroke/                 # 汉字笔顺模块
│   │   ├── page.tsx
│   │   ├── [char]/page.tsx
│   │   └── ...
│   ├── poetry/                 # 古诗词模块
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   └── dictionary/             # 字典模块
│       ├── page.tsx
│       └── [word]/page.tsx
├── components/
│   ├── ui/                     # 通用UI组件
│   ├── grid/                   # 格子组件
│   ├── character/              # 汉字组件
│   ├── controls/               # 控制面板
│   ├── worksheet/              # 字帖组件
│   ├── pinyin/                 # 拼音组件
│   ├── stroke/                 # 笔顺组件
│   └── layout/                 # 布局组件
├── lib/
│   ├── cncharHelper.ts
│   ├── hanziWriterHelper.ts
│   ├── pinyinData.ts           # 拼音数据
│   └── utils.ts
├── stores/
│   ├── worksheetStore.ts
│   └── ...
├── types/
│   └── index.ts
└── data/
    ├── initials.json           # 声母数据
    ├── finals.json             # 韵母数据
    ├── syllables.json          # 整体认读音节
    └── poetry/                 # 诗词数据
```

### 共享组件

| 组件 | 用途 | 模块 |
|------|------|------|
| CharacterGrid | 汉字格子 | 字帖/笔顺 |
| PinyinDisplay | 拼音显示 | 字帖/拼音/笔顺 |
| StrokeAnimation | 笔画动画 | 字帖/笔顺 |
| AudioPlayer | 音频播放 | 拼音/诗词 |

---

## 开发阶段规划

### Phase 1: 字帖生成器 [complete]
- [x] 核心功能实现
- [x] 颜色自定义
- [x] PDF/打印导出
- [x] Cloudflare Pages 部署

### Phase 2: 拼音学习模块 [pending]
- [ ] 拼音数据准备
- [ ] 声母表页面
- [ ] 韵母表页面
- [ ] 整体认读音节页面
- [ ] 声调练习页面
- [ ] 导航整合

### Phase 3: 汉字笔顺模块 [complete]
- [x] 笔顺查询页面
- [x] 笔顺动画集成 (hanzi-writer)
- [x] 笔画分解显示 (fanning)
- [x] 笔顺练习模式 (quiz)
- [x] 常用字快速选择
- [x] 汉字信息展示

### Phase 4: 网站整合与优化 [pending]
- [ ] 全局导航
- [ ] 响应式优化
- [ ] SEO优化
- [ ] 性能优化

### Phase 5: 古诗词模块 [pending]
- [ ] 诗词数据导入
- [ ] 诗词列表页
- [ ] 诗词详情页
- [ ] 拼音注音

### Phase 6: 字典模块 [pending]
- [ ] 字典数据准备
- [ ] 查询功能
- [ ] 详情页面

---

## 核心依赖

```json
{
  "dependencies": {
    "next": "^16.x",
    "react": "^19.x",
    "tailwindcss": "^4.x",
    "cnchar": "^3.x",
    "cnchar-poly": "^3.x",
    "cnchar-order": "^3.x",
    "cnchar-radical": "^3.x",
    "hanzi-writer": "^3.x",
    "jspdf": "^4.x",
    "html2canvas": "^1.x",
    "zustand": "^5.x"
  }
}
```

---

## 决策记录

| 决策 | 原因 | 日期 |
|------|------|------|
| 使用Next.js App Router | 现代化路由、SEO友好、静态导出 | 2026-01-19 |
| 使用cnchar全家桶 | 汉字处理功能完善 | 2026-01-19 |
| 使用hanzi-writer | 笔画动画专业 | 2026-01-19 |
| Cloudflare Pages部署 | 全球CDN、免费额度高 | 2026-01-21 |
| 模块化开发 | 独立迭代、渐进增强 | 2026-01-21 |

---

## 参考资源

- [hanzi-writer 文档](https://hanziwriter.org/docs.html)
- [cnchar 文档](https://theajack.github.io/cnchar)
- [chinese-poetry 诗词库](https://github.com/chinese-poetry/chinese-poetry)
- [参考网站 z2h.cn](https://z2h.cn/number)
