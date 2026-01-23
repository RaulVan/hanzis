# Hanzis.com - 研究发现

## 核心库分析

### 1. hanzi-writer 库

**GitHub**: https://github.com/chanind/hanzi-writer  
**文档**: https://hanziwriter.org/docs.html  
**版本**: 3.7.3

#### 核心功能

| 功能 | 方法 | 说明 |
|------|------|------|
| 渲染汉字 | `HanziWriter.create()` | 在指定容器渲染汉字 |
| 笔画动画 | `animateCharacter()` | 播放笔画书写动画 |
| 循环动画 | `loopCharacterAnimation()` | 循环播放动画 |
| 测验模式 | `quiz()` | 用户练习书写 |
| 加载字符数据 | `loadCharacterData()` | 获取笔画路径数据 |

#### 配置选项

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
  renderer: 'svg'                // 渲染器(svg/canvas)
}
```

#### 关键发现

1. **笔画数据格式**: `charData.strokes` 返回SVG path数组
2. **缩放变换**: `HanziWriter.getScalingTransform(width, height)` 获取变换矩阵
3. **Fanning效果**: 累进显示每一笔，已在字帖中实现

---

### 2. cnchar 库

**GitHub**: https://github.com/theajack/cnchar  
**文档**: https://theajack.github.io/cnchar  
**版本**: 3.2.6

#### 插件体系

| 插件 | 功能 |
|------|------|
| cnchar | 基础：拼音、笔画数 |
| cnchar-poly | 多音词识别 |
| cnchar-order | 笔画顺序、笔画名称 |
| cnchar-radical | 偏旁部首 |
| cnchar-trad | 繁体字支持 |
| cnchar-words | 组词功能 |
| cnchar-idiom | 成语查询 |

#### 核心API

```javascript
// 拼音
'汉字'.spell('tone');           // 'HànZì'
'汉字'.spell('array', 'tone');  // ['Hàn', 'Zì']

// 笔画
'汉'.stroke();                  // 5
'汉'.stroke('order', 'name');   // [['横', '点', ...]]

