import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeading } from "@/components/layout/PageHeading";
import { PoetryLibrary } from "@/components/poetry/PoetryLibrary";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "古诗词", description: "读原文、看注释，收藏唐宋诗词，练习背诵，生成带拼音的诗词字帖。", alternates: { canonical: "/poetry/" } };
export default function PoetryPage() {
  const heading = <PageHeading className="poetry-page-heading" title="读一首诗，记一段时光。" description="读原文、看注释，在熟悉的诗句里认识汉字。" />;
  return <Suspense fallback={<>{heading}<Skeleton className="h-[600px] w-full" aria-label="正在加载诗词" /></>}><PoetryLibrary heading={heading} /></Suspense>;
}
