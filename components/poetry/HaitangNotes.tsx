"use client";
import { useTranslate } from "@/components/i18n/LanguageProvider";
import { UiText } from "@/components/i18n/UiText";
import type { HaitangWork } from "@/lib/haitangTypes";
import { poetryText } from "@/lib/poetryCatalog";

export function HaitangNotes({ work }: { work: HaitangWork }) {
  const t = useTranslate();
  // Remove platform version credits only; preserve literary uses of the same words.
  const sections = [["译文", work.translation], ["注解", work.annotation], ["作品简介", work.intro], ["评价", work.master_comment]];
  return <section className="flex flex-col gap-4" aria-label={t("作品资料")}>
    <h3 className="section-title"><UiText text="诗意与注释" /></h3>
    {sections.map(([title, value]) => value ? <details key={title} className="rounded-lg border border-border"><summary className="min-h-11 cursor-pointer px-4 py-3 font-medium"><UiText>{title}</UiText></summary><p className="whitespace-pre-wrap break-words border-t border-border p-4 text-sm leading-8 text-muted-foreground">{poetryText(value).replace(/西窗烛(?=(?:选取)?版本据)/g, "")}</p></details> : <p key={title} className="text-sm text-muted-foreground"><UiText text="来源暂未提供{0}。" values={[title]} /></p>)}
    {work.quotes.length > 0 && <details className="rounded-lg border border-border"><summary className="min-h-11 cursor-pointer px-4 py-3 font-medium"><UiText text="佳句（{0}）" values={[work.quotes.length]} /></summary><ul className="space-y-3 border-t border-border p-4 text-sm leading-7">{work.quotes.map((quote, index) => <li key={index} className="whitespace-pre-wrap break-words">{quote}</li>)}</ul></details>}
    {work.collections.length > 0 && <p className="break-words text-xs leading-7 text-muted-foreground"><UiText text="收录选集：{0}" values={[work.collections.join("、")]} /></p>}

  </section>;
}