// 部首
cnchar.radical('你');           // [{radical: '亻', struct: '左右'}]
```

---

## 拼音学习模块研究

### 声母表 (23个)

| 类别 | 声母 |
|------|------|
| 唇音 | b p m f |
| 舌尖音 | d t n l |
| 舌根音 | g k h |
| 舌面音 | j q x |
| 翘舌音 | zh ch sh r |
| 平舌音 | z c s |
| 特殊 | y w |

### 韵母表 (24个)

| 类别 | 韵母 |
|------|------|
| 单韵母 | a o e i u ü |
| 复韵母 | ai ei ui ao ou iu ie üe er |
| 前鼻韵母 | an en in un ün |
| 后鼻韵母 | ang eng ing ong |

### 整体认读音节 (16个)

```
zhi chi shi ri
zi ci si
yi wu yu
ye yue yuan
yin yun ying
```

### 声调规则

| 声调 | 符号 | 调值 | 例字 |
|------|------|------|------|
| 一声 | ˉ | 55 | 妈 mā |
| 二声 | ˊ | 35 | 麻 má |
| 三声 | ˇ | 214 | 马 mǎ |
| 四声 | ˋ | 51 | 骂 mà |
| 轻声 | (无) | - | 吗 ma |

### 声调标注规则

> 有a找a，无a找o、e，i、u并列标在后

---

## 汉字笔顺模块研究

### 基本笔画 (8种)

| 笔画 | 名称 | 形状 | 代码 |
|------|------|------|------|
| 横 | héng | ㇐ | h |
| 竖 | shù | ㇑ | s |
| 撇 | piě | ㇒ | p |
| 捺 | nà | ㇏ | n |
| 点 | diǎn | ㇔ | d |
| 提 | tí | ㇀ | t |
| 折 | zhé | ㇕ | z |
| 钩 | gōu | ㇖ | g |

### 笔顺规则

1. **先横后竖**: 十 → 一丨
2. **先撇后捺**: 人 → ノ乀
3. **从上到下**: 三 → 一一一
4. **从左到右**: 川 → 丿丨丨
5. **先外后内**: 同 → 冂一口
6. **先中间后两边**: 小 → 亅八
7. **先进入后关门**: 国 → 冂王一

### hanzi-writer 笔画数据

```javascript
HanziWriter.loadCharacterData('我').then(data => {
  // data.strokes: SVG path 数组
  // data.medians: 笔画中线坐标
  // 坐标系: 1024x1024
});
```

---

## 古诗词模块研究

### 开源数据源

**chinese-poetry**: https://github.com/chinese-poetry/chinese-poetry

| 类别 | 数量 |
|------|------|
| 唐诗 | 57,000+ |
| 宋词 | 21,000+ |
| 宋诗 | 254,000+ |
| 元曲 | 数千 |
| 诗经 | 305 |
| 楚辞 | 若干 |

### 数据结构

```json
{
  "title": "静夜思",
  "author": "李白",
  "dynasty": "唐",
  "paragraphs": [
    "床前明月光，",
    "疑是地上霜。",
    "举头望明月，",
    "低头思故乡。"
  ],
  "tags": ["思乡", "月亮"]
}
```

### 小学必背古诗

| 年级 | 篇数 | 示例 |
|------|------|------|
| 一年级 | 20 | 咏鹅、静夜思 |
| 二年级 | 20 | 春晓、望庐山瀑布 |
| 三年级 | 20 | 望天门山、饮湖上初晴后雨 |
| ... | ... | ... |

---

## 格子类型

### 田字格

```
+---+---+
|   |   |
+---+---+
|   |   |
+---+---+
```

- 十字分割，四等分
- 最常用的汉字书写格

### 米字格

```
+---+---+
| \ | / |
+---+---+
| / | \ |
+---+---+
```

- 田字格+对角线
- 更精确定位笔画

### 回宫格

```
+-------+
|| +--+ ||
|| |  | ||
|| +--+ ||
+-------+
```

- 嵌套正方形
- 控制字体大小比例

---

## PDF生成方案

### 当前方案: jspdf + html2canvas

**优点**:
- 纯前端实现
- 支持多页
- 样式还原好

**实现要点**:
- 等待字体加载: `document.fonts.ready`
- 逐页捕获: `html2canvas(element)`
- 添加页面: `pdf.addPage()`

### 文字居中问题

**问题**: html2canvas 渲染时文字基线偏移

**解决**: 使用 SVG `<text>` + `dominantBaseline="central"`

```jsx
<svg>
  <text
    x="50%"
    y="50%"
    textAnchor="middle"
    dominantBaseline="central"
  >
    {char}
  </text>
</svg>
```

---

## 部署方案

### Cloudflare Pages (当前)

**配置**:
- Build command: `npm run pages:build`
- Output directory: `out`
- Node version: 20

**注意事项**:
- 不要设置 deploy command
- 使用静态导出 `output: 'export'`

### Vercel (备选)

- 零配置部署
- 支持 Edge Functions
- 自动 PR 预览

---

## 性能优化

### 字体优化

```typescript
// next/font 优化中文字体
import { Noto_Sans_SC } from 'next/font/google';

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '700'],
});
```

### 动态导入

```typescript
// 按需加载 hanzi-writer
const HanziWriter = dynamic(
  () => import('hanzi-writer'),
  { ssr: false }
);
```

### 本地缓存

```typescript
// Zustand persist
persist(
  (set) => ({ ... }),
  { name: 'hanzis-worksheet-settings' }
)
```

---

## 更新日志

| 日期 | 内容 |
|------|------|
| 2026-01-19 | 初始研究：hanzi-writer、cnchar |
| 2026-01-19 | Next.js 部署方案研究 |
| 2026-01-20 | PDF文字居中解决方案 |
| 2026-01-21 | 拼音/笔顺/古诗词模块研究 |
