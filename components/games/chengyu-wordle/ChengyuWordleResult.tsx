"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleAlert, Share2 } from "lucide-react";
import { GameStars } from "@/components/games/GameStars";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CHENGYU_WORDLE_SOURCE_NOTE, chengyuWordleMistakes, getChengyuWordleStars, shareChengyuWordle, type ChengyuWordleState } from "@/lib/chengyuWordle";

export function ChengyuWordleResult({ state, streak, persisted }: {
  state: ChengyuWordleState;
  streak: number;
  persisted: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const share = shareChengyuWordle(state);
  const stars = getChengyuWordleStars(state);

  async function copy() {
    try {
      await navigator.clipboard.writeText(share);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section aria-labelledby="chengyu-wordle-result-title" className="mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-4">
      <div className="study-panel flex flex-col gap-3 p-4 sm:p-6">
        <h2 id="chengyu-wordle-result-title" tabIndex={-1} className="section-title">{state.won ? `猜对了：${state.answer.word}` : `答案是${state.answer.word}`}</h2>
        <p className="font-serif text-lg">{state.answer.pinyin}</p>
        <p>{state.answer.explanation}</p>
        <div className="flex flex-wrap items-center gap-3">
          <GameStars stars={stars} />
          <p className="text-sm text-muted-foreground">猜错 {chengyuWordleMistakes(state)} 次，提示 {state.hints} 次。{state.practice ? "练习不计入连续天数。" : `连续答对 ${streak} 天。`}</p>
        </div>
        <Button asChild variant="outline"><Link href={`/dictionary/?q=${encodeURIComponent(state.answer.word)}`}>在字典中查看</Link></Button>
        <p className="text-sm text-muted-foreground">{CHENGYU_WORDLE_SOURCE_NOTE}</p>
        {!persisted && !state.practice && (
          <Alert>
            <CircleAlert aria-hidden="true" />
            <AlertTitle>成绩未能保存</AlertTitle>
            <AlertDescription>当前浏览器不允许本地存储，本次成绩只保留到关闭页面为止。</AlertDescription>
          </Alert>
        )}
      </div>
      <div className="study-panel flex flex-col gap-3 p-4 sm:p-6">
        <h3 className="font-semibold">分享今天的格子</h3>
        <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-6">{share}</pre>
        <Button type="button" variant="outline" onClick={() => void copy()}>
          <Share2 data-icon="inline-start" aria-hidden="true" />
          {copied ? "已复制" : "复制分享文字"}
        </Button>
        <p className="text-sm text-muted-foreground">分享里只有日期、次数和格子，没有成语本身。</p>
      </div>
    </section>
  );
}
