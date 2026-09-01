import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPoem, poems, poemText } from "@/data/poems";
import { PoemReader } from "@/components/poetry/PoemReader";
import { Button } from "@/components/ui/button";

export const dynamicParams = false;
export function generateStaticParams() { return poems.map(poem => ({ slug: poem.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const poem = getPoem((await params).slug);
  if (!poem) return { title: "未找到诗词" };
  return { title: `${poem.title} · ${poem.author}`, description: `${poemText(poem).replaceAll("\n", "")} 阅读拼音、译文与注释，练习背诵。`, alternates: { canonical: `/poetry/${poem.slug}/` } };
}
export default async function PoemPage({ params }: { params: Promise<{ slug: string }> }) {
  const poem = getPoem((await params).slug);
  if (!poem) notFound();
  return <div className="mx-auto flex max-w-4xl flex-col gap-5"><Button variant="ghost" asChild className="self-start"><Link href={`/poetry/?poem=${poem.slug}`}><ArrowLeft aria-hidden="true" />返回诗词目录</Link></Button><PoemReader poem={poem} standalone /></div>;
}
