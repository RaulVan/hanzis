import type { Metadata } from "next";
import { Suspense } from "react";
import { WorksheetGenerator } from "@/components/worksheet/WorksheetGenerator";
import { PageHeading } from "@/components/layout/PageHeading";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "字帖生成 · 免费汉字书写练习",
  description: "输入汉字，选择田字格、米字格、回宫格或空白格，添加拼音和笔顺，导出多页 A4 PDF 或打印字帖。",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <PageHeading title="把每一个字，写得更好。" description="从一笔一画开始，让汉字学习成为日常。" />
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}><WorksheetGenerator /></Suspense>
    </>
  );
}
