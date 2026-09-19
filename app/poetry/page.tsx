import { pageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import { PageHeading } from "@/components/layout/PageHeading";
import { PoetryLibrary } from "@/components/poetry/PoetryLibrary";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import manifest from "@/data/haitang-manifest.json";
import { poems } from "@/data/poems";

export const metadata = pageMetadata(
  "/poetry/",
  "古诗词学习 · 诗词原文、拼音与注释",
  "阅读诗词原文与注释，按朝代、作者和选集查找作品；部分作品提供拼音，支持朗读、收藏、背诵和选段生成字帖。",
);
export default function PoetryPage() {
  const heading = <PageHeading className="poetry-page-heading" title="读一首诗，记一段时光。" description="读原文、看注释，在熟悉的诗句里认识汉字。" />;
  return <>
    <Suspense fallback={<>{heading}<Skeleton className="h-[600px] w-full" aria-label="正在加载诗词" /></>}><PoetryLibrary heading={heading} /></Suspense>
    <section aria-labelledby="poetry-reading-index" className="mt-12 space-y-5 border-t border-border pt-8">
      <h2 id="poetry-reading-index" className="section-title">唐宋古诗词阅读目录</h2>
      <p className="body-copy">本站校对精选 {poems.length} 首唐宋诗词，每首提供原文、拼音、译文与学习注释。上方另可浏览 {manifest.counts.works.toLocaleString("zh-CN")} 篇作品。选择诗名进入独立阅读页，也可以朗读、练习背诵或生成字帖。</p>
      <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">{poems.map(poem => <li key={poem.slug}>
        <Link href={`/poetry/${poem.slug}/`} className="flex min-h-11 items-center gap-3 py-2 text-sm underline-offset-4 hover:underline"><span className="text-primary">{poem.title}</span><span className="text-muted-foreground">{poem.dynasty} · {poem.author}</span></Link>
      </li>)}</ul>
    </section>
  </>;
}
