"use client";
import { UiText } from "@/components/i18n/UiText";
import { useTranslate } from "@/components/i18n/LanguageProvider";

import Link from "next/link";
import { forwardRef } from "react";
import { ArrowLeft, CircleAlert, RotateCcw, Trophy } from "lucide-react";
import { GameStars } from "@/components/games/GameStars";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { PoemSortLevel } from "@/lib/poemSort";

export const PoemSortResult = forwardRef<HTMLHeadingElement, {
  level: PoemSortLevel;
  stars: number;
  mistakes: number;
  hints: number;
  persisted: boolean;
  onReplay: () => void;
  onExit: () => void;
}>(function PoemSortResult({ level, stars, mistakes, hints, persisted, onReplay, onExit }, headingRef) {
  const t = useTranslate();
  return (
    <section aria-labelledby="poem-sort-result-title" className="mx-auto w-full max-w-3xl min-w-0">
      <Card>
        <CardHeader className="items-center text-center">
          <Trophy aria-hidden="true" />
          <CardTitle id="poem-sort-result-title" ref={headingRef} tabIndex={-1}><UiText text="《{0}》排好了" values={[level.title]} /></CardTitle>
          <CardDescription>{level.dynasty} · {level.author}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <GameStars stars={stars} className="[&_svg]:size-7" />
            <p className="text-sm text-muted-foreground"><UiText text="点错 {0} 次，提示 {1} 次。每用 1 次提示、每错 3 次，少一颗星。" values={[mistakes, hints]} /></p>
          </div>
          {!persisted && (
            <Alert>
              <CircleAlert aria-hidden="true" />
              <AlertTitle><UiText text="成绩未能保存" /></AlertTitle>
              <AlertDescription><UiText text="当前浏览器不允许本地存储，本次成绩只保留到关闭页面为止。" /></AlertDescription>
            </Alert>
          )}
          <ol className="flex flex-col gap-3">
            {level.lines.map((line, index) => (
              <li key={index}>
                <p className="font-serif text-xl">{line.chars.join("")}</p>
                <p className="text-sm text-muted-foreground">{line.pinyin.join(" ")}</p>
              </li>
            ))}
          </ol>
          <p className="body-copy text-sm">{level.translation}</p>
          {level.notes.length > 0 && (
            <dl className="flex flex-col gap-2 text-sm">
              {level.notes.map(note => (
                <div key={note.word} className="grid grid-cols-[auto_1fr] gap-x-3">
                  <dt className="font-semibold text-foreground">{note.word}</dt>
                  <dd className="text-muted-foreground">{note.meaning}</dd>
                </div>
              ))}
            </dl>
          )}
          <Button asChild variant="outline" className="self-start">
            <Link href={`/poetry/${level.slug}/`} aria-label={t("读全诗《{0}》", [level.title])}><UiText text="读全诗" /></Link>
          </Button>
          <p className="text-xs text-muted-foreground"><UiText text="诗句来自本站校对的古诗词，只收录五言和七言整句。" /></p>
        </CardContent>
        <CardFooter className="flex-wrap justify-center gap-3">
          <Button onClick={onReplay}>
            <RotateCcw data-icon="inline-start" aria-hidden="true" />
            <UiText text="再排一次" /></Button>
          <Button variant="outline" onClick={onExit}>
            <ArrowLeft data-icon="inline-start" aria-hidden="true" />
            <UiText text="换一首诗" /></Button>
        </CardFooter>
      </Card>
    </section>
  );
});
