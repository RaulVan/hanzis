"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CircleAlert, CircleCheck, Info, SkipForward, Square } from "lucide-react";
import { modeLabels, toneModeLabels } from "@/components/games/pinyin-quiz/PinyinQuizSetup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  currentPinyinQuizItem,
  describePinyinQuizFeedback,
  pinyinQuizScore,
  type PinyinQuizState,
} from "@/lib/pinyinQuiz";
import type { PinyinQuizSettings } from "@/lib/pinyinQuizProgress";
import { cn } from "@/lib/utils";

const formatSeconds = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export function PinyinQuizPlay({ settings, state, secondsLeft, onSubmit, onSkip, onStop }: {
  settings: PinyinQuizSettings;
  state: PinyinQuizState;
  /** null for untimed rounds. */
  secondsLeft: number | null;
  onSubmit: (input: string) => void;
  onSkip: () => void;
  onStop: () => void;
}) {
  const item = currentPinyinQuizItem(state)!;
  const [value, setValue] = useState("");
  // Clear the field as soon as a new question arrives (adjusting state during render, not in an effect).
  const [shownIndex, setShownIndex] = useState(state.index);
  if (shownIndex !== state.index) {
    setShownIndex(state.index);
    setValue("");
  }
  const input = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const { kind } = state.feedback;
  const retry = kind === "retry";
  const FeedbackIcon = kind === "correct" ? CircleCheck : retry ? CircleAlert : Info;

  // A new question starts with an empty, focused field; a retry keeps the text selected for quick retyping.
  useEffect(() => {
    input.current?.focus({ preventScroll: true });
    if (retry) input.current?.select();
  }, [state.index, state.wrongAttempts, retry]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (composing.current) return;
    onSubmit(value);
  }

  return (
    <section aria-labelledby="pinyin-quiz-play-title" className="study-panel mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="pinyin-quiz-play-title" className="section-title">拼音快答</h2>
          <Badge variant="outline">{modeLabels[settings.mode]}</Badge>
          <Badge variant="outline">{toneModeLabels[settings.toneMode]}</Badge>
        </div>
        <Button variant="ghost" onClick={onStop}>
          <Square data-icon="inline-start" aria-hidden="true" />
          结束本轮
        </Button>
      </div>

      <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
        {secondsLeft === null
          ? <div className="flex gap-1"><dt>进度</dt><dd className="font-semibold text-foreground">第 {state.index + 1} / {state.items.length} 题</dd></div>
          : <div className="flex gap-1"><dt>剩余</dt><dd role="timer" aria-live="off" className="font-semibold tabular-nums text-foreground">{formatSeconds(secondsLeft)}</dd></div>}
        <div className="flex gap-1"><dt>答对</dt><dd className="font-semibold text-foreground">{pinyinQuizScore(state)}</dd></div>
        <div className="flex gap-1"><dt>连对</dt><dd className="font-semibold text-foreground">{state.streak}</dd></div>
      </dl>
      {secondsLeft !== null && (
        <div aria-hidden="true" className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${(secondsLeft / settings.duration) * 100}%` }} />
        </div>
      )}

      <p id="pinyin-quiz-prompt" className="text-center font-serif text-7xl leading-tight sm:text-8xl" aria-label={`第 ${state.answers.length + 1} 题：${item.text}`}>{item.text}</p>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <label htmlFor="pinyin-quiz-answer" className="text-sm font-semibold">写出上面{settings.mode === "word" ? "词语" : "汉字"}的拼音</label>
        <div className="flex gap-2">
          <Input
            ref={input}
            id="pinyin-quiz-answer"
            lang="en"
            value={value}
            onChange={event => setValue(event.target.value)}
            onCompositionStart={() => { composing.current = true; }}
            onCompositionEnd={() => { composing.current = false; }}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            maxLength={40}
            placeholder={settings.toneMode === "toned" ? (settings.mode === "word" ? "如 huo3che1" : "如 huo3") : (settings.mode === "word" ? "如 huoche" : "如 huo")}
            aria-describedby="pinyin-quiz-feedback"
            aria-invalid={state.feedback.kind === "retry" && state.feedback.verdict !== "empty"}
            className="font-sans text-lg"
          />
          <Button type="submit">提交</Button>
        </div>
      </form>

      <p id="pinyin-quiz-feedback" role="status" aria-live="polite" className={cn("flex min-h-12 items-start gap-2 rounded-lg border px-3 py-2.5 text-sm", kind === "correct" && "border-success/40 text-success", retry && "border-destructive/40 text-destructive", !retry && kind !== "correct" && "text-muted-foreground")}>
        <FeedbackIcon aria-hidden="true" className="mt-0.5 size-4" />
        <span>{describePinyinQuizFeedback(state.feedback, settings.toneMode)}</span>
      </p>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onSkip}>
          <SkipForward data-icon="inline-start" aria-hidden="true" />
          跳过，看答案
        </Button>
      </div>
    </section>
  );
}
