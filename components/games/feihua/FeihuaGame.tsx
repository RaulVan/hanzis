"use client";

import { useEffect, useRef, useState } from "react";
import feihuaJson from "@/data/feihuaLines.json";
import { FeihuaKeySelect } from "@/components/games/feihua/FeihuaKeySelect";
import { FeihuaPlay } from "@/components/games/feihua/FeihuaPlay";
import { FeihuaResult } from "@/components/games/feihua/FeihuaResult";
import { useFeihuaProgress } from "@/hooks/useFeihuaProgress";
import { FeihuaRecite } from "@/components/games/feihua/FeihuaRecite";
import { chooseFeihuaOption, createFeihuaReciteState, createFeihuaState, createFeihuaThemeState, getFeihuaReciteStars, getFeihuaStars, isFeihuaComplete, nextFeihuaLine, submitFeihuaRecite, type FeihuaMode, type FeihuaReciteState, type FeihuaState } from "@/lib/feihua";
import type { FeihuaData, FeihuaTier } from "@/lib/feihuaTypes";

const data = feihuaJson as FeihuaData;

type View =
  | { kind: "select" }
  | { kind: "play"; state: FeihuaState }
  | { kind: "recite"; state: FeihuaReciteState }
  | { kind: "result"; state: FeihuaState; stars: number; persisted: boolean }
  | { kind: "recite-result"; state: FeihuaReciteState; stars: number; persisted: boolean };

export function FeihuaGame() {
  const { progress, record } = useFeihuaProgress();
  const [tier, setTier] = useState<FeihuaTier>("basic");
  const [mode, setMode] = useState<FeihuaMode>("fill");
  const [view, setView] = useState<View>({ kind: "select" });
  const attempts = useRef(new Map<string, number>());
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    if (!moved.current) return;
    if (view.kind === "play" || view.kind === "recite") {
      document.getElementById("feihua-play-title")?.scrollIntoView({ block: "nearest" });
      return;
    }
    heading.current?.focus();
    heading.current?.scrollIntoView({ block: "nearest" });
  }, [view.kind]);

  function start(id: string) {
    const attemptKey = `${mode}:${tier}:${id}`;
    const attempt = attempts.current.get(attemptKey) ?? 0;
    attempts.current.set(attemptKey, attempt + 1);
    moved.current = true;
    if (mode === "recite") setView({ kind: "recite", state: createFeihuaReciteState(data, tier, id, attempt) });
    else if (mode === "theme") setView({ kind: "play", state: createFeihuaThemeState(data, tier, id, attempt) });
    else setView({ kind: "play", state: createFeihuaState(data, tier, id, attempt) });
  }

  function exit() {
    moved.current = true;
    setView({ kind: "select" });
  }

  if (view.kind === "recite") {
    const { state } = view;
    return (
      <FeihuaRecite
        state={state}
        onSubmit={input => {
          const next = submitFeihuaRecite(state, input);
          if (!next.done) {
            setView({ kind: "recite", state: next });
            return;
          }
          const stars = getFeihuaReciteStars(next);
          const persisted = record(next.tier, next.progressId, stars, "recite");
          moved.current = true;
          setView({ kind: "recite-result", state: next, stars, persisted });
        }}
        onExit={exit}
      />
    );
  }

  if (view.kind === "play") {
    const { state } = view;
    return (
      <FeihuaPlay
        state={state}
        onChoose={char => setView({ kind: "play", state: chooseFeihuaOption(state, char) })}
        onNext={() => {
          if (!isFeihuaComplete(state)) {
            setView({ kind: "play", state: nextFeihuaLine(state) });
            return;
          }
          const stars = getFeihuaStars(state);
          const persisted = record(state.tier, state.progressId, stars, state.mode);
          moved.current = true;
          setView({ kind: "result", state, stars, persisted });
        }}
        onExit={exit}
      />
    );
  }

  if (view.kind === "result") {
    const { state } = view;
    return (
      <FeihuaResult
        ref={heading}
        keyChar={state.key}
        tier={state.tier}
        mode={state.mode}
        stars={view.stars}
        mistakes={state.mistakes}
        answers={state.answers}
        persisted={view.persisted}
        onReplay={() => start(state.mode === "theme" ? state.progressId : state.key)}
        onExit={exit}
      />
    );
  }

  if (view.kind === "recite-result") {
    const answers = view.state.turns.map(turn => ({ line: turn.line, mistakes: turn.by === "player" ? 0 : 0 }));
    return (
      <FeihuaResult
        ref={heading}
        keyChar={view.state.key}
        tier={view.state.tier}
        mode="recite"
        stars={view.stars}
        mistakes={view.state.mistakes}
        answers={answers}
        persisted={view.persisted}
        onReplay={() => start(view.state.progressId)}
        onExit={exit}
      />
    );
  }

  return <FeihuaKeySelect ref={heading} data={data} tier={tier} mode={mode} progress={progress} onTierChange={setTier} onModeChange={setMode} onStart={start} />;
}
