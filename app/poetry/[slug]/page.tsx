import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPoem, poems, poemText } from "@/data/poems";
import { PoemReader } from "@/components/poetry/PoemReader";
import { Button } from "@/components/ui/button";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";

export const dynamicParams = false;
export function generateStaticParams() { return poems.map(poem => ({ slug: poem.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const poem = getPoem((await params).slug);
  if (!poem) return { title: "未找到诗词" };
  return pageMetadata(`/poetry/${poem.slug}/`, `${poem.title} · ${poem.author} · 原文、拼音与译文`, `${poem.dynasty}代${poem.author}《${poem.title}》：${poem.lines.slice(0, 2).map(line => line.text).join("")} 阅读完整原文、拼音、译文与注释，练习背诵或生成古诗词字帖。`);
}
export default async function PoemPage({ params }: { params: Promise<{ slug: string }> }) {
  const poem = getPoem((await params).slug);
  if (!poem) notFound();
  const url = `${SITE_URL}/poetry/${poem.slug}/`;
  return <div className="mx-auto flex max-w-4xl flex-col gap-5">
    <StructuredData data={{
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "CreativeWork", "@id": `${url}#poem`, url, name: poem.title, author: { "@type": "Person", name: poem.author }, inLanguage: "zh-CN", genre: "诗词", text: poemText(poem) },
        { "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "字帖生成", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "古诗词", item: `${SITE_URL}/poetry/` },
          { "@type": "ListItem", position: 3, name: poem.title, item: url },
        ] },
      ],
    }} />
    <nav aria-label="面包屑" className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
      <Link href="/" className="inline-flex min-h-11 items-center hover:underline">字帖生成</Link><span aria-hidden="true">/</span>
      <Link href="/poetry/" className="inline-flex min-h-11 items-center hover:underline">古诗词</Link><span aria-hidden="true">/</span>
      <span aria-current="page">{poem.title}</span>
    </nav>
    <Button variant="ghost" asChild className="self-start"><Link href={`/poetry/?poem=${poem.slug}`}><ArrowLeft aria-hidden="true" />返回诗词目录</Link></Button><PoemReader poem={poem} standalone />
  </div>;
}
