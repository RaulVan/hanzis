# AdSense 接入状态

## 网站验证

- 网站：`https://hanzis.com`。
- 发布商 ID：`pub-3494180666301669`（在用户登录的 AdSense 后台确认；公开验证标识，不是密钥）。
- 根 layout 输出 `google-adsense-account` meta，`public/ads.txt` 声明 Google 为直接授权销售方。
- AdSense 目前仅准备所有权验证，不加载 Google 广告脚本、创建广告位或开启自动广告；Adsterra 的独立接入参见 [adsterra.md](adsterra.md)，隐私说明按实际行为维护。

## 发布后的步骤

1. 在正式站点确认首页 meta 和 `/ads.txt` 已更新且可公开访问。
2. 在 AdSense 中打开 hanzis.com，选择 meta 或 ads.txt 验证，完成验证后申请审核；后台显示结果前不宣称关联成功或审核通过。
3. 实际投放前核清内容权利与受众年龄处理方式，更新隐私披露和相关“无广告”文案，配置适用的同意管理与 CSP，并验证广告加载失败不影响学习工具。

收款卡片“我们已获得您的信息”只代表后台当前提示，不代表身份、税务、支付资格或站点审核全部完成。

参考：[Google 站点验证流程](https://support.google.com/adsense/answer/12169212?hl=zh-Hans)、[ads.txt 指南](https://support.google.com/adsense/answer/12171612?hl=zh-Hans)。

## 2026-10-04 发布与审核记录

- 站点验证配置已推送并部署，正式首页和拼音页的 meta 及 `/ads.txt` 已实测生效。
- Google 网站所有权验证通过，审核申请已提交；后台状态为“正在准备 / 已请求审核”，不代表审核通过。
- 此记录当时尚未投放广告；实际投放前继续完成上述隐私、受众、内容权利与加载验证。
