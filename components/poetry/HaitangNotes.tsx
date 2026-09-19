import type { HaitangWork } from "@/lib/haitangTypes";
import { poetryText } from "@/lib/poetryCatalog";

export function HaitangNotes({ work }: { work: HaitangWork }) {
  // Remove platform version credits only; preserve literary uses of the same words.
  const sections = [["译文", work.translation], ["注解", work.annotation], ["作品简介", work.intro], ["评价", work.master_comment]];
  return <section className="flex flex-col gap-4" aria-label="作品资料">
    <h3 className="section-title">诗意与注释</h3>
    {sections.map(([title, value]) => value ? <details key={title} className="rounded-lg border border-border"><summary className="min-h-11 cursor-pointer px-4 py-3 font-medium">{title}</summary><p className="whitespace-pre-wrap break-words border-t border-border p-4 text-sm leading-8 text-muted-foreground">{poetryText(value).replace(/西窗烛(?=(?:选取)?版本据)/g, "")}</p></details> : <p key={title} className="text-sm text-muted-foreground">来源暂未提供{title}。</p>)}
    {work.quotes.length > 0 && <details className="rounded-lg border border-border"><summary className="min-h-11 cursor-pointer px-4 py-3 font-medium">佳句（{work.quotes.length}）</summary><ul className="space-y-3 border-t border-border p-4 text-sm leading-7">{work.quotes.map((quote, index) => <li key={index} className="whitespace-pre-wrap break-words">{quote}</li>)}</ul></details>}
    {work.collections.length > 0 && <p className="break-words text-xs leading-7 text-muted-foreground">收录选集：{work.collections.join("、")}</p>}
    <p className="text-xs leading-7 text-muted-foreground">诗词来源：<a href="https://github.com/chinese-poetry/chinese-poetry" className="underline underline-offset-4">chinese-poetry/chinese-poetry</a>。</p>
  </section>;
}
