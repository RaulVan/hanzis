"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Lightbulb, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { Spinner } from "@/components/ui/spinner";
import { usePronunciation } from "@/hooks/usePronunciation";
import { getPinyinAudioSource } from "@/lib/pinyinAudio";
import { pinyinLessons, type PinyinLessonKind } from "@/lib/pinyinLearning";
import { PinyinCard } from "./PinyinCard";
import { AudioFeedback } from "./AudioFeedback";

export function PinyinLearning({ kind }: { kind: PinyinLessonKind }) {
  const lesson = pinyinLessons[kind];
  const [selectedLetter, setSelectedLetter] = useState(lesson.items[0].letter);
  const [category, setCategory] = useState("全部");
  const audio = usePronunciation();
  const selected = lesson.items.find((item) => item.letter === selectedLetter) ?? lesson.items[0];
  const categories = [...new Set(lesson.items.map((item) => item.category))];
  const visible = lesson.items.filter((item) => category === "全部" || item.category === category);

  function select(letter: string) {
    const item = lesson.items.find((item) => item.letter === letter);
    if (!item) return;
    setSelectedLetter(letter);
    void audio.play(`letter:${letter}`, [{ pinyin: item.pinyin, char: item.name }]);
  }

  return <div className="space-y-6">
    <div className="grid min-w-0 items-stretch gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
      <Card className="min-w-0">
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><CardTitle>{lesson.title}</CardTitle><CardDescription className="mt-2">{lesson.items.length} 个{lesson.noun}，点击开始学习。</CardDescription></div>
            <Field className="w-auto gap-1">
              <FieldLabel htmlFor="pinyin-category" className="sr-only">{lesson.noun}分类</FieldLabel>
              <Select value={category} onValueChange={(value) => { setCategory(value); audio.stop(); }}>
                <SelectTrigger id="pinyin-category" className="max-w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="全部">全部分类</SelectItem>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
        </CardHeader>
        <CardContent>
          <ToggleGroup type="single" variant="outline" spacing={3} value={selectedLetter} onValueChange={select}
            aria-label={`选择${lesson.noun}`} className="grid w-full grid-cols-3 gap-3 sm:grid-cols-6">
            {visible.map((item) => <PinyinCard key={item.letter} letter={item.letter} />)}
          </ToggleGroup>
        </CardContent>
        <CardFooter><p className="text-sm text-muted-foreground">{lesson.note}</p></CardFooter>
      </Card>

      <Card className="min-w-0">
        <CardHeader className="text-center">
          <CardTitle className="sr-only">{lesson.noun} {selected.letter} 的发音与例字</CardTitle>
          <div className="font-serif text-7xl leading-tight" aria-hidden="true">{selected.letter}</div>
          <CardDescription className="text-xl text-foreground">{kind === "initials" ? "呼读音 " : ""}{selected.pinyin}</CardDescription>
          <p className="text-sm text-accent-foreground">{selected.category}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" onClick={() => void audio.play(`letter:${selected.letter}`, [{ pinyin: selected.pinyin, char: selected.name }])}>
            {audio.activeKey === `letter:${selected.letter}` ? <Spinner /> : <Volume2 aria-hidden="true" />}
            {kind === "initials" ? "播放呼读音" : "播放发音"}
          </Button>
          <Separator />
          <h3 className="text-center text-base font-medium">跟着例字读</h3>
          <div className="grid grid-cols-3 gap-2">
            {selected.examples.map((example) => <Button key={example.char} variant="ghost" className="h-auto min-w-0 flex-col gap-1 py-3"
              aria-label={`播放例字 ${example.char} ${example.pinyin}`} onClick={() => void audio.play(`example:${example.char}`, [example])}>
              <span className="font-serif text-4xl font-normal">{example.char}</span>
              <span className="text-sm font-normal text-muted-foreground">{example.pinyin}</span>
              {audio.activeKey === `example:${example.char}` ? <Spinner /> : <Volume2 className="mt-1 size-4" aria-hidden="true" />}
            </Button>)}
          </div>
          <Button className="w-full" onClick={() => void audio.play("examples", selected.examples)}><Volume2 aria-hidden="true" />朗读例字</Button>
          <AudioFeedback {...audio} />
          <p className="text-center text-xs text-muted-foreground">{getPinyinAudioSource(selected.pinyin)} · 没听清时，可以再听一次。</p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button asChild variant="link" size="sm"><Link href={`/?text=${encodeURIComponent(selected.examples.map((item) => item.char).join(""))}`}>用这些例字生成字帖<ArrowRight aria-hidden="true" /></Link></Button>
        </CardFooter>
      </Card>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-muted p-5">
      <p className="flex items-center gap-3 text-sm"><Lightbulb className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />先听例字，再试着拼读。每次学习一点点。</p>
      <Button asChild variant="ghost"><Link href={lesson.next.href}>{lesson.next.label}<ArrowRight aria-hidden="true" /></Link></Button>
    </div>
  </div>;
}
