import type { Metadata } from "next";
import { Database, HardDrive, LockKeyhole, Server } from "lucide-react";
import { PageHeading } from "@/components/layout/PageHeading";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "隐私说明",
  description: "汉字网的本地存储、网络请求和数据处理说明。",
  alternates: { canonical: "/privacy/" },
};

const items = [
  { icon: LockKeyhole, title: "不需要账号", text: "本站不提供注册或登录，也不在应用代码中接入广告、行为分析、第三方追踪像素或营销 Cookie。" },
  { icon: HardDrive, title: "练习内容留在浏览器", text: "字帖文字、排版设置和诗词收藏只保存在当前浏览器的 localStorage 中。生成 PDF、PNG 和打印内容也在设备本地完成，不上传到服务器。" },
  { icon: Database, title: "你可以随时清除", text: "删除浏览器站点数据会移除字帖设置与诗词收藏。若旧版设置格式异常，应用可能保留一份带时间戳的本地备份，方便避免误删；它仍只在浏览器中。" },
  { icon: Server, title: "静态资源请求", text: "页面、字体、汉字笔顺、字典分片和录音均从本站同源静态文件读取。实际托管服务商可能按其政策记录标准访问日志，例如 IP、时间和请求路径；本站前端不读取或汇总这些日志。" },
];

export default function PrivacyPage() {
  return <div className="mx-auto flex max-w-4xl flex-col gap-7">
    <PageHeading className="stacked-page-heading" title="隐私说明" description="学习记录由你掌握，核心功能在浏览器本地完成。" />
    <p className="body-copy">本说明适用于当前静态版本，更新日期为 2026-09-01。若未来加入账号、云同步或统计功能，将在启用前更新说明并清楚告知。</p>
    <div className="grid gap-4 sm:grid-cols-2">{items.map(({ icon: Icon, title, text }) => <Card key={title}>
      <CardHeader><CardTitle className="flex items-center gap-2"><Icon aria-hidden="true" className="size-5 text-primary" />{title}</CardTitle><CardDescription>{text}</CardDescription></CardHeader>
    </Card>)}</div>
    <p className="text-sm leading-7 text-muted-foreground">请勿在字帖中输入身份证号、联系方式等敏感信息。虽然内容不由本站应用上传，下载、打印或共享生成文件时仍应由你自行确认接收方和使用范围。</p>
  </div>;
}
