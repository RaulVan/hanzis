import { CHENGYU_WORDLE_TRIES } from "@/lib/chengyuWordle";

export const CHENGYU_WORDLE_PROGRESS_KEY = "hanzis-games-chengyu-wordle-v1";

export interface ChengyuWordleRound {
  date: string;
  guesses: string[];
  hints: number;
  explanationShown: boolean;
  revealed: number[];
  won: boolean;
  gaveUp: boolean;
}

export interface ChengyuWordleProgress {
  streak: number;
  best: number;
  lastSolved: string | null;
  rounds: Readonly<Record<string, ChengyuWordleRound>>;
}

export const emptyChengyuWordleProgress: ChengyuWordleProgress = Object.freeze({ streak: 0, best: 0, lastSolved: null, rounds: Object.freeze({}) });

function previousDate(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, date));
  value.setUTCDate(value.getUTCDate() - 1);
  return value.toISOString().slice(0, 10);
}

function parseRound(date: string, value: unknown): ChengyuWordleRound | null {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(date) || !value || typeof value !== "object") return null;
  const round = value as Partial<ChengyuWordleRound>;
  if (!Array.isArray(round.guesses) || round.guesses.length > CHENGYU_WORDLE_TRIES || round.guesses.some(word => typeof word !== "string" || !/^\p{Script=Han}{4}$/u.test(word))) return null;
  if (!Number.isInteger(round.hints) || (round.hints ?? -1) < 0 || (round.hints ?? 0) > 8) return null;
  if (typeof round.explanationShown !== "boolean" || typeof round.won !== "boolean") return null;
  if (!Array.isArray(round.revealed) || round.revealed.some(index => !Number.isInteger(index) || index < 0 || index > 3)) return null;
  return { date, guesses: [...round.guesses], hints: round.hints ?? 0, explanationShown: round.explanationShown, revealed: [...round.revealed], won: round.won, gaveUp: round.gaveUp === true };
}

export function parseChengyuWordleProgress(raw: string | null): ChengyuWordleProgress {
  if (!raw) return emptyChengyuWordleProgress;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return emptyChengyuWordleProgress;
    const saved = value as Partial<ChengyuWordleProgress>;
    const streak = Number.isInteger(saved.streak) && (saved.streak ?? 0) >= 0 ? saved.streak ?? 0 : 0;
    const best = Number.isInteger(saved.best) && (saved.best ?? 0) >= 0 ? saved.best ?? 0 : 0;
    const lastSolved = typeof saved.lastSolved === "string" && /^\d{4}-\d{2}-\d{2}$/u.test(saved.lastSolved) ? saved.lastSolved : null;
    const rounds = saved.rounds && typeof saved.rounds === "object"
      ? Object.fromEntries(Object.entries(saved.rounds).flatMap(([date, round]) => {
        const parsed = parseRound(date, round);
        return parsed ? [[date, parsed]] : [];
      }).slice(0, 500))
      : {};
    return { streak, best, lastSolved, rounds };
  } catch {
    return emptyChengyuWordleProgress;
  }
}

/** Streak advances only when today's puzzle is solved, and only once. */
export function recordChengyuWordleRound(progress: ChengyuWordleProgress, round: ChengyuWordleRound, today: string): ChengyuWordleProgress {
  const rounds = { ...progress.rounds, [round.date]: round };
  if (!round.won || round.date !== today || progress.lastSolved === today) return { ...progress, rounds };
  const streak = progress.lastSolved === previousDate(today) ? progress.streak + 1 : 1;
  return { streak, best: Math.max(progress.best, streak), lastSolved: today, rounds };
}
