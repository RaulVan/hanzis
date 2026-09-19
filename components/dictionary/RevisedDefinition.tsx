import type { RevisedEntry } from "@/lib/dictionarySources";

export function RevisedDefinition({ entries, expanded }: { entries: RevisedEntry[]; expanded: boolean }) {
  return <details open={expanded} className="rounded-lg border border-border">
    <summary className="min-h-11 cursor-pointer px-5 py-4 font-semibold">《重編國語辭典修訂本》</summary>
    <section aria-label="修订本释义" className="flex flex-col gap-5 border-t border-border p-5">
      <p className="text-xs leading-6 text-muted-foreground">教育部原文 · 经 g0v/moedict-data 提供。保留繁体、原始音读及罕用字标记，含历史用法。</p>
      {entries.map(entry => <div key={entry.title} className="flex flex-col gap-4">
        <h3 className="font-serif text-2xl font-semibold">{entry.title}</h3>
        {entry.radical !== undefined && <p className="text-sm text-muted-foreground">部首：{entry.radical} · 总笔画：{entry.stroke_count} · 部首外笔画：{entry.non_radical_stroke_count}</p>}
        {entry.heteronyms.map((reading, index) => <div key={index} className="flex flex-col gap-3 border-b border-border pb-5 last:border-b-0">
          <p className="text-primary">{reading.pinyin} <span className="ml-3 text-sm text-muted-foreground">{reading.bopomofo}</span></p>
          <ol className="ml-5 list-decimal space-y-4">{reading.definitions.map((definition, index) => <li key={index} className="space-y-2 pl-1 leading-8">
            {definition.type && <span className="mr-2 rounded bg-muted px-2 py-1 text-sm">{definition.type}</span>}
            <span className="whitespace-pre-wrap break-words">{definition.def}</span>
            {(["quote", "example", "link"] as const).map(field => definition[field]?.map((text, index) => <p key={`${field}-${index}`} className="whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">{text}</p>))}
            {definition.synonyms && <p className="text-sm text-muted-foreground">近义：{definition.synonyms}</p>}
            {definition.antonyms && <p className="text-sm text-muted-foreground">反义：{definition.antonyms}</p>}
          </li>)}</ol>
        </div>)}
        <details className="rounded-md bg-muted"><summary className="min-h-11 cursor-pointer px-4 py-3 text-sm">查看修订本全部原始字段</summary><pre className="whitespace-pre-wrap break-all border-t border-border p-4 text-xs leading-6">{JSON.stringify(entry, null, 2)}</pre></details>
      </div>)}
      <p className="rounded-md bg-muted p-4 text-xs leading-6 text-muted-foreground">中華民國教育部（Ministry of Education, R.O.C.）。<a href="https://dict.revised.moe.edu.tw/" className="underline underline-offset-4">《重編國語辭典修訂本》</a>。上游标示版次：中華民國110年11月臺灣學術網路第六版；<a href="https://github.com/g0v/moedict-data/tree/a6dc997417507eb510fc29822bc514de2c92728c" className="underline underline-offset-4">g0v 快照 a6dc997</a>。<br /><a href="https://creativecommons.org/licenses/by-nd/3.0/tw/" className="underline underline-offset-4">CC BY-ND 3.0 TW</a> · <a href="/licenses/MOE-Revised-Usage.txt" className="underline underline-offset-4">完整公众授权使用说明</a>。本网站不代表资料著作权利人。</p>
    </section>
  </details>;
}
