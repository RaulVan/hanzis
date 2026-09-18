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
  { icon: LockKeyhole, title: "不需要账号", text: "本站不提供注册或登录，不接入广告、营销 Cookie 或用于识别个人的追踪功能。" },
  { icon: HardDrive, title: "练习内容留在浏览器", text: "字帖文字、排版设置和诗词收藏只保存在当前浏览器的 localStorage 中。生成 PDF、PNG 和打印内容也在设备本地完成，不上传到服务器。" },
  { icon: Database, title: "你可以随时清除", text: "删除浏览器站点数据会移除字帖设置与诗词收藏。若旧版设置格式异常，应用可能保留一份带时间戳的本地备份，方便避免误删；它仍只在浏览器中。" },
  { icon: Server, title: "托管与匿名统计", text: "页面、字体、汉字笔顺、字典分片和录音均从本站同源静态文件读取。生产站点由 Cloudflare 托管，并使用 Cloudflare Web Analytics 汇总页面访问与性能指标；它不读取字帖内容、排版设置或收藏。托管服务商也可能按其政策记录标准访问日志，例如 IP、时间和请求路径。" },
];

export default function PrivacyPage() {
  return <div className="mx-auto flex max-w-4xl flex-col gap-7">
    <PageHeading className="stacked-page-heading" title="隐私说明" description="学习记录由你掌握，核心功能在浏览器本地完成。" />
    <p className="body-copy">本说明适用于当前静态版本，更新日期为 2026-09-01。若未来加入账号、云同步、广告或其他数据用途，将在启用前更新说明并清楚告知。</p>
    <div className="grid gap-4 sm:grid-cols-2">{items.map(({ icon: Icon, title, text }) => <Card key={title}>
      <CardHeader><CardTitle className="flex items-center gap-2"><Icon aria-hidden="true" className="size-5 text-primary" />{title}</CardTitle><CardDescription>{text}</CardDescription></CardHeader>
    </Card>)}</div>
    <p className="text-sm leading-7 text-muted-foreground">Cloudflare 将 Web Analytics 描述为不使用客户端状态（例如 Cookie 或 localStorage）识别用户的隐私友好型统计；详见其<a href="https://www.cloudflare.com/web-analytics/" target="_blank" rel="noreferrer" className="underline underline-offset-4">产品说明</a>。请勿在字帖中输入身份证号、联系方式等敏感信息。虽然内容不由本站应用上传，下载、打印或共享生成文件时仍应由你自行确认接收方和使用范围。</p>
  </div>;
}
