"use client";
import { UiText } from "@/components/i18n/UiText";
import { useTranslate } from "@/components/i18n/LanguageProvider";

import Link from "next/link";
import { forwardRef } from "react";
import { ArrowRight, CircleAlert, RotateCcw, Trophy } from "lucide-react";
import { GameStars } from "@/components/games/GameStars";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { difficultyLabels, hanziMatchContentSource, type HanziMatchLevel } from "@/data/hanziMatchLevels";
import type { HanziMatchCompletion } from "@/lib/hanziMatchProgress";

export const HanziMatchResult = forwardRef<HTMLHeadingElement, {
  level: HanziMatchLevel;
  completion: HanziMatchCompletion;
  persisted: boolean;
  nextLevel?: HanziMatchLevel;
  onNext: () => void;
  onReplay: () => void;
  onExit: () => void;
}>(function HanziMatchResult({ level, completion, persisted, nextLevel, onNext, onReplay, onExit }, headingRef) {
  const t = useTranslate();
  return (
    <section aria-labelledby="hanzi-match-result-title" className="mx-auto w-full max-w-3xl min-w-0">
      <Card>
        <CardHeader className="items-center text-center">
          <Trophy aria-hidden="true" />
          <CardTitle id="hanzi-match-result-title" ref={headingRef} tabIndex={-1}><UiText text="第 {0} 关完成" values={[level.number]} /></CardTitle>
          <CardDescription>{difficultyLabels[level.difficulty]} · {level.theme}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <GameStars stars={completion.stars} className="[&_svg]:size-7" />
            <p className="text-sm text-muted-foreground"><UiText text="失误 {0} 次 · 提示 {1} 次" values={[completion.mistakes, completion.hints]} /></p>
          </div>
          {!persisted && (
            <Alert>
              <CircleAlert aria-hidden="true" />
              <AlertTitle><UiText text="进度未能保存" /></AlertTitle>
              <AlertDescription><UiText text="当前浏览器不允许本地存储，本次成绩只保留到关闭页面为止。" /></AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-3">
            <h3 className="section-title"><UiText text="本关词语" /></h3>
            <ol className="flex flex-col divide-y">
              {level.words.map(word => (
                <li key={word.word} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0 space-y-1">
                    <p className="flex flex-wrap items-baseline gap-2">
                      <span className="font-serif text-xl">{word.word}</span>
                      <span className="text-sm text-muted-foreground">{word.pinyin}</span>
                      {completion.review.includes(word.word) && <span className="text-xs text-accent-foreground"><UiText text="待复习" /></span>}
                    </p>
                    <p className="text-sm">{word.meaning}</p>
                    <p className="text-sm text-muted-foreground"><UiText text="例：{0}" values={[word.example]} /></p>
                  </div>
                  <Button asChild variant="link" size="sm" className="self-start px-0 sm:px-3">
                    <Link href={`/dictionary/?q=${encodeURIComponent(word.word)}`} aria-label={t("在字典中查看「{0}」", [word.word])}><UiText text="查字典" /></Link>
                  </Button>
                </li>
              ))}
            </ol>
            <p className="text-xs text-muted-foreground"><UiText>{hanziMatchContentSource.note}</UiText></p>
          </div>
        </CardContent>
        <CardFooter className="flex-wrap justify-center gap-3">
          {nextLevel && (
            <Button onClick={onNext}>
              <UiText text="下一关：{0}" values={[nextLevel.theme]} /><ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          )}
          <Button variant="outline" onClick={onReplay}>
            <RotateCcw data-icon="inline-start" aria-hidden="true" />
            <UiText text="再玩一次" /></Button>
          <Button variant="ghost" onClick={onExit}><UiText text="返回选关" /></Button>
        </CardFooter>
      </Card>
    </section>
  );
});
