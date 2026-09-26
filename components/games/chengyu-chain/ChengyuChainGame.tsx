"use client";

import { useEffect, useRef, useState } from "react";
import { chengyuChains } from "@/data/chengyuChains";
import { ChengyuChainPlay } from "@/components/games/chengyu-chain/ChengyuChainPlay";
import { ChengyuChainResult } from "@/components/games/chengyu-chain/ChengyuChainResult";
import { ChengyuChainSelect } from "@/components/games/chengyu-chain/ChengyuChainSelect";
import { useChengyuChainProgress } from "@/hooks/useChengyuChainProgress";
import { chooseChengyuOption, createChengyuChainState, getChengyuChainStars, hintChengyuChain, type ChengyuChainState } from "@/lib/chengyuChain";

type View =
  | { kind: "select" }
  | { kind: "play"; state: ChengyuChainState }
  | { kind: "result"; state: ChengyuChainState; stars: number; persisted: boolean };

export function ChengyuChainGame() {
  const { progress, record } = useChengyuChainProgress();
  const [difficulty, setDifficulty] = useState<(typeof chengyuChains)[number]["difficulty"]>("beginner");
  const [view, setView] = useState<View>({ kind: "select" });
  const attempts = useRef(new Map<string, number>());
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    if (!moved.current || view.kind === "play") return;
    heading.current?.focus();
    heading.current?.scrollIntoView({ block: "nearest" });
  }, [view.kind]);

  function start(id: string) {
    const chain = chengyuChains.find(item => item.id === id);
    if (!chain) return;
    const attempt = attempts.current.get(id) ?? 0;
    attempts.current.set(id, attempt + 1);
    moved.current = true;
    setView({ kind: "play", state: createChengyuChainState(chain, attempt) });
  }

  function apply(state: ChengyuChainState) {
    if (!state.done) {
      setView({ kind: "play", state });
      return;
    }
    const stars = getChengyuChainStars(state);
    const persisted = record(state.chain.id, stars);
    moved.current = true;
    setView({ kind: "result", state, stars, persisted });
  }

  if (view.kind === "play") {
    return (
      <ChengyuChainPlay
        state={view.state}
        onChoose={option => apply(chooseChengyuOption(view.state, option))}
        onHint={() => apply(hintChengyuChain(view.state))}
        onExit={() => { moved.current = true; setView({ kind: "select" }); }}
      />
    );
  }

  if (view.kind === "result") {
    return (
      <ChengyuChainResult
        ref={heading}
        state={view.state}
        stars={view.stars}
        persisted={view.persisted}
        onReplay={() => start(view.state.chain.id)}
        onExit={() => { moved.current = true; setView({ kind: "select" }); }}
      />
    );
  }

  return <ChengyuChainSelect ref={heading} difficulty={difficulty} progress={progress} onDifficultyChange={setDifficulty} onStart={start} />;
}
