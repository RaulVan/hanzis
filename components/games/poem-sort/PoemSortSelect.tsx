"use client";

import { forwardRef } from "react";
import { GameStars } from "@/components/games/GameStars";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { poemSortCatalog, type PoemSortDifficulty } from "@/lib/poemSort";
import type { PoemSortProgress } from "@/lib/poemSortProgress";

export const poemSortDifficultyLabels: Record<PoemSortDifficulty, string> = { beginner: "入门", intermediate: "进阶" };
const descriptions: Record<PoemSortDifficulty, string> = {
  beginner: "每一句都是五个字，来自本站校对过的古诗词。",
  intermediate: "每一句都是七个字，句子更长，顺序也更不容易记。",
};

export const PoemSortSelect = forwardRef<HTMLHeadingElement, {
  difficulty: PoemSortDifficulty;
  progress: PoemSortProgress;
  onDifficultyChange: (difficulty: PoemSortDifficulty) => void;
  onStart: (slug: string) => void;
}>(function PoemSortSelect({ difficulty, progress, onDifficultyChange, onStart }, headingRef) {
  const levels = poemSortCatalog.filter(level => level.difficulty === difficulty);
  return (
    <section aria-labelledby="poem-sort-select-title" className="study-panel flex min-w-0 flex-col gap-5 p-5 sm:p-6">
      <div className="flex flex-col gap-2">
        <h2 id="poem-sort-select-title" ref={headingRef} tabIndex={-1} className="section-title">选一首诗，把句子排回去</h2>
        <p className="text-muted-foreground">每句诗的字被打乱。按原来的顺序点进去，排完整首诗后可以看到作者、译文和注释。</p>
      </div>
      <ToggleGroup
        type="single"
        value={difficulty}
        onValueChange={value => { if (value) onDifficultyChange(value as PoemSortDifficulty); }}
        variant="outline"
        aria-label="选择难度"
        className="w-full sm:w-fit"
      >
        {(["beginner", "intermediate"] as const).map(item => (
          <ToggleGroupItem key={item} value={item} className="min-h-11 flex-1 px-5 text-base sm:flex-none">{poemSortDifficultyLabels[item]}</ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="text-sm text-muted-foreground">{descriptions[difficulty]}</p>
      <ul aria-label={`${poemSortDifficultyLabels[difficulty]}诗篇`} className="grid gap-3 sm:grid-cols-2">
        {levels.map(level => {
          const stars = progress[level.slug];
          return (
            <li key={level.slug}>
              <Button
                variant="outline"
                onClick={() => onStart(level.slug)}
                aria-label={`${level.title}，${level.author}，${level.lines.length} 句${stars ? `，已获得 ${stars} 颗星` : "，未完成"}`}
                className="h-auto min-h-11 w-full justify-between gap-3 whitespace-normal px-3 py-2 text-left"
              >
                <span className="min-w-0">
                  <span className="block font-serif text-lg font-normal leading-snug">{level.title}</span>
                  <span className="block text-xs font-normal text-muted-foreground">{level.author} · {level.lines.length} 句</span>
                </span>
                {stars ? <GameStars stars={stars} /> : null}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
});
