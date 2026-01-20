# 字帖生成器 - 项目规划

## 项目概述

**目标**: 开发一款功能丰富的中文字帖生成器，支持生成田字格、米字格等多种格式的字帖，包含汉字、拼音、部首、笔画顺序等内容。

**参考**: https://z2h.cn/number

**核心依赖库**:
- [hanzi-writer](https://github.com/chanind/hanzi-writer) - 汉字笔画顺序动画
- [cnchar](https://github.com/theajack/cnchar) - 汉字工具库（拼音、笔画、偏旁等）

---

## 功能需求分析

### 核心功能

| 功能模块 | 描述 | 优先级 | 依赖库 |
|---------|------|--------|--------|
| 汉字输入 | 支持手动输入、批量输入、常用字词库选择 | P0 | - |
| 田字格生成 | 标准田字格（十字线） | P0 | - |
| 米字格生成 | 米字格（十字+对角线） | P0 | - |
| 拼音标注 | 自动生成拼音，支持音调显示 | P0 | cnchar |
| 笔画顺序 | 显示笔画顺序数字/动画 | P1 | hanzi-writer |
| 部首显示 | 显示汉字部首信息 | P1 | cnchar-radical |
| 笔画数显示 | 显示汉字笔画数 | P1 | cnchar |
| PDF导出 | 生成可打印的PDF文件 | P0 | jspdf/html2canvas |
| 图片导出 | 导出PNG/JPG格式 | P1 | html2canvas |

### 扩展功能

| 功能模块 | 描述 | 优先级 | 依赖库 |
|---------|------|--------|--------|
| 描红模式 | 浅色汉字供描写 | P1 | - |
| 空格练习 | 只显示格子不显示字 | P2 | - |
| 笔画动画 | 动态演示笔画书写过程 | P2 | hanzi-writer |
| 组词提示 | 显示常用词组 | P2 | cnchar-words |
| 成语练习 | 成语字帖模式 | P3 | cnchar-idiom |
| 古诗词模板 | 预设古诗词内容 | P3 | - |
| 自定义样式 | 字体、颜色、大小自定义 | P2 | - |

---

## 技术架构设计

### 技术栈选型

```
前端框架: Next.js 14+ (App Router) + TypeScript
UI组件库: Tailwind CSS + shadcn/ui
汉字处理: cnchar + cnchar-poly + cnchar-order + cnchar-trad + cnchar-radical
笔画动画: hanzi-writer
PDF生成: jspdf + html2canvas
状态管理: Zustand (轻量级)
部署平台: Vercel / Cloudflare Pages / Netlify
```

### 为什么选择 Next.js

| 优势 | 说明 |
|-----|------|
| **Vercel原生支持** | 零配置部署，自动优化 |
| **Cloudflare兼容** | 通过 @cloudflare/next-on-pages 支持 |
| **App Router** | 现代化路由，支持布局嵌套 |
| **静态导出** | `output: 'export'` 生成纯静态站点 |
| **SEO友好** | 内置metadata API |
| **图片优化** | next/image 自动优化 |
| **字体优化** | next/font 自动优化中文字体加载 |

### 部署方案

#### Vercel (推荐)
```bash
# 直接推送到GitHub，Vercel自动部署
git push origin main
```

#### Cloudflare Pages
```bash
# 安装适配器
npm install @cloudflare/next-on-pages

# wrangler.toml 配置
name = "hanzis"
compatibility_flags = ["nodejs_compat"]
```

#### 静态导出 (通用)
```typescript
// next.config.ts
const nextConfig = {
  output: 'export',  // 生成纯静态文件
  images: { unoptimized: true }
};
```

### 项目目录结构

```
Hanzis/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 首页（字帖生成器）
│   ├── globals.css               # 全局样式
│   ├── worksheet/                # 字帖相关页面
│   │   └── page.tsx
│   └── about/                    # 关于页面
│       └── page.tsx
├── components/
│   ├── ui/                       # shadcn/ui 组件
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── ...
│   ├── grid/                     # 格子组件
│   │   ├── TianGrid.tsx          # 田字格
│   │   ├── MiGrid.tsx            # 米字格
│   │   ├── HuiGongGrid.tsx       # 回宫格
│   │   └── GridBase.tsx          # 格子基础组件
│   ├── character/                # 汉字组件
│   │   ├── CharacterCell.tsx     # 单个汉字单元格
│   │   ├── PinyinDisplay.tsx     # 拼音显示
│   │   ├── StrokeOrder.tsx       # 笔画顺序
│   │   └── RadicalInfo.tsx       # 部首信息
│   ├── worksheet/                # 字帖组件
│   │   ├── Worksheet.tsx         # 字帖主组件
│   │   ├── WorksheetRow.tsx      # 字帖行
│   │   └── WorksheetPreview.tsx  # 预览组件
│   ├── controls/                 # 控制面板
│   │   ├── InputPanel.tsx        # 输入面板
│   │   ├── StylePanel.tsx        # 样式设置
│   │   ├── GridSelector.tsx      # 格子类型选择
│   │   └── ExportPanel.tsx       # 导出面板
│   └── animation/                # 动画组件
│       └── StrokeAnimation.tsx   # 笔画动画
├── hooks/
│   ├── useCharacter.ts           # 汉字处理Hook
│   ├── usePinyin.ts              # 拼音Hook
│   ├── useStroke.ts              # 笔画Hook
│   └── useExport.ts              # 导出Hook
├── lib/
│   ├── cncharHelper.ts           # cnchar工具封装
│   ├── hanziWriterHelper.ts      # hanzi-writer封装
│   ├── pdfGenerator.ts           # PDF生成工具
│   └── utils.ts                  # 通用工具函数
├── stores/
│   └── worksheetStore.ts         # 字帖状态管理
├── types/
│   └── index.ts                  # 类型定义
├── public/
│   └── fonts/                    # 字体文件（可选，推荐用next/font）
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json               # shadcn/ui配置
└── README.md
```

---

## 开发阶段规划

### Phase 1: 项目初始化与基础架构 [pending]
- [ ] 使用nvm配置Node.js版本(20.x LTS)
- [ ] 创建Next.js 14+ 项目 (App Router + TypeScript)
- [ ] 配置Tailwind CSS + shadcn/ui
- [ ] 安装cnchar及相关插件
- [ ] 安装hanzi-writer
- [ ] 创建基础目录结构
- [ ] 配置部署环境（Vercel/Cloudflare）

### Phase 2: 核心格子组件开发 [pending]
- [ ] 实现GridBase基础格子组件
- [ ] 实现TianGrid田字格组件
- [ ] 实现MiGrid米字格组件
- [ ] 格子尺寸和样式可配置
- [ ] 响应式布局支持

### Phase 3: 汉字处理功能 [pending]
- [ ] 封装cnchar工具函数
- [ ] 实现拼音获取和显示（支持音调）
- [ ] 实现笔画数获取
- [ ] 实现部首信息获取
- [ ] 处理多音字情况

### Phase 4: 字帖主界面开发 [pending]
- [ ] 输入面板（文本输入、常用字选择）
- [ ] 格子类型选择器
- [ ] 样式配置面板
- [ ] 字帖预览区域
- [ ] 实时预览功能

### Phase 5: 笔画顺序功能 [pending]
- [ ] 集成hanzi-writer
- [ ] 静态笔画顺序显示
- [ ] 笔画动画演示
- [ ] 笔画练习模式

### Phase 6: 导出功能 [pending]
- [ ] PDF导出功能
- [ ] 图片导出功能
- [ ] 打印优化
- [ ] 批量导出

### Phase 7: 高级功能与优化 [pending]
- [ ] 描红模式
- [ ] 组词/成语模式
- [ ] 古诗词模板
- [ ] 性能优化
- [ ] 移动端适配

### Phase 8: 测试与部署 [pending]
- [ ] 单元测试
- [ ] E2E测试
- [ ] 部署配置
- [ ] 文档完善

---

## 核心数据结构设计

### 字帖配置类型

```typescript
// 格子类型
type GridType = 'tian' | 'mi' | 'huigong' | 'empty';

// 显示模式
type DisplayMode = 'solid' | 'outline' | 'stroke-order' | 'empty';

// 字帖配置
interface WorksheetConfig {
  // 基础配置
  title: string;                    // 字帖标题
  characters: string;               // 输入的汉字
  
  // 格子配置
  gridType: GridType;               // 格子类型
  gridSize: number;                 // 格子大小(px)
  gridColor: string;                // 格子线颜色
  gridLineWidth: number;            // 线条粗细
  
  // 内容配置
  showPinyin: boolean;              // 显示拼音
  pinyinPosition: 'top' | 'bottom'; // 拼音位置
  showTone: boolean;                // 显示声调
  showStrokeCount: boolean;         // 显示笔画数
  showRadical: boolean;             // 显示部首
  showStrokeOrder: boolean;         // 显示笔顺
  
  // 显示模式
  displayMode: DisplayMode;         // 显示模式
  characterOpacity: number;         // 字符透明度(描红用)
  repeatCount: number;              // 每字重复次数
  
  // 样式配置
  fontFamily: string;               // 字体
  characterColor: string;           // 汉字颜色
  pinyinColor: string;              // 拼音颜色
  
  // 布局配置
  columnsPerRow: number;            // 每行列数
  rowsPerPage: number;              // 每页行数
  pageSize: 'A4' | 'A3' | 'Letter'; // 纸张大小
  orientation: 'portrait' | 'landscape'; // 方向
}

// 汉字信息
interface CharacterInfo {
  char: string;                     // 汉字
  pinyin: string;                   // 拼音
  pinyinWithTone: string;           // 带声调拼音
  tone: number;                     // 声调(1-4)
  strokeCount: number;              // 笔画数
  radical: string;                  // 部首
  radicalStrokeCount: number;       // 部首笔画数
  struct: string;                   // 结构(左右、上下等)
  strokeOrder: string[];            // 笔顺
  strokeNames: string[];            // 笔画名称
}
```

---

## UI/UX 设计要点

### 页面布局

```
+----------------------------------------------------------+
|  Header: Logo + 标题 + 导航                                |
+----------------------------------------------------------+
|  +------------------+  +-------------------------------+ |
|  |    控制面板       |  |         预览区域              | |
|  | +--------------+ |  |                               | |
|  | | 文字输入     | |  |  +----+  +----+  +----+       | |
|  | +--------------+ |  |  |田字|  |田字|  |田字|       | |
|  | +--------------+ |  |  | 格 |  | 格 |  | 格 |       | |
|  | | 格子类型     | |  |  +----+  +----+  +----+       | |
|  | +--------------+ |  |                               | |
|  | +--------------+ |  |  +----+  +----+  +----+       | |
|  | | 显示选项     | |  |  |    |  |    |  |    |       | |
|  | | □ 拼音      | |  |  +----+  +----+  +----+       | |
|  | | □ 笔画数    | |  |                               | |
|  | | □ 部首      | |  |                               | |
|  | +--------------+ |  |                               | |
|  | +--------------+ |  |                               | |
|  | | 样式设置     | |  |                               | |
|  | +--------------+ |  |                               | |
|  | +--------------+ |  +-------------------------------+ |
|  | | 导出按钮     | |                                    |
|  | +--------------+ |                                    |
|  +------------------+                                    |
+----------------------------------------------------------+
```

### 设计原则

1. **简洁直观**: 控制面板分组清晰，选项一目了然
2. **实时预览**: 任何设置变更立即在预览区显示
3. **响应式**: 支持桌面和平板设备
4. **打印友好**: 预览效果与打印效果一致
5. **无障碍**: 支持键盘导航，对比度符合标准

---

## 依赖包清单

### 核心依赖

```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "cnchar": "^3.x",
    "cnchar-poly": "^3.x",
    "cnchar-order": "^3.x",
    "cnchar-trad": "^3.x",
    "cnchar-radical": "^3.x",
    "cnchar-draw": "^3.x",
    "hanzi-writer": "^3.x",
    "jspdf": "^2.x",
    "html2canvas": "^1.x",
    "zustand": "^4.x",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "lucide-react": "^0.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/node": "^20.x",
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x",
    "eslint": "^8.x",
    "eslint-config-next": "^14.x"
  }
}
```

### Cloudflare Pages 额外依赖（可选）

```json
{
  "devDependencies": {
    "@cloudflare/next-on-pages": "^1.x",
    "wrangler": "^3.x"
  }
}
```

---

## 风险与挑战

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| 部分生僻字无笔画数据 | hanzi-writer可能不支持 | 提供降级方案，仅显示文字 |
| 多音字处理 | 自动拼音可能不准确 | 使用cnchar-poly，提供手动修正 |
| PDF生成性能 | 大量汉字时可能慢 | 分页处理，显示进度 |
| 字体版权 | 商用字体版权问题 | 使用开源字体如思源黑体 |
| 打印效果 | 屏幕与打印差异 | 提供打印预览，使用CSS print media |

---

## 错误记录

| 错误 | 尝试 | 解决方案 |
|-----|------|---------|
| - | - | - |

---

## 决策记录

| 决策 | 原因 | 日期 |
|-----|------|------|
| ~~使用React+Vite~~ | ~~开发效率高，生态丰富~~ | ~~2026-01-19~~ |
| **使用Next.js 14+** | Vercel原生支持、Cloudflare兼容、App Router现代化、SEO友好 | 2026-01-19 |
| 使用cnchar库 | 功能全面，支持拼音/笔画/部首 | 2026-01-19 |
| 使用hanzi-writer | 专业的笔画顺序库，支持动画 | 2026-01-19 |
| 使用Zustand状态管理 | 轻量级，API简洁 | 2026-01-19 |
| 使用jspdf+html2canvas | 成熟的PDF生成方案 | 2026-01-19 |
| 使用shadcn/ui | 可定制、无依赖、与Tailwind完美配合 | 2026-01-19 |
| 支持静态导出 | 兼容更多部署平台（Cloudflare/Netlify） | 2026-01-19 |

---

## 参考资源

- [hanzi-writer 文档](https://hanziwriter.org/docs.html)
- [cnchar 文档](https://theajack.github.io/cnchar)
- [参考网站 z2h.cn](https://z2h.cn/number)
