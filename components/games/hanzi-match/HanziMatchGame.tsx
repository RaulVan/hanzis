"use client";

import { useEffect, useRef, useState } from "react";
import { HanziMatchLevelSelect } from "@/components/games/hanzi-match/HanziMatchLevelSelect";
import { HanziMatchPlay } from "@/components/games/hanzi-match/HanziMatchPlay";
import { HanziMatchResult } from "@/components/games/hanzi-match/HanziMatchResult";
import type { HanziMatchDifficulty, HanziMatchLevel } from "@/data/hanziMatchLevels";
import { useHanziMatchProgress } from "@/hooks/useHanziMatchProgress";
import {
  applyHanziMatchHint,
  createHanziMatchState,
  getHanziMatchStars,
  isHanziMatchComplete,
  selectHanziMatchTile,
  type HanziMatchState,
} from "@/lib/hanziMatch";
import { getNextHanziMatchLevel, type HanziMatchCompletion } from "@/lib/hanziMatchProgress";

type View =
  | { kind: "select" }
  | { kind: "play"; level: HanziMatchLevel; state: HanziMatchState }
  | { kind: "result"; level: HanziMatchLevel; completion: HanziMatchCompletion; persisted: boolean };

export function HanziMatchGame() {
  const { progress, record } = useHanziMatchProgress();
  const [difficulty, setDifficulty] = useState<HanziMatchDifficulty>("beginner");
  const [view, setView] = useState<View>({ kind: "select" });
  const attempts = useRef(new Map<string, number>());
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const viewKey = view.kind === "select" ? "select" : `${view.kind}:${view.level.id}`;

  useEffect(() => {
    if (!moved.current) return;
    heading.current?.focus();
    heading.current?.scrollIntoView({ block: "nearest" });
  }, [viewKey]);

  function start(level: HanziMatchLevel) {
    const attempt = attempts.current.get(level.id) ?? 0;
    attempts.current.set(level.id, attempt + 1);
    moved.current = true;
    setDifficulty(level.difficulty);
    setView({ kind: "play", level, state: createHanziMatchState(level, attempt) });
  }

  function exit() {
    moved.current = true;
    setView({ kind: "select" });
  }

  function update(level: HanziMatchLevel, next: HanziMatchState) {
    if (!isHanziMatchComplete(level, next)) {
      setView({ kind: "play", level, state: next });
      return;
    }
    const completion: HanziMatchCompletion = {
      levelId: level.id,
      stars: getHanziMatchStars(next.mistakes, next.hints),
      mistakes: next.mistakes,
      hints: next.hints,
      review: next.review,
    };
    const persisted = record(completion);
    moved.current = true;
    setView({ kind: "result", level, completion, persisted });
  }

  if (view.kind === "play") {
    const { level, state } = view;
    return (
      <HanziMatchPlay
        ref={heading}
        level={level}
        state={state}
        onSelect={tileId => update(level, selectHanziMatchTile(level, state, tileId))}
        onHint={() => update(level, applyHanziMatchHint(level, state))}
        onRestart={() => start(level)}
        onExit={exit}
      />
    );
  }

  if (view.kind === "result") {
    const nextLevel = getNextHanziMatchLevel(view.level);
    return (
      <HanziMatchResult
        ref={heading}
        level={view.level}
        completion={view.completion}
        persisted={view.persisted}
        nextLevel={nextLevel}
        onNext={() => nextLevel && start(nextLevel)}
        onReplay={() => start(view.level)}
        onExit={exit}
      />
    );
  }

  return <HanziMatchLevelSelect ref={heading} difficulty={difficulty} progress={progress} onDifficultyChange={setDifficulty} onStart={start} />;
}
