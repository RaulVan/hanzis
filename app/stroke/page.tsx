import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeading } from "@/components/layout/PageHeading";
import { StrokeViewer } from "@/components/stroke/StrokeViewer";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "汉字笔顺 · 动画与书写练习",
  description: "查询汉字笔顺，观看逐笔动画与分解，并使用交互式书写测验练习正确笔顺。",
  alternates: { canonical: "/stroke/" },
};

function StrokeViewerFallback() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]" role="status" aria-label="正在加载笔顺工具">
      <div className="space-y-6">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-[620px] w-full" />
      </div>
      <Skeleton className="h-[420px] w-full" />
    </div>
  );
}

export default function StrokePage() {
  return (
    <>
      <PageHeading title="从第一笔，写好一个字。" description="看清笔顺、逐笔拆解，再亲手写一遍。" />
      <Suspense fallback={<StrokeViewerFallback />}>
        <StrokeViewer />
      </Suspense>
    </>
  );
}
