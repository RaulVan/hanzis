import type { XinhuaEntry } from "@/lib/dictionarySources";

const kinds = { character: "汉字", word: "词语", idiom: "成语" };
const fields = { oldword: "原字形", strokes: "笔画", radicals: "部首", derivation: "出处", example: "例句", abbreviation: "拼音首字母" };
export function XinhuaDefinition({ entries, expanded }: { entries: XinhuaEntry[]; expanded: boolean }) {
  return <details open={expanded} className="rounded-lg border border-border">
    <summary className="min-h-11 cursor-pointer px-5 py-4 font-semibold">第三方整理字典 · chinese-xinhua</summary>
    <section aria-label="第三方整理释义" className="flex flex-col gap-5 border-t border-border p-5">
      <p className="text-xs leading-6 text-muted-foreground">pwxcoo/chinese-xinhua 收集整理 · 非官方《新华字典》版本。原文可能含旧用法、缺字或排版错误，供对照参考。</p>
      {entries.map(({ kind, data }, index) => <div key={index} className="flex flex-col gap-3 border-b border-border pb-5 last:border-b-0">
        <div className="flex flex-wrap items-baseline gap-3"><h3 className="font-serif text-2xl font-semibold">{data.word || data.ci}</h3><span className="text-xs text-muted-foreground">{kinds[kind]}</span></div>
        {data.pinyin && <p className="text-primary">{data.pinyin}</p>}
        <p className="whitespace-pre-wrap break-words leading-8">{data.explanation || "此条原始记录未提供释义。"}</p>
        <dl className="space-y-2 text-sm leading-7">{Object.entries(fields).map(([field, label]) => data[field] && <div key={field}><dt className="font-medium">{label}</dt><dd className="whitespace-pre-wrap break-words text-muted-foreground">{data[field]}</dd></div>)}</dl>
        {data.more && <details className="rounded-md bg-muted"><summary className="min-h-11 cursor-pointer px-4 py-3 text-sm">更多原文资料</summary><p className="whitespace-pre-wrap break-words border-t border-border p-4 text-sm leading-7">{data.more}</p></details>}
      </div>)}
      <p className="rounded-md bg-muted p-4 text-xs leading-6 text-muted-foreground">来源：<a href="https://github.com/pwxcoo/chinese-xinhua/tree/fe6d6c2e8baa82187f4c96bbe042e43f96c05666" className="underline underline-offset-4">pwxcoo/chinese-xinhua · fe6d6c2</a>。仓库附 <a href="/licenses/chinese-xinhua-MIT.txt" className="underline underline-offset-4">MIT License</a>；数据为网络收集，原始内容权利归属未逐条核验。<a href="/licenses/chinese-xinhua-README.txt" className="underline underline-offset-4">查看上游说明与版权声明</a>。</p>
    </section>
  </details>;
}
