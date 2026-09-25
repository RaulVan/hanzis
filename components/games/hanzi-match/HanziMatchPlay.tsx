"use client";

import { forwardRef } from "react";
import { ArrowLeft, CircleAlert, CircleCheck, Info, Lightbulb, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { difficultyLabels, type HanziMatchLevel } from "@/data/hanziMatchLevels";
import {
  describeHanziMatchFeedback,
  HANZI_MATCH_COLUMNS,
  hasConsistentTileReadings,
  type HanziMatchState,
} from "@/lib/hanziMatch";
import { cn } from "@/lib/utils";

export const HanziMatchPlay = forwardRef<HTMLHeadingElement, {
  level: HanziMatchLevel;
  state: HanziMatchState;
  onSelect: (tileId: number) => void;
  onHint: () => void;
  onRestart: () => void;
  onExit: () => void;
}>(function HanziMatchPlay({ level, state, onSelect, onHint, onRestart, onExit }, headingRef) {
  const showPinyin = level.difficulty === "beginner" && hasConsistentTileReadings(level);
  const foundWords = state.found.map(word => level.words.find(item => item.word === word)!);
  const { kind } = state.feedback;
  const error = kind === "reversed" || kind === "not-word";
  const FeedbackIcon = kind === "found" ? CircleCheck : error ? CircleAlert : Info;

  return (
    <section aria-labelledby="hanzi-match-play-title" className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
      <div className="study-panel flex min-w-0 flex-col gap-5 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h2 id="hanzi-match-play-title" ref={headingRef} tabIndex={-1} className="section-title">第 {level.number} 关 · {level.theme}</h2>
            <Badge variant="outline">{difficultyLabels[level.difficulty]}</Badge>
          </div>
          <Button variant="ghost" onClick={onExit}>
            <ArrowLeft data-icon="inline-start" aria-hidden="true" />
            返回选关
          </Button>
        </div>

        <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <div className="flex gap-1"><dt>已找到</dt><dd className="font-semibold text-foreground">{state.found.length} / {level.words.length}</dd></div>
          <div className="flex gap-1"><dt>失误</dt><dd className="font-semibold text-foreground">{state.mistakes}</dd></div>
          <div className="flex gap-1"><dt>提示</dt><dd className="font-semibold text-foreground">{state.hints}</dd></div>
        </dl>

        <div id="hanzi-match-board-area" className="grid gap-5 [@media(max-height:500px)_and_(orientation:landscape)]:grid-cols-[auto_minmax(0,1fr)] [@media(max-height:500px)_and_(orientation:landscape)]:items-start">
          <div role="group" aria-label="字卡棋盘" className="mx-auto grid w-full max-w-[max(13rem,min(28rem,calc(100dvh-8rem)))] grid-cols-4 gap-2 sm:gap-3 [@media(max-height:500px)_and_(orientation:landscape)]:w-[max(13rem,calc(100dvh-8rem))]">
            {state.tiles.map(tile => {
              const row = Math.floor(tile.id / HANZI_MATCH_COLUMNS) + 1;
              const column = (tile.id % HANZI_MATCH_COLUMNS) + 1;
              if (state.removed.includes(tile.id)) {
                return <div key={tile.id} aria-hidden="true" className="aspect-square rounded-lg border border-dashed bg-muted/60" />;
              }
              const selected = state.selected === tile.id;
              const hinted = state.hinted.includes(tile.id);
              return (
                <button
                  key={tile.id}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${tile.char}${showPinyin ? ` ${tile.pinyin}` : ""}，第 ${row} 行第 ${column} 列${hinted ? "，提示" : ""}`}
                  onClick={() => onSelect(tile.id)}
                  className={cn(
                    "flex aspect-square min-h-14 flex-col items-center justify-center rounded-lg border bg-card font-serif text-3xl leading-none transition-colors hover:border-primary hover:text-primary sm:text-4xl [@media(max-height:500px)_and_(orientation:landscape)]:text-2xl",
                    hinted && "border-2 border-dashed border-primary",
                    selected && "border-2 border-primary bg-accent text-accent-foreground",
                  )}
                >
                  {showPinyin && <span className="mb-1 font-sans text-xs font-normal text-muted-foreground sm:text-sm">{tile.pinyin}</span>}
                  <span>{tile.char}</span>
                </button>
              );
            })}
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <p role="status" aria-live="polite" className={cn("flex min-h-12 items-start gap-2 rounded-lg border px-3 py-2.5 text-sm", kind === "found" && "border-success/40 text-success", error && "border-destructive/40 text-destructive", !error && kind !== "found" && "text-muted-foreground")}>
              <FeedbackIcon aria-hidden="true" className="mt-0.5 size-4" />
              <span>{describeHanziMatchFeedback(state.feedback)}</span>
            </p>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={onHint}>
                <Lightbulb data-icon="inline-start" aria-hidden="true" />
                提示
              </Button>
              <Button variant="outline" onClick={onRestart}>
                <RotateCcw data-icon="inline-start" aria-hidden="true" />
                重新开始
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">每用一次提示少一颗星，每失误 3 次少一颗星，通关至少保留一颗星。</p>
          </div>
        </div>
      </div>

      <aside aria-labelledby="hanzi-match-found-title" className="study-panel flex min-w-0 flex-col gap-3 p-5 sm:p-6">
        <h3 id="hanzi-match-found-title" className="section-title">已找到的词语</h3>
        {foundWords.length === 0 ? (
          <p className="text-sm text-muted-foreground">找到的词语会连同拼音和意思出现在这里。</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {foundWords.map(word => (
              <li key={word.word} className="border-b pb-3 last:border-b-0 last:pb-0">
                <p className="flex flex-wrap items-baseline gap-2"><span className="font-serif text-xl">{word.word}</span><span className="text-sm text-muted-foreground">{word.pinyin}</span></p>
                <p className="text-sm">{word.meaning}</p>
              </li>
            ))}
          </ol>
        )}
      </aside>
    </section>
  );
});
