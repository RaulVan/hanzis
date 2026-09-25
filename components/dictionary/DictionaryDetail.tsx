"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Grid2X2, PenLine } from "lucide-react";
import { getDictionaryEntry, type DictionaryEntry } from "@/lib/dictionaryData";
import { getUniqueCharacters } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ReadAloudButton } from "@/components/learning/ReadAloudButton";
import { RevisedDefinition } from "./RevisedDefinition";
import { XinhuaDefinition } from "./XinhuaDefinition";
import { MoeDefinition } from "./MoeDefinition";
import { DictionaryPreview } from "./DictionaryPreview";

export function DictionaryDetail({ term, preview = false }: { term: string; preview?: boolean }) {
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => { let active = true; getDictionaryEntry(term).then(value => { if (active) { setEntry(value); setError(null); } }).catch(() => { if (active) setError("释义数据暂时无法读取，请检查连接后重试。"); }); return () => { active = false; }; }, [term, revision]);
  if (error) return <Alert variant="destructive"><AlertDescription>{error}<Button variant="outline" onClick={() => { setError(null); setRevision(value => value + 1); }}>重新加载</Button></AlertDescription></Alert>;
  if (!entry) return <div className="study-panel flex flex-col gap-5 p-8" role="status" aria-label="正在加载释义"><Skeleton className="size-28" /><Skeleton className="h-9 w-2/3" /><Skeleton className="h-64 w-full" /></div>;
  if (preview) return <DictionaryPreview entry={entry} onRetry={() => { setEntry(null); setRevision(value => value + 1); }} />;
  const info = entry.character;
  const characters = getUniqueCharacters(term);
  return <article className="study-panel flex min-w-0 flex-col gap-6 p-5 sm:p-8" aria-label={`${term}的释义`}>
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">{info && <div className="relative flex size-32 shrink-0 items-center justify-center border border-border bg-background"><svg className="absolute inset-0 size-full text-border" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 0V100M0 50H100" stroke="currentColor" strokeDasharray="3 3" fill="none" /></svg><span className="relative font-serif text-7xl">{term}</span></div>}<div className="flex min-w-0 flex-1 flex-col gap-3"><h2 className="reading-title break-words">{term}</h2><p className="break-words text-xl text-primary">{entry.spelling.filter(Boolean).join(" ") || "暂未收录读音"}</p>{info && <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm"><div><dt className="inline text-muted-foreground">部首 </dt><dd className="inline font-medium">{info.radical || "暂未收录"}</dd></div><div><dt className="inline text-muted-foreground">笔画 </dt><dd className="inline font-medium">{info.strokeCount ? `${info.strokeCount} 画` : "暂未收录"}</dd></div><div><dt className="inline text-muted-foreground">结构 </dt><dd className="inline font-medium">{info.struct || "暂未收录"}</dd></div></dl>}<p className="text-xs leading-6 text-muted-foreground">上方为查询字形的基础信息；自动注音供参考，多音字请结合下方释义区分。</p></div></div>
    <div className="flex flex-wrap gap-3"><ReadAloudButton text={term} label="朗读字词" /><Button asChild><Link href={`/?text=${encodeURIComponent(term)}`}><Grid2X2 aria-hidden="true" />生成字帖</Link></Button>{characters.length === 1 && <Button variant="outline" asChild><Link href={`/stroke/?char=${encodeURIComponent(term)}`}><PenLine aria-hidden="true" />练习笔顺</Link></Button>}</div>
    <Separator />
    {entry.unavailableSources.length > 0 && <Alert><AlertDescription>{entry.unavailableSources.join("、")}暂时无法读取，以下仅显示已加载的资料。<Button variant="outline" onClick={() => { setEntry(null); setRevision(value => value + 1); }}>重试缺失释义</Button></AlertDescription></Alert>}
    {entry.moe.length > 0 && <MoeDefinition entries={entry.moe} />}
    {entry.revised.length > 0 && <RevisedDefinition entries={entry.revised} expanded={!entry.moe.length} />}
    {entry.xinhua.length > 0 && <XinhuaDefinition entries={entry.xinhua} expanded={!entry.moe.length && !entry.revised.length} />}
    {entry.openDefinition && <details open={!entry.moe.length && !entry.revised.length && !entry.xinhua.length} className="rounded-lg border border-border"><summary className="min-h-11 cursor-pointer px-5 py-4 font-semibold">开放词库释义{entry.moe.length ? "（补充）" : ""}</summary><div className="flex flex-col gap-3 border-t border-border px-5 py-4"><p className="whitespace-pre-wrap break-words leading-8">{entry.openDefinition}</p><p className="text-xs leading-6 text-muted-foreground">来源：cnchar-data 1.1.0，MIT。词库含历史用法，部分释义可能较旧；用于学习参考。</p></div></details>}
    {!entry.moe.length && !entry.revised.length && !entry.xinhua.length && !entry.openDefinition && !entry.unavailableSources.length && <Alert><AlertDescription>当前词库还没有这个字词的释义。你仍可查看已有字形资料，或换一个常用词查询。</AlertDescription></Alert>}
    {characters.length > 1 && <section className="flex flex-col gap-3"><h3 className="section-title">一个字一个字地学</h3><div className="flex flex-wrap gap-2">{characters.map(char => <Button key={char} variant="outline" asChild><Link href={`/dictionary/?q=${encodeURIComponent(char)}`}>{char}<ArrowUpRight aria-hidden="true" /></Link></Button>)}</div></section>}
  </article>;
}
