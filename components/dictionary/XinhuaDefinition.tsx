"use client";
import { useTranslate } from "@/components/i18n/LanguageProvider";
import { UiText } from "@/components/i18n/UiText";
import type { XinhuaEntry } from "@/lib/dictionarySources";

const kinds = { character: "汉字", word: "词语", idiom: "成语" };
const fields = { oldword: "原字形", strokes: "笔画", radicals: "部首", derivation: "出处", example: "例句", abbreviation: "拼音首字母" };
export function XinhuaDefinition({ entries, expanded }: { entries: XinhuaEntry[]; expanded: boolean }) {
  const t = useTranslate();
  return <details open={expanded} className="rounded-lg border border-border">
    <summary className="min-h-11 cursor-pointer px-5 py-4 font-semibold"><UiText text="整理词典" /></summary>
    <section aria-label={t("第三方整理释义")} className="flex flex-col gap-5 border-t border-border p-5">
      <p className="text-xs leading-6 text-muted-foreground"><UiText text="整理资料供对照参考，可能含旧用法、缺字或排版错误。" /></p>
      {entries.map(({ kind, data }, index) => <div key={index} className="flex flex-col gap-3 border-b border-border pb-5 last:border-b-0">
        <div className="flex flex-wrap items-baseline gap-3"><h3 className="font-serif text-2xl font-semibold">{data.word || data.ci}</h3><span className="text-xs text-muted-foreground"><UiText>{kinds[kind]}</UiText></span></div>
        {data.pinyin && <p className="text-primary">{data.pinyin}</p>}
        <p className="whitespace-pre-wrap break-words leading-8">{data.explanation || <UiText text="此条原始记录未提供释义。" />}</p>
        <dl className="space-y-2 text-sm leading-7">{Object.entries(fields).map(([field, label]) => data[field] && <div key={field}><dt className="font-medium"><UiText>{label}</UiText></dt><dd className="whitespace-pre-wrap break-words text-muted-foreground">{data[field]}</dd></div>)}</dl>
        {data.more && <details className="rounded-md bg-muted"><summary className="min-h-11 cursor-pointer px-4 py-3 text-sm"><UiText text="更多原文资料" /></summary><p className="whitespace-pre-wrap break-words border-t border-border p-4 text-sm leading-7">{data.more}</p></details>}
      </div>)}
      <p className="text-xs leading-6 text-muted-foreground"><a href="/about/copyright/#sources" className="underline underline-offset-4"><UiText text="资料与版权说明" /></a></p>
    </section>
  </details>;
}
