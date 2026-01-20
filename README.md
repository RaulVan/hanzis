# 汉字字帖生成器 (Hanzis)

一款功能丰富的中文字帖生成器，支持生成田字格、米字格等多种格式的字帖，包含汉字、拼音、部首、笔画顺序等内容。

## 功能特点

- **多种格子类型**: 田字格、米字格、回宫格、空白格
- **拼音标注**: 自动生成拼音，支持声调显示
- **笔画信息**: 显示笔画数和部首
- **多种显示模式**: 实心字、描红字、空白格
- **PDF导出**: 生成可打印的PDF文件
- **响应式设计**: 支持桌面和移动设备

## 技术栈

- **框架**: Next.js 14+ (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **汉字处理**: cnchar
- **状态管理**: Zustand
- **PDF生成**: jsPDF + html2canvas

## 快速开始

### 安装依赖

```bash
# 使用 nvm 切换到 Node.js 20
nvm use 20

# 安装依赖
npm install
```

### 开发模式

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建

```bash
npm run build
```

### 部署

#### Vercel (推荐)

直接连接 GitHub 仓库，Vercel 会自动部署。

#### Cloudflare Pages

1. 构建命令: `npm run build`
2. 输出目录: `out`

#### 其他静态托管

项目配置了 `output: 'export'`，构建后会在 `out` 目录生成静态文件，可以部署到任何静态托管服务。

## 项目结构

```
Hanzis/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   └── globals.css         # 全局样式
├── components/
│   ├── ui/                 # UI 组件
│   ├── grid/               # 格子组件
│   ├── character/          # 汉字组件
│   ├── controls/           # 控制面板
│   └── worksheet/          # 字帖组件
├── hooks/                  # React Hooks
├── lib/                    # 工具函数
├── stores/                 # 状态管理
└── types/                  # 类型定义
```

## 开源协议

MIT License

## 致谢

- [cnchar](https://github.com/theajack/cnchar) - 功能全面的汉字工具库
- [hanzi-writer](https://github.com/chanind/hanzi-writer) - 汉字笔画动画库
