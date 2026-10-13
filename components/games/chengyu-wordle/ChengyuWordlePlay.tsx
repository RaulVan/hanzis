"use client";
import { UiText } from "@/components/i18n/UiText";
import { useTranslate } from "@/components/i18n/LanguageProvider";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CircleAlert, CircleCheck, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CHENGYU_WORDLE_TRIES,
  chengyuHintsExhausted,
  describeChengyuMark,
  initialLabel,
  nextChengyuInitialHint,
  type ChengyuMark,
  type ChengyuWordleState,
} from "@/lib/chengyuWordle";
import { cn } from "@/lib/utils";

const markClass: Record<ChengyuMark, string> = {
  exact: "border-success/50 text-success",
  present: "border-primary/50 text-primary",
  absent: "border-border text-muted-foreground",
};

export function ChengyuWordlePlay({ state, streak, onSubmit, onExplanation, onInitial, onRevealAnswer, onPractice, onToday }: {
  state: ChengyuWordleState;
  streak: number;
  onSubmit: (input: string) => void;
  onExplanation: () => void;
  onInitial: () => void;
  onRevealAnswer: () => void;
  onPractice: () => void;
  onToday: () => void;
}) {
  const t = useTranslate();
  const [value, setValue] = useState("");
  const [guessCount, setGuessCount] = useState(state.guesses.length);
  if (guessCount !== state.guesses.length) {
    setGuessCount(state.guesses.length);
    setValue("");
  }
  const input = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const { kind } = state.feedback;
  const ok = kind === "win";
  const bad = kind === "unknown" || kind === "format" || kind === "loss";
  const FeedbackIcon = ok ? CircleCheck : bad ? CircleAlert : Info;

  useEffect(() => {
    if (!state.done) input.current?.focus({ preventScroll: true });
  }, [state.guesses.length, state.feedback.kind, state.done]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (composing.current || state.done) return;
    onSubmit(value);
  }

  return (
    <section aria-labelledby="chengyu-wordle-title" className="study-panel mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="chengyu-wordle-title" className="section-title"><UiText text="每日成语" /></h2>
          <Badge variant="outline"><UiText>{state.practice ? "练习" : state.date}</UiText></Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {state.practice && <Button variant="outline" onClick={onToday}><UiText text="回到今天" /></Button>}
          <Button variant="outline" onClick={onPractice}><UiText text="再练一题" /></Button>
        </div>
      </div>
      <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
        <div className="flex gap-1"><dt><UiText text="次数" /></dt><dd className="font-semibold text-foreground">{state.guesses.length} / {CHENGYU_WORDLE_TRIES}</dd></div>
        <div className="flex gap-1"><dt><UiText text="连续答对" /></dt><dd className="font-semibold text-foreground"><UiText text="{0} 天" values={[streak]} /></dd></div>
      </dl>
      <p className="text-sm text-muted-foreground"><UiText text="● 对，表示这一项位置正确；◐ 有，表示成语里有、但位置不对；○ 无，表示没有。字、声母、韵母、声调分开看。" /></p>
      {state.guesses.length > 0 && (
        <ol aria-label={t("已猜成语")} className="flex flex-col gap-4">
          {state.guesses.map((guess, guessIndex) => (
            <li key={`${guess.word}-${guessIndex}`} className="grid grid-cols-4 gap-2">
              {[...guess.word].map((char, index) => {
                const mark = guess.marks[index];
                return (
                  <div key={index} className="min-w-0">
                    <p className="text-center font-serif text-3xl leading-none">{char}</p>
                    <ul className="mt-2 flex flex-col gap-1 text-xs" aria-label={t("第 {0} 字：字{1}，声母{2}，韵母{3}，声调{4}", [index + 1, describeChengyuMark(mark.char), describeChengyuMark(mark.initial), describeChengyuMark(mark.final), describeChengyuMark(mark.tone)])}>
                      {([
                        ["字", mark.char],
                        ["声", mark.initial],
                        ["韵", mark.final],
                        ["调", mark.tone],
                      ] as const).map(([label, value]) => (
                        <li key={label} className={cn("flex flex-wrap items-center justify-between gap-x-1 rounded-md border px-1.5 py-1", markClass[value])}>
                          <span><UiText>{label}</UiText></span>
                          <span><UiText>{describeChengyuMark(value)}</UiText></span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </li>
          ))}
        </ol>
      )}
      {state.explanationShown && <p className="text-sm"><UiText text="释义：{0}" values={[state.answer.explanation]} /></p>}
      {state.revealed.length > 0 && (
        <p className="text-sm"><UiText text="已提示声母：{0}" values={[state.revealed.map(index => t("第 {0} 字 {1}", [index + 1, t(initialLabel(state.syllables[index].initial))])).join("，")]} /></p>
      )}
      {!state.done && (
        <>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <label htmlFor="chengyu-wordle-input" className="text-sm font-semibold"><UiText text="猜一个四字成语" /></label>
            <div className="flex gap-2">
              <Input
                ref={input}
                id="chengyu-wordle-input"
                lang="zh-CN"
                value={value}
                onChange={event => setValue(event.target.value)}
                onCompositionStart={() => { composing.current = true; }}
                onCompositionEnd={() => { composing.current = false; }}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="go"
                maxLength={12}
                placeholder={t("四个汉字")}
                aria-describedby="chengyu-wordle-feedback"
                className="font-serif text-lg"
             />
              <Button type="submit"><UiText text="提交" /></Button>
            </div>
          </form>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={onExplanation} disabled={state.explanationShown}><UiText>{state.explanationShown ? "释义已显示" : "看释义"}</UiText></Button>
            <Button type="button" variant="outline" onClick={onInitial} disabled={nextChengyuInitialHint(state) === undefined}><UiText>{nextChengyuInitialHint(state) === undefined ? "声母已提示" : "看一个声母"}</UiText></Button>
            {chengyuHintsExhausted(state) && <Button type="button" onClick={onRevealAnswer}><UiText text="显示答案" /></Button>}
          </div>
        </>
      )}
      <p id="chengyu-wordle-feedback" role="status" aria-live="polite" className={cn("flex min-h-12 items-start gap-2 rounded-lg border px-3 py-2.5 text-sm", ok && "border-success/40 text-success", bad && "border-destructive/40 text-destructive", !ok && !bad && "text-muted-foreground")}>
        <FeedbackIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span><UiText>{state.feedback.text}</UiText></span>
      </p>
    </section>
  );
}
