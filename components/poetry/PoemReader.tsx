"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, BookOpen, Grid2X2, ArrowUpRight, PenLine } from "lucide-react";
import { toast } from "sonner";
import { type Poem, poemText } from "@/data/poems";
import { isChinese } from "@/lib/utils";
import { usePoetryFavorites } from "@/lib/poetryFavorites";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ReadAloudButton } from "@/components/learning/ReadAloudButton";
import { RecitationPractice } from "./RecitationPractice";

export function PoemReader({ poem, standalone = false }: { poem: Poem; standalone?: boolean }) {
  const [showPinyin, setShowPinyin] = useState(true);
  const [practice, setPractice] = useState(false);
  const { favorites, toggle } = usePoetryFavorites();
  const saved = favorites.includes(poem.slug);
  const Heading = standalone ? "h1" : "h2";
  const text = poemText(poem);

  return <article className="study-panel flex min-w-0 flex-col gap-5 p-5 sm:p-8" aria-label={`${poem.title}原文与注释`}>
    <div className="relative flex flex-col items-center gap-2 pt-10 text-center sm:pt-2">
      <Button variant="ghost" className="absolute right-0 top-0" aria-pressed={saved} onClick={() => { const persisted = toggle(poem.slug); toast[persisted ? "success" : "warning"](persisted ? saved ? "已取消收藏" : "已收藏到当前浏览器" : "浏览器存储不可用，收藏仅在本次访问中保留。"); }}><Bookmark aria-hidden="true" className={saved ? "fill-primary text-primary" : ""} />{saved ? "已收藏" : "收藏"}</Button>
      <Heading className="reading-title max-w-[80%] text-balance">{poem.title}</Heading><p className="text-muted-foreground">{poem.dynasty} · {poem.author}</p>
    </div>
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2"><div className="flex min-h-11 items-center gap-3"><Label htmlFor={`poem-pinyin-${poem.slug}`}>显示拼音</Label><Switch id={`poem-pinyin-${poem.slug}`} checked={showPinyin} onCheckedChange={setShowPinyin} /></div><div className="flex flex-wrap gap-2"><ReadAloudButton text={text} /><Button variant="outline" onClick={() => setPractice(true)}><BookOpen aria-hidden="true" />背诵练习</Button></div></div>
    <div className="poem-verses flex flex-col gap-2 py-2 text-center font-serif text-[clamp(1.25rem,2.3vw,2rem)] leading-[1.9]">
      {poem.lines.map((line, lineIndex) => { let syllable = 0; return <p key={lineIndex} className="text-balance">{Array.from(line.text).map((char, index) => {
        if (!isChinese(char)) return <span key={index}>{char}</span>;
        const pinyin = line.pinyin[syllable++];
        return <Link href={`/dictionary/?q=${encodeURIComponent(char)}`} key={index} className="inline-block min-w-[1.45em] rounded-sm transition-colors hover:bg-accent hover:text-accent-foreground" title={`查询“${char}”的释义`}><ruby>{char}{showPinyin && <rt className="select-none">{pinyin}</rt>}</ruby></Link>;
      })}</p>; })}
    </div>
    <Separator />
    <section className="flex flex-col gap-3"><h3 className="section-title">诗意与注释</h3><p className="body-copy">{poem.translation}</p><dl className="flex flex-col gap-2 text-sm leading-7">{poem.notes.map(note => <div key={note.word}><dt className="inline font-semibold">{note.word}：</dt><dd className="inline text-muted-foreground">{note.meaning}</dd></div>)}</dl></section>
    <div className="flex flex-wrap items-center justify-center gap-3"><Button asChild><Link href={`/?text=${encodeURIComponent(text)}`}><Grid2X2 aria-hidden="true" />生成诗词字帖</Link></Button><Button variant="ghost" asChild><Link href={`/stroke/?char=${encodeURIComponent(Array.from(poem.lines[0].text)[0])}`}><PenLine aria-hidden="true" />查看汉字笔顺</Link></Button>{!standalone && <Button variant="ghost" asChild><Link href={`/poetry/${poem.slug}/`}>独立阅读<ArrowUpRight aria-hidden="true" /></Link></Button>}</div>
    <p className="text-center text-xs leading-6 text-muted-foreground">注音标本调，朗读中可能有变调；点击诗中的汉字可查字典。<br />原文采用常见简体版本，译文与注释为学习提示。</p>
    {practice && <RecitationPractice poem={poem} onClose={() => setPractice(false)} />}
  </article>;
}
