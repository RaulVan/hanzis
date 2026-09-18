import { pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import { LearningGuide } from "@/components/learning/LearningGuide";
import { Suspense } from "react";
import { WorksheetGenerator } from "@/components/worksheet/WorksheetGenerator";
import { PageHeading } from "@/components/layout/PageHeading";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = pageMetadata(
  "/",
  "免费字帖生成器 · 田字格、米字格在线打印",
  "免费在线生成汉字字帖，支持田字格、米字格、回宫格与空白格，添加拼音、笔顺和描红，下载多页 PDF、PNG 图片或直接打印，无需注册。",
);

export default function Home() {
  return (
    <>
      <StructuredData data={{ "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: SITE_NAME, alternateName: ["汉字网", "Hanzis"], url: `${SITE_URL}/`, inLanguage: "zh-CN" }} />
      <PageHeading title="把每一个字，写得更好。" description="从一笔一画开始，让汉字学习成为日常。" />
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}><WorksheetGenerator /></Suspense>
      <LearningGuide id="worksheet-guide" title="免费在线生成汉字字帖" steps={[
        { title: "选择适合的字格", text: "输入要练习的汉字或古诗，选择田字格、米字格、回宫格或空白格。田字格便于观察字的中心与结构，米字格增加对角线，帮助对齐撇捺。" },
        { title: "按学习阶段设置", text: "初学时可以开启拼音、笔顺分解和描红；熟悉字形后减少提示，留出独立书写的空间。更多设置中可调整纸张、方向、边距和行距。" },
        { title: "下载或打印练习", text: "预览排版后，下载多页 PDF、当前页 PNG 图片，或直接打印全部页面。支持 A4、A3 和 Letter 纸张，无需注册，字帖内容在浏览器本地处理。" },
      ]} links={[{ href: "/pinyin/", label: "学习汉语拼音" }, { href: "/stroke/", label: "查询汉字笔顺" }, { href: "/poetry/", label: "挑选古诗练习" }]} />
    </>
  );
}
