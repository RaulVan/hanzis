# Adsterra 接入

## 平台配置

- 网站 `hanzis.com`，Site ID `6109024`，后台 Approved。
- 唯一广告位 `Banner320x50_1`，ID `31632666`，后台 Active；尺寸 320×50。
- Adult ads 关闭；未申请 Popunder、Social Bar、Smartlink 或其他广告位。
- 代码来自登录后的 GET CODE：公开广告位 key `200a0a4f0f31c3e81f52914abf3df064`，加载域名 `www.highrevenueformat.com`。这些是公开投放标识，不是账户凭据。

## 展示规则

- 根 layout 在正文后、页脚前挂载一个广告组件；仅首页、拼音知识页、笔顺首页、诗词目录和字典首页显示选择提示。
- 练习、游戏、诗词详情、关于和隐私页面不展示。打印隐藏整个广告区域。
- 默认不加载广告。访客点击“允许广告”后才创建 iframe；“不显示”或“关闭广告”移除该区域。
- 当前页面会话内保留选择，不存储到 Cookie/localStorage；刷新页面重新选择。所有工具始终可免费使用。
- 只有一个 320×50 固定区域，不做浮层、自动刷新、多位置重复展示或主动弹窗。

## 隔离与维护

- 广告加载在 `public/ads/banner.html` 中，iframe sandbox 仅允许脚本和弹出链接，不允许访问本站同源存储或导航顶层页面。
- 主站 CSP 保持不变。广告文档从全局 CSP 中排除，使用自身的 meta CSP，脚本来源仅允许官方代码所给的加载域名；嵌套广告 iframe 允许 HTTPS。
- Cloudflare Pages `_headers` 多规则会合并重复 header，所以使用 detach 而非同时写第二个 CSP。参见 [Cloudflare Headers](https://developers.cloudflare.com/pages/configuration/headers/)。预览服务器模拟相同广告文档例外。
- 广告文档 noindex/nofollow、不传 referrer，不进入 sitemap。现有 Google ads.txt 保留；未凭空新增未知的 Adsterra 授权销售声明。
- 第三方广告仍可能使用 IP、浏览器信息及 Cookie，披露见 `/privacy/`。关闭不撤销已发生的数据处理。
- 成人广告关闭不等于所有创意均适合儿童；需持续检查实际素材，必要时在平台进一步限制或移除广告位。此次未核验收益、填充率或广告点击转化。
- 代码本地提交后仍需明确授权推送部署，并在正式域名验证响应头、展示和广告素材。平台 Active 不代表本站已上线投放。

## 2026-10-09 本地验证

- lint、TypeScript、85 个既有单测、Next 构建与静态产物检查通过。
- 默认无广告 iframe，允许后仅一条；拒绝、关闭、刷新后重新选择均通过浏览器操作验证。
- 练习、游戏与隐私页没有广告提示或 iframe；桌面和手机布局未出现横向溢出。
- 本地未展示广告素材，公开加载脚本返回 HTTP 200、0 字节；原因未确认。没有验证真实创意、转化、收益或正式部署效果。
