import Link from "next/link";
import type { Poem } from "@/data/poems";
import { cn, isChinese } from "@/lib/utils";

export function PoemVerses({ poem, readings, showPinyin }: { poem: Poem; readings: string[][]; showPinyin: boolean }) {
  const imported = Boolean(poem.haitang);
  return <div className={cn("poem-verses flex flex-col py-2 font-serif", imported ? "whitespace-pre-wrap break-words text-xl leading-[2]" : "gap-2 text-center text-[clamp(1.25rem,2.3vw,2rem)] leading-[1.9]")} style={imported ? { textAlign: poem.haitang!.layout === "center" ? "center" : "left" } : undefined}>
    {poem.lines.map((line, lineIndex) => {
      // Plain text when hidden avoids thousands of unnecessary ruby nodes for long prose.
      if (imported && !showPinyin) return <p key={lineIndex} className="min-h-[2em]">{line.text || "\u00a0"}</p>;
      let syllable = 0;
      return <p key={lineIndex} className={imported ? "min-h-[2em]" : "text-balance"}>{Array.from(line.text).map((char, index) => {
        if (!isChinese(char)) return <span key={index}>{char}</span>;
        const value = readings[lineIndex]?.[syllable++];
        const ruby = <ruby>{char}{showPinyin && value && <rt className="select-none">{value}</rt>}</ruby>;
        if (imported) return <span key={index} className="inline-block min-w-[1.45em]">{ruby}</span>;
        return <Link href={`/dictionary/?q=${encodeURIComponent(char)}`} key={index} className="inline-block min-w-[1.45em] rounded-sm transition-colors hover:bg-accent hover:text-accent-foreground" title={`查询“${char}”的释义`}>{ruby}</Link>;
      })}</p>;
    })}
  </div>;
}
