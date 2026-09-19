import haitang from "@/data/haitang-manifest.json";
import sources from "@/data/dictionary-sources.json";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { BookOpen, FileText, HelpCircle, ShieldCheck, Volume2 } from "lucide-react";
import { PageHeading } from "@/components/layout/PageHeading";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export const metadata = pageMetadata(
  "/about/",
  "关于与帮助",
  "了解汉字网的字帖生成、拼音学习、笔顺查询、古诗词与中文字典使用方法，查看数据来源与第三方许可。",
);

const helpItems = [
  { href: "/", title: "字帖生成", text: "输入汉字后选择字格、描红、拼音与纸张；可下载 PDF、当前页图片，或打印全部页面。" },
  { href: "/pinyin/", title: "拼音学习", text: "按声母、韵母、整体认读音节和声调学习，再用综合练习检查掌握情况。" },
  { href: "/stroke/", title: "汉字笔顺", text: "输入一个汉字，播放笔顺动画、逐笔观察并在画布中跟写。" },
  { href: "/poetry/", title: "古诗词", text: "搜索唐宋诗词、切换拼音、朗读和背诵，也可以将整首诗带入字帖。" },
  { href: "/dictionary/", title: "中文字典", text: "按汉字、词语、拼音、部首或笔画查询，再前往字帖和笔顺练习。" },
];

export default function AboutPage() {
  return <div className="mx-auto flex max-w-5xl flex-col gap-8">
    <PageHeading className="stacked-page-heading" title="关于汉字网" description="一组无需注册、打开就能使用的中文学习工具。" />
    <section aria-labelledby="help-title" className="space-y-4">
      <h2 id="help-title" className="section-title flex items-center gap-2"><HelpCircle aria-hidden="true" />从哪里开始</h2>
      <div className="grid gap-4 sm:grid-cols-2">{helpItems.map(item => <Card key={item.href}>
        <CardHeader><h3 className="text-lg font-semibold leading-snug"><Link className="underline-offset-4 hover:underline" href={item.href}>{item.title}</Link></h3><CardDescription>{item.text}</CardDescription></CardHeader>
      </Card>)}</div>
    </section>

    <section id="sources" aria-labelledby="sources-title" className="scroll-mt-24 space-y-4">
      <h2 id="sources-title" className="section-title flex items-center gap-2"><BookOpen aria-hidden="true" />数据来源与范围</h2>
      <Card><CardContent className="space-y-5 pt-1 text-sm leading-7 text-muted-foreground">
        <div><h3 className="font-semibold text-foreground">汉字字形与笔顺</h3><p>9,574 个本地字形文件来自 <a href="https://github.com/chanind/hanzi-writer-data" rel="noreferrer" className="underline underline-offset-4">hanzi-writer-data</a>。底层字形资料按文鼎公众授权条款提供，发布包保留完整许可和来源说明。</p></div>
        <div><h3 className="font-semibold text-foreground">字词释义</h3><p>开放词库包含 278,369 条释义索引，来源快照取自 <a href="https://github.com/theajack/cnchar" rel="noreferrer" className="underline underline-offset-4">cnchar-data</a>，按 MIT License 使用并重新分片。部分词条可能缺少释义，页面会如实提示。</p></div>
        <div><h3 className="font-semibold text-foreground">教育部《国语辞典简编本》</h3><p>本地保留版本 2014_20260626 的 45,130 条原始繁体条目及全部字段；网站的简体检索映射和学习提示与原始资料分开呈现。来源为<a href="https://dict.concised.moe.edu.tw/" rel="noreferrer" className="underline underline-offset-4">教育部《国语辞典简编本》</a>，依 CC BY-ND 3.0 TW 及官方公众授权说明使用。</p></div>
        <div><h3 className="font-semibold text-foreground">教育部《重編國語辭典修訂本》</h3><p>通过 <a href="https://github.com/g0v/moedict-data/tree/a6dc997417507eb510fc29822bc514de2c92728c" className="underline underline-offset-4">g0v/moedict-data</a> 收录 {sources[0].entries.toLocaleString("zh-CN")} 条资料，保留繁体原文、异读、例句与引文。上游标示为中華民國110年11月臺灣學術網路第六版，依 CC BY-ND 3.0 TW 使用。moedict-process 为相关处理工具，不另算一个来源。</p></div>
        <div><h3 className="font-semibold text-foreground">第三方整理字典 · chinese-xinhua</h3><p>来自 <a href="https://github.com/pwxcoo/chinese-xinhua/tree/fe6d6c2e8baa82187f4c96bbe042e43f96c05666" className="underline underline-offset-4">pwxcoo/chinese-xinhua</a>：{sources[1].entries.toLocaleString("zh-CN")} 条汉字、{sources[2].entries.toLocaleString("zh-CN")} 条词语与 {sources[3].entries.toLocaleString("zh-CN")} 条成语记录，包含同字异读与重复词头。这是网络收集整理资料，非官方《新华字典》版本；仓库附 MIT License，原始内容权利归属未逐条核验。各来源分别显示，便于对照。</p></div>
        <div><h3 className="font-semibold text-foreground">诗词与注音</h3><p>本站提供 30 首含拼音的校对诗词，以及 {haitang.counts.works.toLocaleString("zh-CN")} 篇作品（含诗、词、文、曲、赋）。部分作品尚无拼音、译文或注解；注音标本调，实际朗读可能变调。诗词来源：<a href="https://github.com/chinese-poetry/chinese-poetry" className="underline underline-offset-4">chinese-poetry/chinese-poetry</a>。</p></div>
      </CardContent></Card>
    </section>

    <section aria-labelledby="audio-title" className="space-y-4">
      <h2 id="audio-title" className="section-title flex items-center gap-2"><Volume2 aria-hidden="true" />录音与系统语音</h2>
      <Card><CardHeader><h3 className="text-lg font-semibold leading-snug">本地拼音录音</h3><CardDescription>站内包含 1,678 个 MP3 文件。项目所有者已于 2026-09-01 确认取得口头授权，书面授权说明将在后续补充；这些录音不包含在源码 MIT License 中。轻声或缺少录音的示例会明确使用设备的系统中文语音。</CardDescription></CardHeader></Card>
    </section>

    <section aria-labelledby="license-title" className="space-y-4">
      <h2 id="license-title" className="section-title flex items-center gap-2"><ShieldCheck aria-hidden="true" />许可与完整说明</h2>
      <Card><CardContent className="flex flex-wrap gap-3 pt-1">
        <Link href="/licenses/NOTICE.txt" className="inline-flex min-h-11 items-center gap-2 rounded-md border px-4 py-2 hover:bg-muted"><FileText aria-hidden="true" className="size-4" />第三方资料说明</Link>
        <Link href="/licenses/MOE-Concised-Usage.pdf" className="inline-flex min-h-11 items-center gap-2 rounded-md border px-4 py-2 hover:bg-muted"><FileText aria-hidden="true" className="size-4" />简编本使用说明</Link>
        <Link href="/licenses/MOE-Revised-Usage.txt" className="inline-flex min-h-11 items-center gap-2 rounded-md border px-4 py-2 hover:bg-muted"><FileText aria-hidden="true" className="size-4" />修订本使用说明</Link>
        <Link href="/licenses/ARPHICPL.TXT" className="inline-flex min-h-11 items-center gap-2 rounded-md border px-4 py-2 hover:bg-muted"><FileText aria-hidden="true" className="size-4" />字形资料许可</Link>
      </CardContent></Card>
    </section>
  </div>;
}
