"use client";

import { useEffect, useRef, useState } from "react";
import { PinyinQuizPlay } from "@/components/games/pinyin-quiz/PinyinQuizPlay";
import { PinyinQuizResult } from "@/components/games/pinyin-quiz/PinyinQuizResult";
import { PinyinQuizSetup } from "@/components/games/pinyin-quiz/PinyinQuizSetup";
import { pinyinQuizCharacters, pinyinQuizWords } from "@/data/pinyinQuizItems";
import { usePinyinQuizProgress } from "@/hooks/usePinyinQuizProgress";
import {
  createPinyinQuizState,
  isPinyinQuizExhausted,
  pinyinQuizReview,
  pinyinQuizScore,
  skipPinyinQuizItem,
  submitPinyinQuizAnswer,
  type PinyinQuizAnswer,
  type PinyinQuizState,
} from "@/lib/pinyinQuiz";
import { pinyinQuizSettingsKey, type PinyinQuizSettings } from "@/lib/pinyinQuizProgress";

type View =
  | { kind: "setup" }
  | { kind: "play"; state: PinyinQuizState; deadline: number | null }
  | { kind: "result"; score: number; bestStreak: number; answered: number; review: PinyinQuizAnswer[]; newRecord: boolean; persisted: boolean };

const secondsUntil = (deadline: number) => Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

export function PinyinQuizGame() {
  const { progress, record } = usePinyinQuizProgress();
  const [settings, setSettings] = useState<PinyinQuizSettings>({ mode: "character", toneMode: "plain", duration: 90 });
  const [view, setView] = useState<View>({ kind: "setup" });
  const [secondsLeft, setSecondsLeft] = useState(0);
  const rounds = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  function finish(state: PinyinQuizState) {
    const score = pinyinQuizScore(state);
    const previous = progress[pinyinQuizSettingsKey(settings)];
    const persisted = state.answers.length === 0 ? true : record(settings, { score, bestStreak: state.bestStreak });
    moved.current = true;
    setView({
      kind: "result",
      score,
      bestStreak: state.bestStreak,
      answered: state.answers.length,
      review: pinyinQuizReview(state),
      newRecord: score > 0 && score > (previous?.score ?? 0),
      persisted,
    });
  }

  // The timer only restarts per round, so it reads the current round and finish() through a ref.
  const latest = useRef({ view, finish });
  useEffect(() => { latest.current = { view, finish }; });
  const deadline = view.kind === "play" ? view.deadline : null;
  useEffect(() => {
    if (deadline === null) return;
    const timer = window.setInterval(() => {
      const left = secondsUntil(deadline);
      setSecondsLeft(left);
      const current = latest.current;
      if (left === 0 && current.view.kind === "play") current.finish(current.view.state);
    }, 250);
    return () => window.clearInterval(timer);
  }, [deadline]);

  useEffect(() => {
    if (!moved.current || view.kind === "play") return;
    heading.current?.focus();
    heading.current?.scrollIntoView({ block: "nearest" });
  }, [view.kind]);

  function start() {
    rounds.current += 1;
    const pool = settings.mode === "word" ? pinyinQuizWords : pinyinQuizCharacters;
    const nextDeadline = settings.duration === 0 ? null : Date.now() + settings.duration * 1000;
    setSecondsLeft(settings.duration);
    setView({ kind: "play", state: createPinyinQuizState(pool, settings.duration, Date.now() + rounds.current), deadline: nextDeadline });
  }

  function update(next: PinyinQuizState) {
    if (isPinyinQuizExhausted(next)) finish(next);
    else setView(current => current.kind === "play" ? { ...current, state: next } : current);
  }

  if (view.kind === "play") {
    return (
      <PinyinQuizPlay
        settings={settings}
        state={view.state}
        secondsLeft={view.deadline === null ? null : secondsLeft}
        onSubmit={input => update(submitPinyinQuizAnswer(view.state, input, settings.toneMode))}
        onSkip={() => update(skipPinyinQuizItem(view.state))}
        onStop={() => finish(view.state)}
      />
    );
  }

  if (view.kind === "result") {
    return (
      <PinyinQuizResult
        ref={heading}
        settings={settings}
        score={view.score}
        bestStreak={view.bestStreak}
        answered={view.answered}
        review={view.review}
        newRecord={view.newRecord}
        persisted={view.persisted}
        onReplay={start}
        onSettings={() => { moved.current = true; setView({ kind: "setup" }); }}
      />
    );
  }

  return <PinyinQuizSetup ref={heading} settings={settings} progress={progress} onChange={setSettings} onStart={start} />;
}
