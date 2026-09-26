"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, CircleAlert, CircleCheck, Info } from "lucide-react";
import { feihuaTierLabels } from "@/components/games/feihua/FeihuaKeySelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { currentFeihuaQuestion, describeFeihuaFeedback, feihuaWorkHref, isFeihuaLineSolved, type FeihuaState } from "@/lib/feihua";
import { cn } from "@/lib/utils";

export function FeihuaPlay({ state, onChoose, onNext, onExit }: {
  state: FeihuaState;
  onChoose: (char: string) => void;
  onNext: () => void;
  onExit: () => void;
}) {
  const question = currentFeihuaQuestion(state)!;
  const mark = question.highlight ?? state.key;
  const solved = isFeihuaLineSolved(state);
  const last = state.index === state.questions.length - 1;
  const chars = [...question.line.text];
  const options = question.options[state.filled] ?? [];
  const firstOption = useRef<HTMLButtonElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const { kind } = state.feedback;
  const FeedbackIcon = kind === "solved" || kind === "correct" ? CircleCheck : kind === "wrong" ? CircleAlert : Info;

  // Keep keyboard focus on the choices: options are replaced after every correct answer.
  useEffect(() => {
    (solved ? nextButton.current : firstOption.current)?.focus({ preventScroll: true });
  }, [state.index, state.filled, state.eliminated.length, solved]);

  const spoken = chars.map((char, index) => {
    const blank = question.blanks.indexOf(index);
    return blank === -1 || blank < state.filled ? char : "空";
  }).join(" ");

  return (
    <section aria-labelledby="feihua-play-title" className="study-panel mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="feihua-play-title" className="section-title">飞花令 ·「{state.key}」</h2>
          <Badge variant="outline">{feihuaTierLabels[state.tier]}</Badge>
        </div>
        <Button variant="ghost" onClick={onExit}>
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          换一个字
        </Button>
      </div>

      <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
        <div className="flex gap-1"><dt>进度</dt><dd className="font-semibold text-foreground">第 {state.index + 1} / {state.questions.length} 句</dd></div>
        <div className="flex gap-1"><dt>错选</dt><dd className="font-semibold text-foreground">{state.mistakes}</dd></div>
      </dl>

      <p className="sr-only">诗句：{spoken}</p>
      <div aria-hidden="true" className="flex justify-center gap-1 sm:gap-2">
        {chars.map((char, index) => {
          const blank = question.blanks.indexOf(index);
          const hidden = blank !== -1 && blank >= state.filled;
          const active = blank === state.filled && !solved;
          return (
            <span
              key={index}
              className={cn(
                "flex size-9 items-center justify-center rounded-md font-serif text-2xl min-[400px]:size-11 min-[400px]:text-3xl sm:size-14 sm:text-4xl",
                char === mark && "font-semibold text-primary",
                blank !== -1 && "border",
                hidden && "border-dashed bg-muted/60",
                active && "border-2 border-primary",
                blank !== -1 && !hidden && "border-success/50 text-success",
              )}
            >
              {hidden ? "" : char}
            </span>
          );
        })}
      </div>

      {!solved ? (
        <div role="group" aria-label={`第 ${state.filled + 1} 个空的候选字`} className="mx-auto grid w-full max-w-md grid-cols-4 gap-2 sm:gap-3">
          {options.map((option, index) => {
            const crossed = state.eliminated.includes(option);
            return (
              <Button
                key={option}
                ref={index === options.findIndex(item => !state.eliminated.includes(item)) ? firstOption : undefined}
                variant="outline"
                disabled={crossed}
                aria-label={crossed ? `${option}，已排除` : option}
                onClick={() => onChoose(option)}
                className={cn("h-16 font-serif text-3xl font-normal", crossed && "line-through")}
              >
                {option}
              </Button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-lg bg-muted px-4 py-4 text-center">
          <p className="text-sm text-muted-foreground">《{question.line.title}》 {question.line.author}（{question.line.dynasty}）</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button ref={nextButton} onClick={onNext}>
              {last ? "查看本轮结果" : "下一句"}
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
            <Button asChild variant="outline">
              <Link href={feihuaWorkHref(question.line)}>读全诗<ArrowUpRight data-icon="inline-end" aria-hidden="true" /></Link>
            </Button>
          </div>
        </div>
      )}

      <p role="status" aria-live="polite" className={cn("flex min-h-12 items-start gap-2 rounded-lg border px-3 py-2.5 text-sm", (kind === "solved" || kind === "correct") && "border-success/40 text-success", kind === "wrong" && "border-destructive/40 text-destructive", kind === "idle" && "text-muted-foreground")}>
        <FeedbackIcon aria-hidden="true" className="mt-0.5 size-4" />
        <span>{describeFeihuaFeedback(state.feedback, mark)}</span>
      </p>
    </section>
  );
}
