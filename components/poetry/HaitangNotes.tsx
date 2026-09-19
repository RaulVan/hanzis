import type { HaitangWork } from "@/lib/haitangTypes";
import { poetryText } from "@/lib/poetryCatalog";
import manifest from "@/data/haitang-manifest.json";

export function HaitangNotes({ work }: { work: HaitangWork }) {
  const sections = [["译文", work.translation], ["注解", work.annotation], ["作品简介", work.intro], ["评价", work.master_comment]];
  return <section className="flex flex-col gap-4" aria-label="海棠作品资料">
    <h3 className="section-title">来源资料</h3>
    {sections.map(([title, value]) => value ? <details key={title} className="rounded-lg border border-border"><summary className="min-h-11 cursor-pointer px-4 py-3 font-medium">{title}</summary><p className="whitespace-pre-wrap break-words border-t border-border p-4 text-sm leading-8 text-muted-foreground">{poetryText(value)}</p></details> : <p key={title} className="text-sm text-muted-foreground">来源暂未提供{title}。</p>)}
    {work.quotes.length > 0 && <details className="rounded-lg border border-border"><summary className="min-h-11 cursor-pointer px-4 py-3 font-medium">佳句（{work.quotes.length}）</summary><ul className="space-y-3 border-t border-border p-4 text-sm leading-7">{work.quotes.map((quote, index) => <li key={index} className="whitespace-pre-wrap break-words">{quote}</li>)}</ul></details>}
    {work.collections.length > 0 && <p className="break-words text-xs leading-7 text-muted-foreground">收录选集：{work.collections.join("、")}</p>}
    <p className="rounded-md bg-muted p-4 text-xs leading-7 text-muted-foreground">来源：<a href={`${manifest.repository}/tree/${manifest.revision}/src/database`} className="underline underline-offset-4">海棠诗社 leozxl/haitang</a>（作品编号 {work.id}）；上游注明资料来源为<a href="https://www.xczim.com/" className="underline underline-offset-4">西窗烛</a>。数据库标记日期：{manifest.databaseVersion[0].generated_at.slice(0, 10)}。<br />保留来源文本；未逐篇校勘，未提供拼音。仓库 MIT 许可针对代码，不代表数据库全部文本的独立授权。<a href="/licenses/haitang-README.txt" className="underline underline-offset-4">查看上游声明</a>。</p>
  </section>;
}
