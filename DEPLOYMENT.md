# Hanzis 静态发布手册

## 发布物

- 根目录 ZIP：`release/hanzis-static-2026-09-01.zip`
- SHA-256：`50c90461a60f77b2db95efc214d86a9f80e868b08606830083bdac4f98b805a4`
- 压缩大小：87,471,219 bytes
- 解压后：12,644 个文件、142,548,892 bytes

压缩包内容已经位于站点根层级，解压后应直接看到 `index.html`、`404.html`、`_headers`、`_next/`、`hanzi/`、`dictionary/` 和 `voice/`。不要把外层 `out` 目录作为额外 URL 层级上传。

## 从源码构建

生产构建要求 Node.js `>=20.9`，建议固定 Node.js 20。

```bash
npm ci
npm run check
npm run build
npm run release:verify
```

`npm run build` 输出 `out/`。构建脚本会校验字典快照、生成分片、笔画文件、录音清单和公开许可；任何来源校验不一致都会使构建失败。

## 上传前校验

```bash
shasum -a 256 release/hanzis-static-2026-09-01.zip
unzip -t release/hanzis-static-2026-09-01.zip
```

期望 SHA-256 与本文件一致，且 `unzip -t` 报告无错误。建议先解压到新的版本目录，不覆盖当前生产目录，以便原子切换和回滚。

## 静态托管配置

### 直接上传 ZIP

1. 新建版本目录并解压 ZIP。
2. 将解压后的内容设置为站点文档根目录。
3. 保留 `_headers`；支持该格式的平台会应用安全头和缓存策略。
4. 配置未知路径返回根层的 `404.html`，不要把全部 404 重写为首页。
5. 确认服务器支持字节范围请求，MP3 应返回 `Accept-Ranges: bytes` 和 206。

### 从 Git 构建

- 构建命令：`npm run build`
- 输出目录：`out`
- Node.js：20
- 环境变量：首发不需要必填环境变量
- 安装命令：`npm ci`

无论使用哪家静态托管平台，都应先确认其单次发布文件数、总大小、单文件限制，以及是否支持 `_headers`。如果平台不识别该文件，需要在平台控制台等价配置 CSP、缓存和安全响应头。

## 必须保留的响应行为

- HTML：`Content-Type: text/html; charset=utf-8`
- Manifest：`application/manifest+json`
- MP3：`audio/mpeg`，支持 Range
- 字体：`font/woff2`
- `/_next/static/*`：长期 immutable 缓存
- `/voice/*`、`/hanzi/*`：可缓存且不得被 HTML fallback 截获
- `/dictionary/*`：必须返回 JSON 分片或对应静态页面
- HTML 与静态资源保留 `no-transform`，避免 Cloudflare 自动注入 Web Analytics 脚本，与站点“无分析脚本”的隐私承诺保持一致
- CSP、`X-Content-Type-Options: nosniff`、Referrer-Policy、X-Frame-Options 与 Permissions-Policy

## 上线后冒烟

在实际域名逐项检查：

```bash
curl -I https://目标域名/
curl -I https://目标域名/manifest.webmanifest
curl -I 'https://目标域名/dictionary/?q=学习'
curl -I https://目标域名/hanzi/6c38.json
curl -I -H 'Range: bytes=0-31' https://目标域名/voice/ma1.mp3
curl -I https://目标域名/不存在的发布检查路径
```

浏览器再完成以下流程：

1. 首页生成三页字帖并下载 PDF。
2. 播放第一声本地录音和轻声系统语音。
3. 查询“永”，播放笔顺并开始书写练习。
4. 筛选宋词、收藏一首并刷新确认恢复。
5. 字典查询“学习”和 `xue`，打开来源与许可。
6. 用手机检查导航、无横向溢出和 44px 触控区域。
7. 检查开发者控制台没有 404、CSP、MIME 或跨域错误。

## 回滚

- 保留当前线上版本目录与其 SHA-256。
- 新版本冒烟失败时，把站点根指针切回上一版本；不要在原目录逐文件覆盖回滚。
- CDN 存在缓存时，优先只清理 HTML、manifest、robots、sitemap 和 404；带哈希的 `/_next/static/` 可继续长期缓存。
- 记录失败 URL、状态码、响应头和控制台错误，再在新版本目录修复并重新发布。

本手册只描述可执行发布步骤。本轮没有连接或修改任何生产托管环境。
