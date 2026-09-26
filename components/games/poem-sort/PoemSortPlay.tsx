"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft, CircleAlert, CircleCheck, Info, Lightbulb } from "lucide-react";
import { poemSortDifficultyLabels } from "@/components/games/poem-sort/PoemSortSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { poemSortRemaining, type PoemSortState } from "@/lib/poemSort";
import { cn } from "@/lib/utils";

export function PoemSortPlay({ state, onChoose, onHint, onExit }: {
  state: PoemSortState;
  onChoose: (tileIndex: number) => void;
  onHint: () => void;
  onExit: () => void;
}) {
  const line = state.level.lines[state.lineIndex];
  const remaining = poemSortRemaining(state);
  const firstTile = useRef<HTMLButtonElement>(null);
  const { kind } = state.feedback;
  const FeedbackIcon = kind === "line" || kind === "hint" ? CircleCheck : kind === "wrong" ? CircleAlert : Info;
  const placed = line.chars.slice(0, state.filled).join("");

  useEffect(() => {
    firstTile.current?.focus({ preventScroll: true });
    document.getElementById("poem-sort-board")?.scrollIntoView({ block: "nearest" });
  }, [state.lineIndex, state.filled, state.mistakes]);

  return (
    <section aria-labelledby="poem-sort-play-title" className="study-panel mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="poem-sort-play-title" className="section-title">{state.level.title}</h2>
          <Badge variant="outline">{poemSortDifficultyLabels[state.level.difficulty]}</Badge>
        </div>
        <Button variant="ghost" onClick={onExit}>
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          换一首诗
        </Button>
      </div>

      <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
        <div className="flex gap-1"><dt>进度</dt><dd className="font-semibold text-foreground">第 {state.lineIndex + 1} / {state.level.lines.length} 句</dd></div>
        <div className="flex gap-1"><dt>点错</dt><dd className="font-semibold text-foreground">{state.mistakes}</dd></div>
        <div className="flex gap-1"><dt>提示</dt><dd className="font-semibold text-foreground">{state.hints}</dd></div>
      </dl>

      {state.lineIndex > 0 && (
        <ol aria-label="已经排好的句子" className="flex flex-col gap-1 text-sm text-muted-foreground">
          {state.level.lines.slice(0, state.lineIndex).map((done, index) => (
            <li key={index} className="font-serif text-lg text-foreground">{done.chars.join("")}</li>
          ))}
        </ol>
      )}

      <div id="poem-sort-board" className="flex flex-col items-center gap-4">
        <p className="sr-only">已放入：{placed || "还没有字"}</p>
        <div aria-hidden="true" className="flex max-w-full justify-center gap-0.5 sm:gap-2">
          {line.chars.map((char, index) => (
            <span
              key={index}
              data-poem-slot=""
              className={cn(
                "flex size-8 items-center justify-center rounded-md border font-serif text-lg min-[380px]:size-9 min-[420px]:size-11 min-[420px]:text-2xl sm:size-12",
                index < state.filled ? "border-success/50 text-foreground" : "border-dashed bg-muted/60",
              )}
            >
              {index < state.filled ? char : ""}
            </span>
          ))}
        </div>
        {state.filled > 0 && <p className="text-sm text-muted-foreground">{line.pinyin.slice(0, state.filled).join(" ")}</p>}

        <div role="group" aria-label="待排序的字" className="flex max-w-full flex-wrap justify-center gap-2">
          {remaining.map((tileIndex, index) => (
            <Button
              key={tileIndex}
              ref={index === 0 ? firstTile : undefined}
              variant="outline"
              size="icon"
              onClick={() => onChoose(tileIndex)}
              className="font-serif text-2xl font-normal"
            >
              {line.chars[tileIndex]}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" onClick={onHint}>
          <Lightbulb data-icon="inline-start" aria-hidden="true" />
          放入下一个字
        </Button>
      </div>

      <p role="status" aria-live="polite" className={cn("flex min-h-12 items-start gap-2 rounded-lg border px-3 py-2.5 text-sm", (kind === "line" || kind === "hint") && "border-success/40 text-success", kind === "wrong" && "border-destructive/40 text-destructive", kind === "idle" && "text-muted-foreground")}>
        <FeedbackIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>{state.feedback.text}</span>
      </p>
    </section>
  );
}
