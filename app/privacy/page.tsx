import { UiText } from "@/components/i18n/UiText";
import { pageMetadata } from "@/lib/seo";
import { Database, HardDrive, LockKeyhole, Server } from "lucide-react";
import { PageHeading } from "@/components/layout/PageHeading";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = pageMetadata(
  "/privacy/",
  "隐私说明",
  "了解汉字网如何处理字帖内容、排版设置与诗词收藏，查看浏览器本地存储、网络请求和匿名访问统计说明。",
);

const items = [
  { icon: Server, title: "主动反馈", text: "报告问题会在浏览器中生成可编辑文本。只有你选择打开邮件草稿并在邮件应用中确认发送，内容才会发送至公开反馈邮箱；复制文本不会自动发送。页面地址不附带查询参数，避免把练习输入一并写入草稿。" },
  { icon: LockKeyhole, title: "不需要账号", text: "本站不提供注册或登录，学习工具无需账号即可使用。" },
  { icon: Server, title: "广告与网站验证", text: "当前版本不加载广告脚本或广告位。保留 Google 网站验证标识与 ads.txt 配置；这些配置本身不会加载 Google 广告。" },
  { icon: HardDrive, title: "练习内容留在浏览器", text: "字帖文字、排版设置和诗词收藏只保存在当前浏览器的 localStorage 中。生成 PDF、PNG 和打印内容也在设备本地完成，不上传到服务器。" },
  { icon: Database, title: "你可以随时清除", text: "删除浏览器站点数据会移除字帖设置与诗词收藏。若旧版设置格式异常，应用可能保留一份带时间戳的本地备份，方便避免误删；它仍只在浏览器中。" },
  { icon: Server, title: "托管与匿名统计", text: "页面、字体、汉字笔顺、字典分片和录音均从本站同源静态文件读取。生产站点由 Cloudflare 托管，并使用 Cloudflare Web Analytics 汇总页面访问与性能指标；它不读取字帖内容、排版设置或收藏。托管服务商也可能按其政策记录标准访问日志，例如 IP、时间和请求路径。" },
];

export default function PrivacyPage() {
  return <div className="mx-auto flex max-w-4xl flex-col gap-7">
    <PageHeading className="stacked-page-heading" title="隐私说明" description="学习记录由你掌握，核心功能在浏览器本地完成。" />
    <p className="body-copy"><UiText text="本说明适用于当前静态版本，更新日期为 2026-10-13。以下说明本地存储、网络请求与主动反馈的处理方式。" /></p>
    <div className="grid gap-4 sm:grid-cols-2">{items.map(({ icon: Icon, title, text }) => <Card key={title}>
      <CardHeader><CardTitle className="flex items-center gap-2"><Icon aria-hidden="true" className="size-5 text-primary" /><UiText>{title}</UiText></CardTitle><CardDescription><UiText>{text}</UiText></CardDescription></CardHeader>
    </Card>)}</div>
    <p className="text-sm leading-7 text-muted-foreground"><UiText text="Cloudflare 将 Web Analytics 描述为不使用客户端状态（例如 Cookie 或 localStorage）识别用户的隐私友好型统计；详见其"  /><a href="https://www.cloudflare.com/web-analytics/" target="_blank" rel="noreferrer" className="underline underline-offset-4"><UiText text="产品说明"  /></a><UiText text="。请勿在字帖中输入身份证号、联系方式等敏感信息。虽然内容不由本站应用上传，下载、打印或共享生成文件时仍应由你自行确认接收方和使用范围。"  /></p>
  </div>;
}
