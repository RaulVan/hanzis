"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { ArrowLeft, CircleAlert, RotateCcw, Trophy } from "lucide-react";
import { feihuaTierLabels } from "@/components/games/feihua/FeihuaKeySelect";
import { GameStars } from "@/components/games/GameStars";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { feihuaWorkHref, type FeihuaAnswer } from "@/lib/feihua";
import type { FeihuaTier } from "@/lib/feihuaTypes";

function Verse({ text, keyChar }: { text: string; keyChar: string }) {
  return <>{[...text].map((char, index) => char === keyChar ? <span key={index} className="font-semibold text-primary">{char}</span> : char)}</>;
}

export const FeihuaResult = forwardRef<HTMLHeadingElement, {
  keyChar: string;
  tier: FeihuaTier;
  stars: number;
  mistakes: number;
  answers: readonly FeihuaAnswer[];
  persisted: boolean;
  onReplay: () => void;
  onExit: () => void;
}>(function FeihuaResult({ keyChar, tier, stars, mistakes, answers, persisted, onReplay, onExit }, headingRef) {
  return (
    <section aria-labelledby="feihua-result-title" className="mx-auto w-full max-w-3xl min-w-0">
      <Card>
        <CardHeader className="items-center text-center">
          <Trophy aria-hidden="true" />
          <CardTitle id="feihua-result-title" ref={headingRef} tabIndex={-1}>「{keyChar}」字令完成</CardTitle>
          <CardDescription>{feihuaTierLabels[tier]} · {answers.length} 句</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <GameStars stars={stars} className="[&_svg]:size-7" />
            <p className="text-sm text-muted-foreground">错选 {mistakes} 次 · 每错 3 次少一颗星</p>
          </div>
          {!persisted && (
            <Alert>
              <CircleAlert aria-hidden="true" />
              <AlertTitle>成绩未能保存</AlertTitle>
              <AlertDescription>当前浏览器不允许本地存储，本次成绩只保留到关闭页面为止。</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-3">
            <h3 className="section-title">本轮诗句</h3>
            <ol className="flex flex-col divide-y">
              {answers.map(({ line, mistakes: lineMistakes }) => (
                <li key={line.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0 space-y-1">
                    <p className="font-serif text-xl"><Verse text={line.text} keyChar={keyChar} /></p>
                    <p className="text-sm text-muted-foreground">
                      《{line.title}》 {line.author}（{line.dynasty}）
                      {lineMistakes > 0 && <span className="ml-2 text-xs text-accent-foreground">错选 {lineMistakes} 次</span>}
                    </p>
                  </div>
                  <Button asChild variant="link" size="sm" className="self-start px-0 sm:px-3">
                    <Link href={feihuaWorkHref(line)} aria-label={`读全诗《${line.title}》`}>读全诗</Link>
                  </Button>
                </li>
              ))}
            </ol>
            <p className="text-xs text-muted-foreground">诗句取自本站古诗词资料中的课本与选集篇目。</p>
          </div>
        </CardContent>
        <CardFooter className="flex-wrap justify-center gap-3">
          <Button onClick={onReplay}>
            <RotateCcw data-icon="inline-start" aria-hidden="true" />
            再来 8 句
          </Button>
          <Button variant="outline" onClick={onExit}>
            <ArrowLeft data-icon="inline-start" aria-hidden="true" />
            换一个字
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
});
