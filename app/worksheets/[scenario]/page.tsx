import { Suspense } from "react";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { PageHeading } from "@/components/layout/PageHeading";
import { LearningGuide } from "@/components/learning/LearningGuide";
import { UiText } from "@/components/i18n/UiText";
import { WorksheetGenerator } from "@/components/worksheet/WorksheetGenerator";
import { WorksheetScenarioSample } from "@/components/worksheet/WorksheetScenarios";
import { Skeleton } from "@/components/ui/skeleton";
import { worksheetScenarioIds, worksheetScenarios, type WorksheetScenarioId } from "@/data/worksheetScenarios";

export const dynamicParams = false;
export function generateStaticParams() { return worksheetScenarioIds.map(scenario => ({ scenario })); }
function resolveScenario(value: string): WorksheetScenarioId {
  if (!worksheetScenarioIds.includes(value as WorksheetScenarioId)) notFound();
  return value as WorksheetScenarioId;
}
export async function generateMetadata({ params }: { params: Promise<{ scenario: string }> }) {
  const id = resolveScenario((await params).scenario);
  return pageMetadata(`/worksheets/${id}/`, worksheetScenarios[id].title, worksheetScenarios[id].description);
}
export default async function WorksheetScenarioPage({ params }: { params: Promise<{ scenario: string }> }) {
  const id = resolveScenario((await params).scenario);
  const scenario = worksheetScenarios[id];
  return <>
    <PageHeading title={scenario.title} description={scenario.description} />
    <Suspense fallback={<Skeleton className="h-[600px] w-full" />}><WorksheetGenerator scenario={id} /></Suspense>
    <section className="mt-10 grid items-start gap-8 rounded-xl border border-border p-5 md:grid-cols-[220px_1fr]">
      <WorksheetScenarioSample scenario={id} />
      <div className="space-y-4"><h2 className="section-title"><UiText text="观察样例，再开始练习" /></h2>
        <p className="body-copy"><UiText>{scenario.guide}</UiText></p>
        <p className="body-copy"><UiText text="样例使用本页预设与实际导出相同的排版引擎。每行先看范字，再描红，最后在空格练写；上方预览会随你的设置更新。" /></p>
      </div>
    </section>
    <LearningGuide id="scenario-print-guide" title="打印与导出检查" steps={[
      { title: "核对纸张与缩放", text: "默认使用 A4 纵向，尺寸为 210 × 297 毫米。打印时选择相同纸张，以 100% 或实际大小输出；如打印机无法覆盖边缘，先增加字帖边距再导出。" },
      { title: "选择需要的文件", text: "PDF 包含全部页面，PNG 只保存当前预览页。导出前检查分页、拼音和字形；修改设置后应重新导出，旧文件不会自动更新。" },
      { title: "遇到问题时", text: "单次最多 200 个汉字、40 页。超过上限时减少文字或分批生成；资料缺失或导出失败时按页面提示重试。打印窗口未出现时，检查浏览器是否拦截了弹出窗口。" },
    ]} links={[{ href: "/", label: "返回字帖首页" }, ...worksheetScenarioIds.filter(item => item !== id).map(item => ({ href: `/worksheets/${item}/`, label: worksheetScenarios[item].title }))]} />
  </>;
}
