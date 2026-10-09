# Adsterra 接入

## 2026-10-10 加载失败排查

- 正式广告 HTML 与源文件一致、HTTP 200；后台 hanzis.com Approved，广告位 31632666 Active，GET CODE 与源文件的 key、域名、尺寸一致。
- 独立打开正式广告文档时，浏览器 Network 显示 invoke.js 为 HTTP 403 Forbidden，Content-Length 0；页面没有生成广告 iframe。普通 curl 为 200/0 字节，浏览器 UA 的桌面、手机请求均为 403/0 字节，添加 hanzis.com Referer 仍失败。
- 实际学习页面中的广告文档响应 200。独立广告文档未受到父 iframe sandbox 限制仍无法加载，当前没有依据将父 iframe 隔离认定为直接原因。
- 生产 HTML 没有 Rocket Loader 改写，广告文档没有主站响应头 CSP；不通过全面放宽 CSP、移除 sandbox 或替换未知域名处理服务端拒绝。
- 本机域名解析得到代理虚拟地址；显式关闭 curl 代理仍不构成独立普通网络验收。使用公开 DNS 地址保持 HTTPS 证书验证的请求也返回 403，但网络路径是否仍受透明代理影响未确认。
- 用户按手机移动网络关闭 VPN 的对照要求反馈仍为空白；尚未取得该设备的请求日志，不能将电脑的 403 推断为手机同样返回 403，也不能仅将故障归因于电脑代理。平台拒绝原因仍未确认；用户要求仅排查代码，不联系客服，未发送排障消息、未调整后台设置。
- 官方参考：[静态 HTML 接入](https://help-publishers.adsterra.com/en/articles/5210780-adding-ads-to-a-static-html-site)、[Cloudflare 接入](https://help-publishers.adsterra.com/en/articles/5213852-using-adsterra-ads-with-cloudflare)、[VPN/代理与展示差异](https://adsterra.com/blog/what-is-discrepancy/)。

## 当前版本与正式部署验证

- 默认展示版本通过受影响文件 ESLint、Next 构建（含 TypeScript）及静态产物检查。
- 真实游戏对局默认一个广告框架，组词操作成功；框架位于正文之后。375×812 手机视口无横向溢出，关闭后移除，刷新重新展示。
- 拼音练习与游戏目录各一个框架，隐私页没有框架。
- 默认版本和 Pages 路径修复已推送，代码提交 c570a3b，Pages 与 Workers 均部署成功。
- 正式 `/ads/banner` HTTP 200，与源文件一致；noindex/nofollow 生效，广告文档不再继承主站 CSP，主站 CSP 保持原配置。
- 正式拼音练习和真实游戏对局各一个默认框架，关闭后移除，桌面布局无横向溢出。
- 正式广告框架当前未显示图片、链接或嵌套广告 iframe；公开加载脚本仍返回 HTTP 200、0 字节，原因未确认。不宣称已有真实素材或收益，不承诺固定等待时间。

## 平台配置

- 网站 `hanzis.com`，Site ID `6109024`，后台 Approved。
- 唯一广告位 `Banner320x50_1`，ID `31632666`，后台 Active；尺寸 320×50。
- Adult ads 关闭；未申请 Popunder、Social Bar、Smartlink 或其他广告位。
- 代码来自登录后的 GET CODE：公开广告位 key `200a0a4f0f31c3e81f52914abf3df064`，加载域名 `www.highrevenueformat.com`。这些是公开投放标识，不是账户凭据。

## 展示规则

- 根 layout 在正文后、页脚前挂载一个广告组件；首页、拼音、笔顺、诗词、字典与游戏栏目（含子页面、练习和对局）默认加载广告。
- 关于和隐私页面不展示，打印隐藏整个广告区域。
- 每页最多一个 320×50 横幅，不做浮层、自动刷新、多位置重复展示或主动弹窗，不覆盖对局操作。
- “关闭广告”移除框架，当前页面会话内保留关闭状态；不存储到 Cookie/localStorage，刷新后重新加载。所有工具始终免费使用。

## 隔离与维护

- 广告加载在 `public/ads/banner.html` 中，iframe sandbox 仅允许脚本和弹出链接，不允许访问本站同源存储或导航顶层页面。
- Cloudflare Pages 将 `.html` 自动重定向至无扩展名 URL；组件使用 `/ads/banner`，响应头例外同时覆盖该正式路径及原始 `.html` 路径，预览服务器使用同一映射。
- 主站 CSP 保持不变。广告文档从全局 CSP 中排除，使用自身的 meta CSP，脚本来源仅允许官方代码所给的加载域名；嵌套广告 iframe 允许 HTTPS。
- Cloudflare Pages `_headers` 多规则会合并重复 header，所以使用 detach 而非同时写第二个 CSP。参见 [Cloudflare Headers](https://developers.cloudflare.com/pages/configuration/headers/)。预览服务器模拟相同广告文档例外。
- 广告文档 noindex/nofollow、不传 referrer，不进入 sitemap。现有 Google ads.txt 保留；未凭空新增未知的 Adsterra 授权销售声明。
- 第三方广告仍可能使用 IP、浏览器信息及 Cookie，披露见 `/privacy/`。关闭不撤销已发生的数据处理。
- 成人广告关闭不等于所有创意均适合儿童；需持续检查实际素材，必要时在平台进一步限制或移除广告位。此次未核验收益、填充率或广告点击转化。
- 后续发布仍需明确推送部署授权。平台 Active、代码上线和真实素材展示分别核验；当前代码已上线，真实素材未展示。

## 2026-10-09 初版本地验证（已由默认展示版本替代）

- lint、TypeScript、85 个既有单测、Next 构建与静态产物检查通过。
- 默认无广告 iframe，允许后仅一条；拒绝、关闭、刷新后重新选择均通过浏览器操作验证。
- 练习、游戏与隐私页没有广告提示或 iframe；桌面和手机布局未出现横向溢出。
- 本地未展示广告素材，公开加载脚本返回 HTTP 200、0 字节；原因未确认。没有验证真实创意、转化、收益或正式部署效果。
