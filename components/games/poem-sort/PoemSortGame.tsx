"use client";

import { useEffect, useRef, useState } from "react";
import { PoemSortPlay } from "@/components/games/poem-sort/PoemSortPlay";
import { PoemSortResult } from "@/components/games/poem-sort/PoemSortResult";
import { PoemSortSelect } from "@/components/games/poem-sort/PoemSortSelect";
import { usePoemSortProgress } from "@/hooks/usePoemSortProgress";
import { choosePoemSortTile, createPoemSortState, getPoemSortStars, hintPoemSort, poemSortCatalog, type PoemSortDifficulty, type PoemSortState } from "@/lib/poemSort";

type View =
  | { kind: "select" }
  | { kind: "play"; state: PoemSortState }
  | { kind: "result"; state: PoemSortState; stars: number; persisted: boolean };

export function PoemSortGame() {
  const { progress, record } = usePoemSortProgress();
  const [difficulty, setDifficulty] = useState<PoemSortDifficulty>("beginner");
  const [view, setView] = useState<View>({ kind: "select" });
  const attempts = useRef(new Map<string, number>());
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    if (!moved.current || view.kind === "play") return;
    heading.current?.focus();
    heading.current?.scrollIntoView({ block: "nearest" });
  }, [view.kind]);

  function start(slug: string) {
    const level = poemSortCatalog.find(item => item.slug === slug);
    if (!level) return;
    const attempt = attempts.current.get(slug) ?? 0;
    attempts.current.set(slug, attempt + 1);
    moved.current = true;
    setView({ kind: "play", state: createPoemSortState(level, attempt) });
  }

  function apply(state: PoemSortState) {
    if (!state.done) {
      setView({ kind: "play", state });
      return;
    }
    const stars = getPoemSortStars(state);
    const persisted = record(state.level.slug, stars);
    moved.current = true;
    setView({ kind: "result", state, stars, persisted });
  }

  if (view.kind === "play") {
    return (
      <PoemSortPlay
        state={view.state}
        onChoose={tileIndex => apply(choosePoemSortTile(view.state, tileIndex))}
        onHint={() => apply(hintPoemSort(view.state))}
        onExit={() => { moved.current = true; setView({ kind: "select" }); }}
      />
    );
  }

  if (view.kind === "result") {
    return (
      <PoemSortResult
        ref={heading}
        level={view.state.level}
        stars={view.stars}
        mistakes={view.state.mistakes}
        hints={view.state.hints}
        persisted={view.persisted}
        onReplay={() => start(view.state.level.slug)}
        onExit={() => { moved.current = true; setView({ kind: "select" }); }}
      />
    );
  }

  return <PoemSortSelect ref={heading} difficulty={difficulty} progress={progress} onDifficultyChange={setDifficulty} onStart={start} />;
}
