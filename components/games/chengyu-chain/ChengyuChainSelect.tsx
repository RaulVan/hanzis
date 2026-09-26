"use client";

import { forwardRef } from "react";
import { GameStars } from "@/components/games/GameStars";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { chengyuChains, type ChengyuChain } from "@/data/chengyuChains";
import type { ChengyuChainProgress } from "@/lib/chengyuChainProgress";

export const chengyuDifficultyLabels: Record<ChengyuChain["difficulty"], string> = { beginner: "入门", intermediate: "进阶" };
const descriptions: Record<ChengyuChain["difficulty"], string> = {
  beginner: "常见成语，末字接首字。每条 6 个成语，要接对 5 次。",
  intermediate: "成语稍难一些，接法相同：看末字，选首字相同的下一个。",
};

export const ChengyuChainSelect = forwardRef<HTMLHeadingElement, {
  difficulty: ChengyuChain["difficulty"];
  progress: ChengyuChainProgress;
  onDifficultyChange: (difficulty: ChengyuChain["difficulty"]) => void;
  onStart: (id: string) => void;
}>(function ChengyuChainSelect({ difficulty, progress, onDifficultyChange, onStart }, headingRef) {
  const chains = chengyuChains.filter(chain => chain.difficulty === difficulty);
  return (
    <section aria-labelledby="chengyu-chain-select-title" className="study-panel flex min-w-0 flex-col gap-5 p-5 sm:p-6">
      <div className="flex flex-col gap-2">
        <h2 id="chengyu-chain-select-title" ref={headingRef} tabIndex={-1} className="section-title">选一条成语链</h2>
        <p className="text-muted-foreground">上一个成语的最后一个字，就是下一个成语的第一个字。四选一，接错会告诉你差在哪里。</p>
      </div>
      <ToggleGroup
        type="single"
        value={difficulty}
        onValueChange={value => { if (value) onDifficultyChange(value as ChengyuChain["difficulty"]); }}
        variant="outline"
        aria-label="选择难度"
        className="w-full sm:w-fit"
      >
        {(["beginner", "intermediate"] as const).map(item => (
          <ToggleGroupItem key={item} value={item} className="min-h-11 flex-1 px-5 text-base sm:flex-none">{chengyuDifficultyLabels[item]}</ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="text-sm text-muted-foreground">{descriptions[difficulty]}</p>
      <ul aria-label={`${chengyuDifficultyLabels[difficulty]}成语链`} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {chains.map(chain => {
          const stars = progress[chain.id];
          const title = chain.idioms[0].text;
          return (
            <li key={chain.id}>
              <Button
                variant="outline"
                onClick={() => onStart(chain.id)}
                aria-label={`${title}，${chain.idioms.length} 个成语${stars ? `，已获得 ${stars} 颗星` : "，未完成"}`}
                className="h-auto min-h-11 w-full flex-col gap-1 px-3 py-3"
              >
                <span className="font-serif text-2xl font-normal leading-none">{title}</span>
                {stars ? <GameStars stars={stars} /> : <span className="text-xs font-normal text-muted-foreground">{chain.idioms.length} 个成语</span>}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
});
