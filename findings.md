# 字帖生成器 - 研究发现

## 核心库分析

### 1. hanzi-writer 库

**GitHub**: https://github.com/chanind/hanzi-writer  
**文档**: https://hanziwriter.org/docs.html  
**版本**: 3.7.3

#### 核心功能

| 功能 | 方法 | 说明 |
|-----|------|------|
| 渲染汉字 | `HanziWriter.create()` | 在指定容器渲染汉字 |
| 笔画动画 | `animateCharacter()` | 播放笔画书写动画 |
| 循环动画 | `loopCharacterAnimation()` | 循环播放动画 |
| 测验模式 | `quiz()` | 用户练习书写 |
| 加载字符数据 | `loadCharacterData()` | 从CDN加载笔画数据 |

#### 配置选项摘要

```javascript
{
  width: 100,                    // 宽度(px)
  height: 100,                   // 高度(px)
  padding: 5,                    // 内边距
  showOutline: true,             // 显示轮廓
  showCharacter: true,           // 显示字符
  strokeColor: '#555',           // 笔画颜色
  outlineColor: '#DDD',          // 轮廓颜色
  radicalColor: null,            // 部首颜色
  strokeAnimationSpeed: 1,       // 动画速度
  delayBetweenStrokes: 1000,     // 笔画间隔(ms)
  delayBetweenLoops: 2000,       // 循环间隔(ms)
  renderer: 'svg'                // 渲染器(svg/canvas)
}
```

#### 关键API

```javascript
// 创建实例
const writer = HanziWriter.create('target-div', '我', {
  width: 100,
  height: 100,
  padding: 5
});

// 动画控制
writer.animateCharacter();
writer.pauseAnimation();
writer.resumeAnimation();

// 测验模式
writer.quiz({
  onCorrectStroke: (data) => {},
  onMistake: (data) => {},
  onComplete: (data) => {}
});

// 切换字符
writer.setCharacter('新');

// 静态渲染
HanziWriter.loadCharacterData('六').then(charData => {
  // charData.strokes 包含所有笔画路径
});
```

#### 注意事项

- 字符数据从CDN加载，首次可能有延迟
- 支持自定义数据加载器 `charDataLoader`
- 可以使用 `hanzi-writer-data` npm包本地加载数据
- 支持Canvas和SVG两种渲染模式

---

### 2. cnchar 库

**GitHub**: https://github.com/theajack/cnchar  
**文档**: https://theajack.github.io/cnchar  
**版本**: 3.2.6

#### 插件体系

| 插件 | 功能 | 大小 |
|-----|------|------|
| cnchar | 基础库：拼音、多音字、笔画数 | ~75kb |
| cnchar-poly | 多音词识别 | - |
| cnchar-order | 笔画顺序、笔画名称 | - |
| cnchar-trad | 繁体字支持 | - |
| cnchar-radical | 偏旁部首 | - |
| cnchar-draw | 可视化绘制 | - |
| cnchar-words | 组词功能 | - |
| cnchar-idiom | 成语查询 | - |

#### 核心API

```javascript
// 拼音获取
'汉字'.spell();                    // 'HanZi'
'汉字'.spell('tone');              // 'HànZì'
'汉字'.spell('array');             // ['Han', 'Zi']
'汉字'.spell('first');             // 'HZ'
'长大了'.spell('poly');            // 识别多音词

// 笔画数
'汉'.stroke();                     // 5
'汉字'.stroke('array');            // [5, 6]

// 笔画顺序（需要cnchar-order）
'一'.stroke('order');              // ['j']
'一'.stroke('order', 'name');      // [['横']]
'一'.stroke('order', 'shape');     // [['㇐']]

// 偏旁部首（需要cnchar-radical）
cnchar.radical('你');              // [{radical: '亻', struct: '左右结构', radicalCount: 2}]

// 拼音详情
cnchar.spellInfo('shàng');
// { spell: 'shang', tone: 4, index: 3, initial: 'sh', final: 'ang' }

// 工具方法
cnchar.isCnChar('汉');             // true
cnchar.isPolyWord('长');           // true (多音字)
cnchar.transformTone('lv2');       // { spell: 'lǖ', tone: 2, ... }
```

#### 拼音参数

| 参数 | 作用 |
|-----|------|
| array | 返回数组 |
| first | 返回首字母 |
| up | 大写 |
| low | 小写 |
| poly | 多音字候选 |
| tone | 带声调 |
| flat | 扁平化 (lǖ => lv2) |

#### 笔画参数

| 参数 | 作用 |
|-----|------|
| array | 返回数组 |
| order | 笔画顺序 |
| letter | 笔画字母序列(默认) |
| name | 笔画名称 |
| shape | 笔画形状 |
| count | 笔画数 |
| detail | 详细信息 |

---

## 格子类型研究

### 1. 田字格

```
+---+---+
|   |   |
+---+---+
|   |   |
+---+---+
```

- 特点：十字分割，四等分
- 用途：最常见的汉字书写格
- 实现：中心横竖两条线

### 2. 米字格

```
+---+---+
| \ | / |
+---+---+
| / | \ |
+---+---+
```

- 特点：田字格基础上增加对角线
- 用途：更精确定位笔画位置
- 实现：田字格 + 两条对角线

### 3. 回宫格

```
+-------+
| +---+ |
| |   | |
| +---+ |
+-------+
```

- 特点：外框+内框
- 用途：控制字体大小比例
- 实现：嵌套正方形

### 4. 九宫格

