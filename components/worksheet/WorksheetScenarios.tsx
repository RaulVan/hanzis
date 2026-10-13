import Link from "next/link";
import { UiText } from "@/components/i18n/UiText";
import { worksheetScenarioIds, worksheetScenarios, worksheetScenarioSample, type WorksheetScenarioId } from "@/data/worksheetScenarios";
import { WorksheetPageSVG } from "./WorksheetPageSVG";

export function WorksheetScenarioSample({ scenario }: { scenario: WorksheetScenarioId }) {
  return <figure className="space-y-3">
    <div className="mx-auto w-full max-w-52 overflow-hidden rounded-md border border-border bg-white shadow-sm">
      <WorksheetPageSVG document={worksheetScenarioSample(scenario)} pageIndex={0} />
    </div>
    <figcaption className="text-center text-xs leading-relaxed text-muted-foreground"><UiText text="真实排版样例 · A4 210 × 297 毫米 · 第 1 页" /></figcaption>
  </figure>;
}

export function WorksheetScenarios() {
  return <section aria-labelledby="worksheet-scenarios" className="mt-10 space-y-5 border-t border-border pt-8">
    <h2 id="worksheet-scenarios" className="section-title"><UiText text="从练习场景开始" /></h2>
    <div className="grid gap-5 md:grid-cols-3">{worksheetScenarioIds.map(id => <article key={id} className="space-y-4 rounded-xl border border-border p-5">
      <WorksheetScenarioSample scenario={id} />
      <h3 className="font-semibold"><Link href={`/worksheets/${id}/`} className="inline-flex min-h-11 items-center text-primary underline underline-offset-4"><UiText>{worksheetScenarios[id].title}</UiText></Link></h3>
      <p className="body-copy"><UiText>{worksheetScenarios[id].description}</UiText></p>
    </article>)}</div>
  </section>;
}
