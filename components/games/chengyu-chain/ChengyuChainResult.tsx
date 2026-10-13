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
import { CHENGYU_CHAIN_SOURCE } from "@/data/chengyuChains";
import { chengyuDifficultyLabels } from "@/components/games/chengyu-chain/ChengyuChainSelect";
import type { ChengyuChainState } from "@/lib/chengyuChain";

export const ChengyuChainResult = forwardRef<HTMLHeadingElement, {
  state: ChengyuChainState;
  stars: number;
  persisted: boolean;
  onReplay: () => void;
  onExit: () => void;
}>(function ChengyuChainResult({ state, stars, persisted, onReplay, onExit }, headingRef) {
  const t = useTranslate();
  const title = state.chain.idioms[0].text;
  return (
    <section aria-labelledby="chengyu-chain-result-title" className="mx-auto w-full max-w-3xl min-w-0">
      <Card>
        <CardHeader className="items-center text-center">
          <Trophy aria-hidden="true" />
          <CardTitle id="chengyu-chain-result-title" ref={headingRef} tabIndex={-1}><UiText text="「{0}」接完了" values={[title]} /></CardTitle>
          <CardDescription><UiText text="{0} · {1} 个成语" values={[chengyuDifficultyLabels[state.chain.difficulty], state.chain.idioms.length]} /></CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <GameStars stars={stars} className="[&_svg]:size-7" />
            <p className="text-sm text-muted-foreground"><UiText text="接错 {0} 次，提示 {1} 次。每用 1 次提示、每错 3 次，少一颗星。" values={[state.mistakes, state.hints]} /></p>
          </div>
          {!persisted && (
            <Alert>
              <CircleAlert aria-hidden="true" />
              <AlertTitle><UiText text="成绩未能保存" /></AlertTitle>
              <AlertDescription><UiText text="当前浏览器不允许本地存储，本次成绩只保留到关闭页面为止。" /></AlertDescription>
            </Alert>
          )}
          <ol className="flex flex-col divide-y">
            {state.chain.idioms.map(idiom => (
              <li key={idiom.text} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0 space-y-1">
                  <p className="font-serif text-xl">{idiom.text}</p>
                  <p className="text-sm text-muted-foreground">{idiom.meaning}</p>
                  <p className="text-sm text-muted-foreground">{idiom.example}</p>
                </div>
                <Button asChild variant="link" size="sm" className="self-start px-0 sm:px-3">
                  <Link href={`/dictionary/?q=${encodeURIComponent(idiom.text)}`} aria-label={t("在字典中查看「{0}」", [idiom.text])}><UiText text="查字典" /></Link>
                </Button>
              </li>
            ))}
          </ol>
          <p className="text-xs text-muted-foreground"><UiText text="成语、释义和例句由{0}，尚未完成人工审校。" values={[CHENGYU_CHAIN_SOURCE]} /></p>
        </CardContent>
        <CardFooter className="flex-wrap justify-center gap-3">
          <Button onClick={onReplay}>
            <RotateCcw data-icon="inline-start" aria-hidden="true" />
            <UiText text="再接一次" /></Button>
          <Button variant="outline" onClick={onExit}>
            <ArrowLeft data-icon="inline-start" aria-hidden="true" />
            <UiText text="换一条" /></Button>
        </CardFooter>
      </Card>
    </section>
  );
});
