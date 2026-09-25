"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { Lock } from "lucide-react";
import { GameStars } from "@/components/games/GameStars";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  difficultyDescriptions,
  difficultyLabels,
  hanziMatchLevels,
  type HanziMatchDifficulty,
  type HanziMatchLevel,
} from "@/data/hanziMatchLevels";
import { isHanziMatchLevelUnlocked, type HanziMatchProgress } from "@/lib/hanziMatchProgress";

const difficulties = Object.keys(difficultyLabels) as HanziMatchDifficulty[];

export const HanziMatchLevelSelect = forwardRef<HTMLHeadingElement, {
  difficulty: HanziMatchDifficulty;
  progress: HanziMatchProgress;
  onDifficultyChange: (difficulty: HanziMatchDifficulty) => void;
  onStart: (level: HanziMatchLevel) => void;
}>(function HanziMatchLevelSelect({ difficulty, progress, onDifficultyChange, onStart }, headingRef) {
  const levels = hanziMatchLevels.filter(level => level.difficulty === difficulty);

  return (
    <section aria-labelledby="hanzi-match-levels-title" className="flex min-w-0 flex-col gap-6">
      <div className="study-panel flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <h2 id="hanzi-match-levels-title" ref={headingRef} tabIndex={-1} className="section-title">选择难度与关卡</h2>
          <p className="text-muted-foreground">每关 16 张字卡藏着 8 个二字词语。先点第一个字，再点第二个字，顺序对了才能消除。</p>
        </div>
        <ToggleGroup
          type="single"
          value={difficulty}
          onValueChange={value => { if (value) onDifficultyChange(value as HanziMatchDifficulty); }}
          variant="outline"
          aria-label="选择难度"
          className="w-full sm:w-fit"
        >
          {difficulties.map(item => (
            <ToggleGroupItem key={item} value={item} className="min-h-11 flex-1 px-5 text-base sm:flex-none">{difficultyLabels[item]}</ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-sm text-muted-foreground">{difficultyDescriptions[difficulty]}</p>
        <ol aria-label={`${difficultyLabels[difficulty]}关卡`} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {levels.map(level => {
            const record = progress.levels[level.id];
            const unlocked = isHanziMatchLevelUnlocked(progress, level);
            return (
              <li key={level.id}>
                <Button
                  variant="outline"
                  disabled={!unlocked}
                  onClick={() => onStart(level)}
                  aria-label={`第 ${level.number} 关 ${level.theme}${record ? `，已获得 ${record.stars} 颗星` : unlocked ? "，未完成" : `，完成第 ${level.number - 1} 关后解锁`}`}
                  className="h-auto w-full flex-col items-start gap-1 whitespace-normal px-4 py-3 text-left"
                >
                  <span className="text-sm text-muted-foreground">第 {level.number} 关</span>
                  <span className="font-serif text-lg">{level.theme}</span>
                  {record ? <GameStars stars={record.stars} /> : unlocked
                    ? <span className="text-sm font-normal text-muted-foreground">未完成</span>
                    : <span className="inline-flex items-center gap-1 text-sm font-normal text-muted-foreground"><Lock aria-hidden="true" />完成上一关后解锁</span>}
                </Button>
              </li>
            );
          })}
        </ol>
      </div>

      {progress.review.length > 0 && (
        <section aria-labelledby="hanzi-match-review-title" className="study-panel flex flex-col gap-3 p-5 sm:p-6">
          <h2 id="hanzi-match-review-title" className="section-title">待复习词语</h2>
          <p className="text-sm text-muted-foreground">用过提示或点反顺序的词会记在这里；之后在同一关里顺利找到，就会自动移出。</p>
          <ul className="flex flex-wrap gap-2">
            {progress.review.map(word => (
              <li key={word}>
                <Button asChild variant="outline" size="sm" className="font-serif text-base">
                  <Link href={`/dictionary/?q=${encodeURIComponent(word)}`} aria-label={`在字典中查看「${word}」`}>{word}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
});
