"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CircleAlert, CircleCheck, Info } from "lucide-react";
import { feihuaTierLabels } from "@/components/games/feihua/FeihuaKeySelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FEIHUA_RECITE_TURNS, feihuaWorkHref, type FeihuaReciteState } from "@/lib/feihua";
import { cn } from "@/lib/utils";

export function FeihuaRecite({ state, onSubmit, onExit }: {
  state: FeihuaReciteState;
  onSubmit: (input: string) => void;
  onExit: () => void;
}) {
  const [value, setValue] = useState("");
  const [turnCount, setTurnCount] = useState(state.turns.length);
  if (turnCount !== state.turns.length) {
    setTurnCount(state.turns.length);
    setValue("");
  }
  const input = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const playerTurns = state.turns.filter(turn => turn.by === "player").length;
  const { kind } = state.feedback;
  const ok = kind === "accepted" || kind === "done";
  const bad = kind === "missing" || kind === "duplicate" || kind === "unknown";
  const FeedbackIcon = ok ? CircleCheck : bad ? CircleAlert : Info;

  useEffect(() => {
    input.current?.focus({ preventScroll: true });
  }, [state.turns.length, state.mistakes, state.feedback.kind]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (composing.current || state.done) return;
    onSubmit(value);
  }

  return (
    <section aria-labelledby="feihua-play-title" className="study-panel mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="feihua-play-title" className="section-title">飞花令 ·「{state.key}」</h2>
          <Badge variant="outline">{feihuaTierLabels[state.tier]}</Badge>
          <Badge variant="outline">对句</Badge>
        </div>
        <Button variant="ghost" onClick={onExit}>
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          换一个字
        </Button>
      </div>
      <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
        <div className="flex gap-1"><dt>进度</dt><dd className="font-semibold text-foreground">第 {Math.min(playerTurns + (state.done ? 0 : 1), FEIHUA_RECITE_TURNS)} / {FEIHUA_RECITE_TURNS} 句</dd></div>
        <div className="flex gap-1"><dt>未接上</dt><dd className="font-semibold text-foreground">{state.mistakes}</dd></div>
      </dl>
      {state.turns.length > 0 && (
        <ol aria-label="已接诗句" className="flex flex-col gap-2">
          {state.turns.map((turn, index) => (
            <li key={`${turn.line.id}-${index}`} className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-serif text-xl"><span className="mr-2 text-sm text-muted-foreground">{turn.by === "player" ? "你" : "系统"}</span>{[...turn.line.text].map((char, charIndex) => char === state.key ? <span key={charIndex} className="font-semibold text-primary">{char}</span> : char)}</p>
              <Button asChild variant="link" size="sm" className="px-0"><Link href={feihuaWorkHref(turn.line)}>读全诗</Link></Button>
            </li>
          ))}
        </ol>
      )}
      {!state.done && (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label htmlFor="feihua-recite-input" className="text-sm font-semibold">写一句含有「{state.key}」的诗</label>
          <div className="flex gap-2">
            <Input
              ref={input}
              id="feihua-recite-input"
              lang="zh-CN"
              value={value}
              onChange={event => setValue(event.target.value)}
              onCompositionStart={() => { composing.current = true; }}
              onCompositionEnd={() => { composing.current = false; }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              maxLength={24}
              placeholder="五个或七个字"
              aria-describedby="feihua-recite-feedback"
              className="font-serif text-lg"
            />
            <Button type="submit">提交</Button>
          </div>
        </form>
      )}
      <p id="feihua-recite-feedback" role="status" aria-live="polite" className={cn("flex min-h-12 items-start gap-2 rounded-lg border px-3 py-2.5 text-sm", ok && "border-success/40 text-success", bad && "border-destructive/40 text-destructive", !ok && !bad && "text-muted-foreground")}>
        <FeedbackIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>{state.feedback.text}</span>
      </p>
    </section>
  );
}
