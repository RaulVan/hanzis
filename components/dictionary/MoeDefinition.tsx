import type { MoeEntry } from "@/lib/dictionaryData";
import manifest from "@/data/asset-manifest.json";

export function MoeDefinition({ entries }: { entries: MoeEntry[] }) {
  return <section className="flex flex-col gap-5" aria-labelledby="moe-definition-title"><div><h3 className="section-title" id="moe-definition-title">词典释义</h3><p className="mt-1 text-xs leading-6 text-muted-foreground">《國語辭典簡編本》原文 · 保留繁体字与原始音读，地区读音可能有差异。</p></div>
    {entries.map(entry => <div key={entry["字詞號"]} className="flex flex-col gap-3 border-b border-border pb-5 last:border-b-0 last:pb-0"><div className="flex flex-wrap items-baseline gap-x-4 gap-y-1"><h4 className="font-serif text-2xl font-semibold">{entry["字詞名"]}</h4><p className="text-primary">{entry["漢語拼音"]}</p><p className="text-sm text-muted-foreground">{entry["注音一式"]}</p></div><p className="whitespace-pre-wrap break-words leading-8">{entry["釋義"]}</p>{entry["多音參見訊息"].trim() && <p className="text-sm leading-7 text-muted-foreground">多音參見訊息：{entry["多音參見訊息"]}</p>}
      <details className="rounded-md bg-muted"><summary className="min-h-11 cursor-pointer px-4 py-3 text-sm text-muted-foreground">查看全部原始字段</summary><dl className="flex flex-col gap-3 border-t border-border p-4 text-sm">{Object.entries(entry).filter(([, value]) => value.trim()).map(([name, value]) => <div key={name}><dt className="font-semibold">{name}</dt><dd className="whitespace-pre-wrap break-words leading-7 text-muted-foreground">{value}</dd></div>)}</dl></details>
    </div>)}
    <p className="rounded-md bg-muted p-4 text-xs leading-6 text-muted-foreground">中華民國教育部（Ministry of Education, R.O.C.）。<a href="https://dict.concised.moe.edu.tw/" target="_blank" rel="noreferrer" className="underline underline-offset-4">《國語辭典簡編本》</a>（版本編號：{manifest.moeVersion}）。<br /><a href="https://creativecommons.org/licenses/by-nd/3.0/tw/" target="_blank" rel="noreferrer" className="underline underline-offset-4">CC BY-ND 3.0 TW</a> · <a href="/licenses/MOE-Concised-Usage.pdf" target="_blank" rel="noreferrer" className="underline underline-offset-4">完整公众授权使用说明</a>。本网站不代表资料著作权利人。</p>
  </section>;
}
