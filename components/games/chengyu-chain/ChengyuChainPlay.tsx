"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft, CircleAlert, CircleCheck, Info, Lightbulb } from "lucide-react";
import { chengyuDifficultyLabels } from "@/components/games/chengyu-chain/ChengyuChainSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { chengyuEntry, type ChengyuChainState } from "@/lib/chengyuChain";
import { cn } from "@/lib/utils";

export function ChengyuChainPlay({ state, onChoose, onHint, onExit }: {
  state: ChengyuChainState;
  onChoose: (option: string) => void;
  onHint: () => void;
  onExit: () => void;
}) {
  const question = state.questions[state.index];
  const prompt = state.chain.idioms[state.index];
  const meaning = chengyuEntry(prompt.text)?.meaning;
  const chars = [...prompt.text];
  const firstOption = useRef<HTMLButtonElement>(null);
  const { kind } = state.feedback;
  const FeedbackIcon = kind === "correct" || kind === "hint" ? CircleCheck : kind === "wrong" ? CircleAlert : Info;

  useEffect(() => {
    firstOption.current?.focus({ preventScroll: true });
  }, [state.index, state.eliminated.length, state.hinted]);

  return (
    <section aria-labelledby="chengyu-chain-play-title" className="study-panel mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="chengyu-chain-play-title" className="section-title">成语接龙 · {state.chain.idioms[0].text}</h2>
          <Badge variant="outline">{chengyuDifficultyLabels[state.chain.difficulty]}</Badge>
        </div>
        <Button variant="ghost" onClick={onExit}>
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          换一条
        </Button>
      </div>

      <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
        <div className="flex gap-1"><dt>进度</dt><dd className="font-semibold text-foreground">第 {state.index + 1} / {state.questions.length} 环</dd></div>
        <div className="flex gap-1"><dt>接错</dt><dd className="font-semibold text-foreground">{state.mistakes}</dd></div>
        <div className="flex gap-1"><dt>提示</dt><dd className="font-semibold text-foreground">{state.hints}</dd></div>
      </dl>

      <p className="text-sm text-muted-foreground">已接：{state.chain.idioms.slice(0, state.index + 1).map(item => item.text).join(" → ")}</p>

      <div className="flex flex-col items-center gap-2 text-center">
        <p data-chengyu-prompt={prompt.text} className="font-serif text-4xl sm:text-5xl">
          {chars.map((char, index) => (
            <span key={index} className={index === chars.length - 1 ? "font-semibold text-primary" : undefined}>{char}</span>
          ))}
        </p>
        {meaning && <p className="max-w-md text-sm text-muted-foreground">{meaning}</p>}
        <p className="text-sm">接以 <span className="font-serif text-xl font-semibold text-primary">{chars[chars.length - 1]}</span> 开头的成语</p>
      </div>

      <div role="group" aria-label="候选成语" className="mx-auto grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
        {question.options.map(option => {
          const crossed = state.eliminated.includes(option);
          const hinted = state.hinted && option === question.answer;
          const enabledIndex = question.options.findIndex(item => !state.eliminated.includes(item));
          return (
            <Button
              key={option}
              ref={option === question.options[enabledIndex] ? firstOption : undefined}
              variant="outline"
              disabled={crossed}
              aria-label={crossed ? `${option}，已排除` : hinted ? `${option}，提示` : option}
              onClick={() => onChoose(option)}
              className={cn("h-16 font-serif text-2xl font-normal", crossed && "line-through", hinted && "border-2 border-primary")}
            >
              {option}
            </Button>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button variant="outline" onClick={onHint}>
          <Lightbulb data-icon="inline-start" aria-hidden="true" />
          标出这一环
        </Button>
      </div>

      <p role="status" aria-live="polite" className={cn("flex min-h-12 items-start gap-2 rounded-lg border px-3 py-2.5 text-sm", (kind === "correct" || kind === "hint") && "border-success/40 text-success", kind === "wrong" && "border-destructive/40 text-destructive", kind === "idle" && "text-muted-foreground")}>
        <FeedbackIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>{state.feedback.text}</span>
      </p>
    </section>
  );
}
