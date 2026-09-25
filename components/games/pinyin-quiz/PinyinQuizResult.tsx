"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { CircleAlert, RotateCcw, Settings2, Trophy } from "lucide-react";
import { durationLabel, modeLabels, toneModeLabels } from "@/components/games/pinyin-quiz/PinyinQuizSetup";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { PinyinQuizAnswer } from "@/lib/pinyinQuiz";
import type { PinyinQuizSettings } from "@/lib/pinyinQuizProgress";

export const PinyinQuizResult = forwardRef<HTMLHeadingElement, {
  settings: PinyinQuizSettings;
  score: number;
  bestStreak: number;
  answered: number;
  review: readonly PinyinQuizAnswer[];
  newRecord: boolean;
  persisted: boolean;
  onReplay: () => void;
  onSettings: () => void;
}>(function PinyinQuizResult({ settings, score, bestStreak, answered, review, newRecord, persisted, onReplay, onSettings }, headingRef) {
  return (
    <section aria-labelledby="pinyin-quiz-result-title" className="mx-auto w-full max-w-3xl min-w-0">
      <Card>
        <CardHeader className="items-center text-center">
          <Trophy aria-hidden="true" />
          <CardTitle id="pinyin-quiz-result-title" ref={headingRef} tabIndex={-1}>本轮结束</CardTitle>
          <CardDescription>{modeLabels[settings.mode]} · {toneModeLabels[settings.toneMode]} · {durationLabel(settings.duration)}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="font-serif text-6xl leading-none">{score}<span className="text-2xl text-muted-foreground"> 题答对</span></p>
            <p className="text-sm text-muted-foreground">共作答 {answered} 题 · 最长连对 {bestStreak} 题{newRecord ? " · 新纪录" : ""}</p>
          </div>
          {!persisted && (
            <Alert>
              <CircleAlert aria-hidden="true" />
              <AlertTitle>成绩未能保存</AlertTitle>
              <AlertDescription>当前浏览器不允许本地存储，本次成绩只保留到关闭页面为止。</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-3">
            <h3 className="section-title">再看一遍</h3>
            {review.length === 0 ? (
              <p className="text-sm text-muted-foreground">{answered === 0 ? "这一轮还没有作答。" : "没有答错或跳过的题，全部一次答对。"}</p>
            ) : (
              <ol className="flex flex-col divide-y">
                {review.map(({ item, outcome, wrongAttempts }) => (
                  <li key={item.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0 space-y-1">
                      <p className="flex flex-wrap items-baseline gap-2">
                        <span className="font-serif text-xl">{item.text}</span>
                        <span className="text-base">{item.pinyin}</span>
                        <span className="text-xs text-accent-foreground">{outcome === "skipped" ? "已跳过" : `答错 ${wrongAttempts} 次后答对`}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">{item.meaning ?? `例：${item.word}`}</p>
                    </div>
                    <Button asChild variant="link" size="sm" className="self-start px-0 sm:px-3">
                      <Link href={`/dictionary/?q=${encodeURIComponent(item.text)}`} aria-label={`在字典中查看「${item.text}」`}>查字典</Link>
                    </Button>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex-wrap justify-center gap-3">
          <Button onClick={onReplay}>
            <RotateCcw data-icon="inline-start" aria-hidden="true" />
            再来一轮
          </Button>
          <Button variant="outline" onClick={onSettings}>
            <Settings2 data-icon="inline-start" aria-hidden="true" />
            调整设置
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
});
