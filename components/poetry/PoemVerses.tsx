import { memo, useMemo } from "react";
import Link from "next/link";
import type { Poem } from "@/data/poems";
import { cn, isChinese } from "@/lib/utils";

const noReadings: string[] = [];
const PoemVerseLine = memo(function PoemVerseLine({ text, readings, imported, showPinyin, readUntil }: { text: string; readings: string[]; imported: boolean; showPinyin: boolean; readUntil: number }) {
  if (!text) return <p className="min-h-[2em]">{"\u00a0"}</p>;
  let syllable = 0, offset = 0;
  return <p className={imported ? "min-h-[2em]" : "text-balance"}>{Array.from(text).map((char, index) => {
    offset += char.length;
    const read = offset <= readUntil;
    const color = read ? "text-primary [&_rt]:text-primary" : undefined;
    if (!isChinese(char)) return <span key={index} data-read={read || undefined} className={color}>{char}</span>;
    const value = readings[syllable++];
    const ruby = <ruby>{char}{showPinyin && value && <rt className="select-none">{value}</rt>}</ruby>;
    // Native links avoid thousands of Next Link prefetch observers in long imported works.
    if (imported) return <a href={`/dictionary/?q=${encodeURIComponent(char)}`} key={index} data-read={read || undefined} className={cn("rounded-sm hover:bg-accent hover:text-accent-foreground", showPinyin && "inline-block min-w-[1.45em]", color)} title={`查询“${char}”的释义`}>{showPinyin ? ruby : char}</a>;
    return <Link href={`/dictionary/?q=${encodeURIComponent(char)}`} key={index} data-read={read || undefined} className={cn("inline-block min-w-[1.45em] rounded-sm transition-colors hover:bg-accent hover:text-accent-foreground", color)} title={`查询“${char}”的释义`}>{ruby}</Link>;
  })}</p>;
});

export function PoemVerses({ poem, readings, showPinyin, readUntil = 0 }: { poem: Poem; readings: string[][]; showPinyin: boolean; readUntil?: number }) {
  const imported = Boolean(poem.haitang);
  const lines = useMemo(() => {
    let start = 0;
    const result: { text: string; start: number }[] = [];
    for (const line of poem.lines) { result.push({ text: line.text, start }); start += line.text.length + 1; }
    return result;
  }, [poem.lines]);
  return <div className={cn("poem-verses flex flex-col py-2 font-serif", imported ? "whitespace-pre-wrap break-words text-xl leading-[2]" : "gap-2 text-center text-[clamp(1.25rem,2.3vw,2rem)] leading-[1.9]")} style={imported ? { textAlign: poem.haitang!.layout === "center" ? "center" : "left" } : undefined}>
    {lines.map((line, index) => <PoemVerseLine key={index} text={line.text} imported={imported} showPinyin={showPinyin} readings={readings[index] ?? noReadings} readUntil={Math.max(0, Math.min(line.text.length, readUntil - line.start))} />)}
  </div>;
}
