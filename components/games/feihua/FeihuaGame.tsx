"use client";

import { useEffect, useRef, useState } from "react";
import feihuaJson from "@/data/feihuaLines.json";
import { FeihuaKeySelect } from "@/components/games/feihua/FeihuaKeySelect";
import { FeihuaPlay } from "@/components/games/feihua/FeihuaPlay";
import { FeihuaResult } from "@/components/games/feihua/FeihuaResult";
import { useFeihuaProgress } from "@/hooks/useFeihuaProgress";
import { chooseFeihuaOption, createFeihuaState, getFeihuaStars, isFeihuaComplete, nextFeihuaLine, type FeihuaState } from "@/lib/feihua";
import type { FeihuaData, FeihuaTier } from "@/lib/feihuaTypes";

const data = feihuaJson as FeihuaData;

type View =
  | { kind: "select" }
  | { kind: "play"; state: FeihuaState }
  | { kind: "result"; state: FeihuaState; stars: number; persisted: boolean };

export function FeihuaGame() {
  const { progress, record } = useFeihuaProgress();
  const [tier, setTier] = useState<FeihuaTier>("basic");
  const [view, setView] = useState<View>({ kind: "select" });
  const attempts = useRef(new Map<string, number>());
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    if (!moved.current) return;
    if (view.kind === "play") {
      document.getElementById("feihua-play-title")?.scrollIntoView({ block: "nearest" });
      return;
    }
    heading.current?.focus();
    heading.current?.scrollIntoView({ block: "nearest" });
  }, [view.kind]);

  function start(key: string) {
    const id = `${tier}:${key}`;
    const attempt = attempts.current.get(id) ?? 0;
    attempts.current.set(id, attempt + 1);
    moved.current = true;
    setView({ kind: "play", state: createFeihuaState(data, tier, key, attempt) });
  }

  function exit() {
    moved.current = true;
    setView({ kind: "select" });
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
          const persisted = record(state.tier, state.key, stars);
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
        stars={view.stars}
        mistakes={state.mistakes}
        answers={state.answers}
        persisted={view.persisted}
        onReplay={() => start(state.key)}
        onExit={exit}
      />
    );
  }

  return <FeihuaKeySelect ref={heading} data={data} tier={tier} progress={progress} onTierChange={setTier} onStart={start} />;
}
