"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, BookOpen, ArrowUpRight, PenLine } from "lucide-react";
import { toast } from "sonner";
import { type Poem, poemText } from "@/data/poems";
import { isChinese } from "@/lib/utils";
import { usePoetryFavorites } from "@/lib/poetryFavorites";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ReadAloudButton } from "@/components/learning/ReadAloudButton";
import { HaitangNotes } from "./HaitangNotes";
import { PoemWorksheetAction } from "./PoemWorksheetAction";
import { poetryText } from "@/lib/poetryCatalog";
import { PoemVerses } from "./PoemVerses";
import { usePoemPinyin } from "./usePoemPinyin";
import { usePoetryPinyinPreference } from "@/lib/poetryPinyinPreference";
import { RecitationPractice } from "./RecitationPractice";

export function PoemReader({ poem, standalone = false }: { poem: Poem; standalone?: boolean }) {
  const [showPinyin, setShowPinyin] = usePoetryPinyinPreference(!poem.haitang);
  const annotation = usePoemPinyin(poem, showPinyin);
  const [practice, setPractice] = useState(false);
  const { favorites, toggle } = usePoetryFavorites();
  const saved = favorites.includes(poem.slug);
  const Heading = standalone ? "h1" : "h2";
  const text = poemText(poem);
  const practicePoem = { ...poem, lines: poem.lines.filter(line => Array.from(line.text).some(isChinese)) };
  const canPractice = practicePoem.lines.length > 0 && practicePoem.lines.every(line => Array.from(line.text).filter(isChinese).length <= 80) && practicePoem.lines.length <= 120;

  return <article className="study-panel flex min-w-0 flex-col gap-5 p-5 sm:p-8" aria-label={`${poem.title}原文与注释`}>
    <div className="relative flex flex-col items-center gap-2 pt-10 text-center sm:pt-2">
      <Button variant="ghost" className="absolute right-0 top-0" aria-pressed={saved} onClick={() => { const persisted = toggle(poem.slug); toast[persisted ? "success" : "warning"](persisted ? saved ? "已取消收藏" : "已收藏到当前浏览器" : "浏览器存储不可用，收藏仅在本次访问中保留。"); }}><Bookmark aria-hidden="true" className={saved ? "fill-primary text-primary" : ""} />{saved ? "已收藏" : "收藏"}</Button>
      <Heading className="reading-title max-w-[80%] text-balance">{poem.title}</Heading><p className="text-muted-foreground">{poem.dynasty} · {poem.author}</p>
    </div>
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2"><div className="flex min-h-11 items-center gap-3"><Label htmlFor={`poem-pinyin-${poem.slug}`}>显示拼音</Label><Switch id={`poem-pinyin-${poem.slug}`} checked={showPinyin} onCheckedChange={setShowPinyin} /></div><div className="flex flex-wrap gap-2"><ReadAloudButton text={text} /><Button variant="outline" disabled={!canPractice} title={canPractice ? undefined : "本篇段落较长，暂不支持逐句默写"} onClick={() => setPractice(true)}><BookOpen aria-hidden="true" />背诵练习</Button></div></div>
    {poem.haitang?.foreword && <p className="whitespace-pre-wrap break-words text-sm leading-8 text-muted-foreground">{poetryText(poem.haitang.foreword)}</p>}
    {poem.haitang && <p className="text-xs leading-6 text-muted-foreground">自动注音，部分多音字待校对；标注本调，不合并儿化音。{annotation.status === "ready" && annotation.entry.missing > 0 && ` 本篇有 ${annotation.entry.missing} 个字暂缺读音，保留原字显示。`}</p>}
    {poem.haitang && showPinyin && annotation.status === "loading" && <p role="status" className="text-sm text-muted-foreground">正在加载拼音，原文仍可阅读…</p>}
    {poem.haitang && showPinyin && annotation.status === "error" && <div role="status" className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">拼音暂时无法加载，原文仍可阅读。<Button variant="outline" onClick={annotation.retry}>重试拼音</Button></div>}
    <PoemVerses poem={poem} readings={poem.haitang ? annotation.entry?.lines ?? [] : poem.lines.map(line => line.pinyin)} showPinyin={showPinyin && (!poem.haitang || annotation.status === "ready")} />
    <Separator />
    {poem.haitang ? <HaitangNotes work={poem.haitang} /> : <section className="flex flex-col gap-3"><h3 className="section-title">诗意与注释</h3><p className="body-copy">{poem.translation}</p><dl className="flex flex-col gap-2 text-sm leading-7">{poem.notes.map(note => <div key={note.word}><dt className="inline font-semibold">{note.word}：</dt><dd className="inline text-muted-foreground">{note.meaning}</dd></div>)}</dl></section>}
    <div className="flex flex-wrap items-center justify-center gap-3"><PoemWorksheetAction text={text} /><Button variant="ghost" asChild><Link href={`/stroke/?char=${encodeURIComponent(Array.from(text).find(isChinese) || "学")}`}><PenLine aria-hidden="true" />查看汉字笔顺</Link></Button>{!standalone && <Button variant="ghost" asChild><Link href={poem.haitang ? `/poetry/?poem=${poem.slug}` : `/poetry/${poem.slug}/`}>{poem.haitang ? "打开作品链接" : "独立阅读"}<ArrowUpRight aria-hidden="true" /></Link></Button>}</div>
    <p className="text-center text-xs leading-6 text-muted-foreground">{poem.haitang ? "可通过“打开作品链接”分享这篇作品。" : <>注音标本调，朗读中可能有变调；点击诗中的汉字可查字典。<br />原文采用常见简体版本，译文与注释为学习提示。</>}{!canPractice && <><br />本篇段落较长，暂不支持逐句默写，可选段生成字帖。</>}</p>
    {practice && <RecitationPractice poem={practicePoem} onClose={() => setPractice(false)} />}
  </article>;
}
