import type { DictionaryEntry } from "@/lib/dictionaryData";
import { Button } from "@/components/ui/button";
import { MoeDefinition } from "./MoeDefinition";
import { RevisedDefinition } from "./RevisedDefinition";
import { XinhuaDefinition } from "./XinhuaDefinition";

export function DictionaryPreview({ entry, onRetry }: { entry: DictionaryEntry; onRetry: () => void }) {
  const info = entry.character;
  return <article aria-label={`${entry.term}的释义`} className="flex min-w-0 flex-col gap-5">
    <div className="flex items-center gap-5 rounded-xl bg-muted p-4">
      <span className="flex size-20 shrink-0 items-center justify-center rounded-lg border border-border bg-card font-serif text-5xl text-primary">{entry.term}</span>
      <div className="flex min-w-0 flex-col gap-2">
        <p className="break-words text-lg text-primary">{entry.spelling.filter(Boolean).join(" ") || "暂未收录读音"}</p>
        <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm"><div><dt className="inline text-muted-foreground">部首 </dt><dd className="inline">{info?.radical || "暂未收录"}</dd></div><div><dt className="inline text-muted-foreground">笔画 </dt><dd className="inline">{info?.strokeCount ? `${info.strokeCount} 画` : "暂未收录"}</dd></div>{info?.struct && <div><dt className="inline text-muted-foreground">结构 </dt><dd className="inline">{info.struct}</dd></div>}</dl>
        <p className="text-xs leading-5 text-muted-foreground">多音字请结合下方释义区分读音。</p>
      </div>
    </div>
    {entry.unavailableSources.length > 0 && <div role="status" className="rounded-lg border border-border p-3 text-sm leading-6"><p>{entry.unavailableSources.join("、")}暂时无法读取，当前资料可能不完整。</p><Button variant="outline" size="sm" onClick={onRetry}>重试缺失释义</Button></div>}
    {entry.moe.length ? <MoeDefinition entries={entry.moe} compact /> : entry.revised.length ? <RevisedDefinition entries={entry.revised} expanded /> : entry.xinhua.length ? <XinhuaDefinition entries={entry.xinhua} expanded /> : entry.openDefinition ? <section className="space-y-3"><h3 className="section-title">词典释义</h3><p className="whitespace-pre-wrap break-words leading-8">{entry.openDefinition}</p><p className="text-xs text-muted-foreground">来源：cnchar-data 1.1.0 · MIT</p></section> : !entry.unavailableSources.length && <p className="text-sm leading-7 text-muted-foreground">当前词库还没有这个字的释义。</p>}
  </article>;
}
