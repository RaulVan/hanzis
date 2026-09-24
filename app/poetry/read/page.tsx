import { Suspense } from "react";
import { PoetryStandalone } from "@/components/poetry/PoetryStandalone";
import { Skeleton } from "@/components/ui/skeleton";
import { pageMetadata } from "@/lib/seo";

export const metadata = {
  ...pageMetadata("/poetry/read/", "诗词独立阅读", "独立阅读诗词原文、拼音与注释，支持单字查询、朗读、收藏、背诵和生成字帖；使用作品链接分享阅读内容。"),
  robots: { index: false, follow: true },
};

export default function PoetryReadPage() {
  return <Suspense fallback={<Skeleton className="mx-auto h-96 w-full max-w-4xl" aria-label="正在加载诗词" />}><PoetryStandalone /></Suspense>;
}
