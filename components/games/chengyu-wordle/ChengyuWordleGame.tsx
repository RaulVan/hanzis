"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import wordleJson from "@/data/chengyuWordle.json";
import { ChengyuWordlePlay } from "@/components/games/chengyu-wordle/ChengyuWordlePlay";
import { ChengyuWordleResult } from "@/components/games/chengyu-wordle/ChengyuWordleResult";
import { useChengyuWordleProgress } from "@/hooks/useChengyuWordleProgress";
import {
  answerForDate,
  answerForPractice,
  chengyuWordleDate,
  createChengyuWordleState,
  indexChengyuDictionary,
  isChengyuWordleDate,
  revealChengyuInitial,
  showChengyuExplanation,
  submitChengyuGuess,
  type ChengyuWordleState,
} from "@/lib/chengyuWordle";
import { recordChengyuWordleRound, type ChengyuWordleRound } from "@/lib/chengyuWordleProgress";
import type { ChengyuWordleData } from "@/scripts/prepare-chengyu-wordle";

const data = wordleJson as ChengyuWordleData;

function restoreRound(state: ChengyuWordleState, round: ChengyuWordleRound, dictionary: ReturnType<typeof indexChengyuDictionary>) {
  let next = state;
  for (const word of round.guesses) next = submitChengyuGuess(next, word, dictionary);
  return { ...next, hints: round.hints, explanationShown: round.explanationShown, revealed: round.revealed };
}

export function ChengyuWordleGame() {
  const params = useSearchParams();
  const router = useRouter();
  const { progress, save, read } = useChengyuWordleProgress();
  const practiceSeed = params.get("practice");
  const requested = params.get("d");
  const date = requested && isChengyuWordleDate(requested) ? requested : chengyuWordleDate();
  const practice = Boolean(practiceSeed);
  const puzzleKey = practice ? `practice:${practiceSeed}` : date;
  const dictionary = useMemo(() => indexChengyuDictionary(data.dictionary), []);
  const [session, setSession] = useState<{ key: string; state: ChengyuWordleState; persisted: boolean } | null>(null);
  const answer = practice ? answerForPractice(data, practiceSeed ?? "practice") : answerForDate(data, date);
  const created = createChengyuWordleState(answer, practice ? (practiceSeed ?? "practice") : date, practice);
  const saved = practice ? undefined : progress.rounds[date];
  const active = session?.key === puzzleKey
    ? session
    : { key: puzzleKey, state: saved ? restoreRound(created, saved, dictionary) : created, persisted: true };

  useEffect(() => {
    if (!active.state.done) return;
    const title = document.getElementById("chengyu-wordle-result-title");
    if (title instanceof HTMLElement) {
      title.focus();
      title.scrollIntoView({ block: "nearest" });
    }
  }, [active.state.done, active.state.guesses.length]);

  function commit(next: ChengyuWordleState) {
    const round: ChengyuWordleRound = {
      date: next.date,
      guesses: next.guesses.map(guess => guess.word),
      hints: next.hints,
      explanationShown: next.explanationShown,
      revealed: [...next.revealed],
      won: next.won,
    };
    const persisted = next.practice ? true : save(recordChengyuWordleRound(read(), round, chengyuWordleDate()));
    setSession({ key: puzzleKey, state: next, persisted });
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <ChengyuWordlePlay
        state={active.state}
        streak={progress.streak}
        onSubmit={input => commit(submitChengyuGuess(active.state, input, dictionary))}
        onExplanation={() => commit(showChengyuExplanation(active.state))}
        onInitial={() => commit(revealChengyuInitial(active.state))}
        onPractice={() => router.push(`/games/chengyu-wordle/?practice=${Date.now().toString(36)}`)}
        onToday={() => router.push("/games/chengyu-wordle/")}
      />
      {active.state.done && <ChengyuWordleResult state={active.state} streak={progress.streak} persisted={active.persisted} />}
    </div>
  );
}
