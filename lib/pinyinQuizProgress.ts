import type { PinyinQuizMode } from "@/data/pinyinQuizItems";
import type { PinyinQuizDuration, PinyinToneMode } from "@/lib/pinyinQuiz";

export const PINYIN_QUIZ_PROGRESS_KEY = "hanzis-games-pinyin-quiz-v1";

export interface PinyinQuizSettings {
  mode: PinyinQuizMode;
  toneMode: PinyinToneMode;
  duration: PinyinQuizDuration;
}

export interface PinyinQuizBest {
  score: number;
  bestStreak: number;
}

export type PinyinQuizProgress = Readonly<Record<string, PinyinQuizBest>>;

export const emptyPinyinQuizProgress: PinyinQuizProgress = Object.freeze({});

const modes: readonly PinyinQuizMode[] = ["character", "word"];
const toneModes: readonly PinyinToneMode[] = ["plain", "toned"];
const durations: readonly PinyinQuizDuration[] = [90, 180, 0];

export function pinyinQuizSettingsKey(settings: PinyinQuizSettings): string {
  return `${settings.mode}:${settings.toneMode}:${settings.duration}`;
}

const validKeys = new Set(modes.flatMap(mode => toneModes.flatMap(toneMode => durations.map(duration => pinyinQuizSettingsKey({ mode, toneMode, duration })))));
const isCount = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0;

export function parsePinyinQuizProgress(raw: string | null): PinyinQuizProgress {
  if (!raw) return emptyPinyinQuizProgress;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return emptyPinyinQuizProgress;
    const result: Record<string, PinyinQuizBest> = {};
    for (const [key, record] of Object.entries(value)) {
      if (validKeys.has(key) && record && isCount(record.score) && isCount(record.bestStreak)) result[key] = { score: record.score, bestStreak: record.bestStreak };
    }
    return result;
  } catch {
    return emptyPinyinQuizProgress;
  }
}

export function recordPinyinQuizRound(progress: PinyinQuizProgress, settings: PinyinQuizSettings, round: PinyinQuizBest): PinyinQuizProgress {
  const key = pinyinQuizSettingsKey(settings);
  const previous = progress[key];
  return {
    ...progress,
    [key]: { score: Math.max(previous?.score ?? 0, round.score), bestStreak: Math.max(previous?.bestStreak ?? 0, round.bestStreak) },
  };
}
