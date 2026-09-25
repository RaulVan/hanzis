"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { ArrowRight, CircleAlert, RotateCcw, Trophy } from "lucide-react";
import { HanziMatchStars } from "@/components/games/hanzi-match/HanziMatchStars";
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
  return (
    <section aria-labelledby="hanzi-match-result-title" className="mx-auto w-full max-w-3xl min-w-0">
      <Card>
        <CardHeader className="items-center text-center">
          <Trophy aria-hidden="true" />
          <CardTitle id="hanzi-match-result-title" ref={headingRef} tabIndex={-1}>第 {level.number} 关完成</CardTitle>
          <CardDescription>{difficultyLabels[level.difficulty]} · {level.theme}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <HanziMatchStars stars={completion.stars} className="[&_svg]:size-7" />
            <p className="text-sm text-muted-foreground">失误 {completion.mistakes} 次 · 提示 {completion.hints} 次</p>
          </div>
          {!persisted && (
            <Alert>
              <CircleAlert aria-hidden="true" />
              <AlertTitle>进度未能保存</AlertTitle>
              <AlertDescription>当前浏览器不允许本地存储，本次成绩只保留到关闭页面为止。</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-3">
            <h3 className="section-title">本关词语</h3>
            <ol className="flex flex-col divide-y">
              {level.words.map(word => (
                <li key={word.word} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0 space-y-1">
                    <p className="flex flex-wrap items-baseline gap-2">
                      <span className="font-serif text-xl">{word.word}</span>
                      <span className="text-sm text-muted-foreground">{word.pinyin}</span>
                      {completion.review.includes(word.word) && <span className="text-xs text-accent-foreground">待复习</span>}
                    </p>
                    <p className="text-sm">{word.meaning}</p>
                    <p className="text-sm text-muted-foreground">例：{word.example}</p>
                  </div>
                  <Button asChild variant="link" size="sm" className="self-start px-0 sm:px-3">
                    <Link href={`/dictionary/?q=${encodeURIComponent(word.word)}`} aria-label={`在字典中查看「${word.word}」`}>查字典</Link>
                  </Button>
                </li>
              ))}
            </ol>
            <p className="text-xs text-muted-foreground">{hanziMatchContentSource.note}</p>
          </div>
        </CardContent>
        <CardFooter className="flex-wrap justify-center gap-3">
          {nextLevel && (
            <Button onClick={onNext}>
              下一关：{nextLevel.theme}
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          )}
          <Button variant="outline" onClick={onReplay}>
            <RotateCcw data-icon="inline-start" aria-hidden="true" />
            再玩一次
          </Button>
          <Button variant="ghost" onClick={onExit}>返回选关</Button>
        </CardFooter>
      </Card>
    </section>
  );
});
