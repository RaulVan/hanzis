import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Ear, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { initials, finals, wholeSyllables } from "@/data/pinyin";

export const metadata: Metadata = { title: "拼音学习", description: "从声母、韵母、整体认读音节到声调，听本地录音、读例字并完成综合练习。" };

const lessons = [
  { title: "声母", href: "initials", description: "23 个声母，用呼读音入门，再跟着例字读。", examples: initials.map((item) => item.letter).join("  ") },
  { title: "韵母", href: "finals", description: "24 个韵母，学习单韵母、复韵母与鼻韵母。", examples: finals.map((item) => item.letter).join("  ") },
  { title: "整体认读音节", href: "syllables", description: "16 个音节，结合例字直接认读。", examples: wholeSyllables.map((item) => item.syllable).join("  ") },
  { title: "声调", href: "tones", description: "对比四声与轻声，感受同一个音节的变化。", examples: "mā　má　mǎ　mà　ma" },
  { title: "综合练习", href: "practice", description: "听音辨读、看字选拼音，每轮 10 题，即时反馈。", examples: "先听一听，再选一选。" },
];

export default function PinyinPage() {
  return <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {lessons.map((lesson, index) => <Card key={lesson.href} className="min-w-0">
        <CardHeader><div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground"><BookOpen className="size-4" aria-hidden="true" />第 {index + 1} 步</div><CardTitle>{lesson.title}</CardTitle><CardDescription>{lesson.description}</CardDescription></CardHeader>
        <CardContent className="flex-1"><p className="text-lg leading-loose text-muted-foreground">{lesson.examples}</p></CardContent>
        <CardFooter><Button asChild variant={index === 0 ? "default" : "outline"}><Link href={`/pinyin/${lesson.href}/`}>{index === 4 ? "开始练习" : `学习${lesson.title}`}<ArrowRight aria-hidden="true" /></Link></Button></CardFooter>
      </Card>)}
      <Card className="bg-muted">
        <CardHeader><CardTitle className="flex items-center gap-2"><Ear aria-hidden="true" />慢慢听，大声读</CardTitle><CardDescription>不需要账号，随时开始，也可以反复练习。</CardDescription></CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground"><p className="flex items-start gap-2"><Volume2 className="mt-1 size-4 shrink-0" aria-hidden="true" />声母呼读音、韵母、例字优先使用本地录音。</p><p>轻声等没有录音的内容会明确标为系统中文语音，发音因设备而异；需要设备已安装中文语音。</p></CardContent>
        <CardFooter><p className="text-sm">先听清，再跟读，不必急着背完。</p></CardFooter>
      </Card>
    </div>
  </div>;
}
