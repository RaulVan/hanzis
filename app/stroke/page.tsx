import { pageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import { PageHeading } from "@/components/layout/PageHeading";
import { StrokeViewer } from "@/components/stroke/StrokeViewer";
import { Skeleton } from "@/components/ui/skeleton";
import { LearningGuide } from "@/components/learning/LearningGuide";

export const metadata = pageMetadata(
  "/stroke/",
  "汉字笔顺查询 · 笔画顺序动画与书写练习",
  "输入汉字查询笔画顺序，观看逐笔笔顺动画和分解图，通过交互式书写测验练习汉字，并生成可打印字帖。",
);

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
      <LearningGuide id="stroke-guide" title="汉字笔顺查询与练习方法" steps={[
        { title: "先观察完整笔顺", text: "输入一个汉字，播放笔顺动画，观察笔画的起点、方向和先后顺序。遇到复杂的字，可结合逐笔分解查看每一笔的位置。" },
        { title: "再动手跟写", text: "在书写测验中按顺序描写汉字，把观察到的笔画顺序变成手部练习。熟悉后可生成字帖，继续在纸上书写。" },
        { title: "结合字音与字义", text: "认识一个字时，把读音、意思和写法一起学习。本站提供 9,574 个本地汉字字形文件，部分生僻字可能没有笔顺资料。" },
      ]} links={[{ href: "/", label: "生成汉字字帖" }, { href: "/dictionary/", label: "查询汉字释义" }, { href: "/about/#sources", label: "查看笔顺数据来源" }]} />
    </>
  );
}