```
+---+---+---+
|   |   |   |
+---+---+---+
|   |   |   |
+---+---+---+
|   |   |   |
+---+---+---+
```

- 特点：3x3九等分
- 用途：更细致的结构分析
- 实现：两横两竖

---

## 常用开源字体

| 字体 | 特点 | 许可证 |
|-----|------|--------|
| 思源黑体 (Noto Sans SC) | 无衬线，现代 | OFL |
| 思源宋体 (Noto Serif SC) | 衬线，传统 | OFL |
| 霞鹜文楷 (LXGW WenKai) | 手写风格 | OFL |
| 站酷快乐体 | 可爱风格 | 免费商用 |

**推荐**: 楷体类字体更适合字帖（如霞鹜文楷）

---

## PDF生成方案对比

| 方案 | 优点 | 缺点 |
|-----|------|------|
| jspdf + html2canvas | 简单易用 | 大量内容性能差 |
| react-pdf | React原生 | 学习成本高 |
| pdfmake | 纯JS生成 | 中文字体处理复杂 |
| Puppeteer | 效果最好 | 需要后端 |

**推荐**: jspdf + html2canvas（前端方案最成熟）

---

## 竞品分析：z2h.cn

### 功能特点

1. **多种格子类型**: 田字格、米字格、回宫格
2. **拼音标注**: 支持声调显示
3. **笔顺显示**: 数字标注笔画顺序
4. **描红模式**: 浅色字体供描写
5. **批量生成**: 一次输入多个汉字
6. **PDF下载**: 直接下载打印

### 可借鉴之处

- 界面简洁，操作直观
- 实时预览
- 多种模板可选
- 打印优化良好

### 可改进之处

- 增加笔画动画演示
- 增加组词/成语功能
- 增加笔画名称显示
- 增加自定义样式

---

## 技术实现要点

### 1. SVG vs Canvas

| 维度 | SVG | Canvas |
|-----|-----|--------|
| 缩放 | 矢量无损 | 位图模糊 |
| 打印 | 更清晰 | 需高DPI |
| 性能 | DOM多时差 | 更好 |
| 交互 | 元素可点击 | 需计算坐标 |

**推荐**: 格子用SVG，大量内容考虑Canvas

### 2. 打印样式

```css
@media print {
  .no-print { display: none; }
  .worksheet { 
    page-break-inside: avoid;
    margin: 0;
    padding: 10mm;
  }
}
```

### 3. 响应式格子尺寸

```typescript
// 根据容器宽度计算格子大小
const calculateGridSize = (containerWidth: number, columns: number, gap: number) => {
  return Math.floor((containerWidth - gap * (columns - 1)) / columns);
};
```

---

## 待研究问题

- [ ] hanzi-writer 对生僻字的支持情况
- [ ] 最佳的字体加载方案（Web Font vs 本地）
- [ ] PDF中嵌入中文字体的最佳实践
- [ ] 移动端触控书写支持

---

---

## Next.js 部署方案研究

### Vercel 部署

**优势**: Next.js 原生支持，零配置

```bash
# 部署命令
npx vercel

# 或者连接 GitHub 后自动部署
```

**配置文件**: 无需额外配置

### Cloudflare Pages 部署

**优势**: 全球CDN、边缘计算、免费额度高

**方案一：静态导出（推荐）**

```typescript
// next.config.ts
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};
export default nextConfig;
```

```bash
# 构建命令
npm run build
# 输出目录
out/
```

**方案二：@cloudflare/next-on-pages**

```bash
# 安装
npm install -D @cloudflare/next-on-pages wrangler

# wrangler.toml
name = "hanzis"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[build]
command = "npx @cloudflare/next-on-pages"
```

### 静态导出注意事项

| 功能 | 静态导出支持 |
|-----|-------------|
| App Router | 支持 |
| 客户端组件 | 支持 |
| 服务端组件 | 支持(构建时预渲染) |
| API Routes | 不支持 |
| 动态路由 | 需要generateStaticParams |
| next/image优化 | 需要unoptimized: true |

**结论**: 字帖生成器是纯前端应用，静态导出完全满足需求。

---

## Next.js 中文字体优化

### 使用 next/font

```typescript
// app/layout.tsx
import { Noto_Sans_SC } from 'next/font/google';

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-sc',
});

export default function RootLayout({ children }) {
  return (
    <html className={notoSansSC.variable}>
      <body>{children}</body>
    </html>
  );
}
```

### 本地字体（楷体推荐）

```typescript
import localFont from 'next/font/local';

const lxgwWenKai = localFont({
  src: './fonts/LXGWWenKai-Regular.ttf',
  variable: '--font-lxgw',
});
```

---

## cnchar 在 Next.js 中的使用

### 客户端组件模式

cnchar 和 hanzi-writer 都需要在客户端运行，需要使用 `'use client'` 指令：

```typescript
'use client';

import cnchar from 'cnchar';
import 'cnchar-poly';
import 'cnchar-order';
import 'cnchar-radical';

export function CharacterInfo({ char }: { char: string }) {
  const pinyin = char.spell('tone');
  const strokeCount = char.stroke();
  // ...
}
```

### 动态导入（避免SSR问题）

```typescript
'use client';

import dynamic from 'next/dynamic';

const HanziWriter = dynamic(
  () => import('hanzi-writer'),
  { ssr: false }
);
```

---

## 更新日志

| 日期 | 更新内容 |
|-----|---------|
| 2026-01-19 | 初始研究完成 |
| 2026-01-19 | 添加Next.js部署方案研究 |
