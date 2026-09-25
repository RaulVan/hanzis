import { HANZI_MATCH_CONTENT_VERSION, hanziMatchLevels, type HanziMatchLevel } from "@/data/hanziMatchLevels";
import { MAX_STARS } from "@/lib/gameStars";

export const HANZI_MATCH_PROGRESS_KEY = "hanzis-games-hanzi-match-v1";
export const MAX_REVIEW_WORDS = 24;

export interface HanziMatchLevelRecord {
  stars: number;
  bestMistakes: number;
  bestHints: number;
}

export interface HanziMatchProgress {
  contentVersion: number;
  levels: Readonly<Record<string, HanziMatchLevelRecord>>;
  review: readonly string[];
}

export interface HanziMatchCompletion {
  levelId: string;
  stars: number;
  mistakes: number;
  hints: number;
  review: readonly string[];
}

export const emptyHanziMatchProgress: HanziMatchProgress = Object.freeze({
  contentVersion: HANZI_MATCH_CONTENT_VERSION,
  levels: Object.freeze({}),
  review: Object.freeze([]),
});

const levelIds = new Set(hanziMatchLevels.map(level => level.id));
const knownWords = new Set(hanziMatchLevels.flatMap(level => level.words.map(word => word.word)));
const isCount = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0;

/** Accepts only records written for the current word lists; anything else starts fresh. */
export function parseHanziMatchProgress(raw: string | null): HanziMatchProgress {
  if (!raw) return emptyHanziMatchProgress;
  try {
    const value = JSON.parse(raw) as Partial<HanziMatchProgress> | null;
    if (!value || value.contentVersion !== HANZI_MATCH_CONTENT_VERSION) return emptyHanziMatchProgress;
    const levels: Record<string, HanziMatchLevelRecord> = {};
    for (const [id, record] of Object.entries(value.levels ?? {})) {
      if (!levelIds.has(id) || !record) continue;
      const { stars, bestMistakes, bestHints } = record;
      if (isCount(stars) && stars >= 1 && stars <= MAX_STARS && isCount(bestMistakes) && isCount(bestHints)) {
        levels[id] = { stars, bestMistakes, bestHints };
      }
    }
    const review = Array.isArray(value.review)
      ? [...new Set(value.review.filter((word): word is string => typeof word === "string" && knownWords.has(word)))].slice(-MAX_REVIEW_WORDS)
      : [];
    return { contentVersion: HANZI_MATCH_CONTENT_VERSION, levels, review };
  } catch {
    return emptyHanziMatchProgress;
  }
}

/** Keeps the best result per level; words solved cleanly this time leave the review list. */
export function recordHanziMatchCompletion(progress: HanziMatchProgress, completion: HanziMatchCompletion): HanziMatchProgress {
  const level = hanziMatchLevels.find(item => item.id === completion.levelId);
  if (!level) return progress;
  const previous = progress.levels[level.id];
  const record: HanziMatchLevelRecord = {
    stars: Math.max(previous?.stars ?? 0, completion.stars),
    bestMistakes: Math.min(previous?.bestMistakes ?? Infinity, completion.mistakes),
    bestHints: Math.min(previous?.bestHints ?? Infinity, completion.hints),
  };
  const levelWords = new Set(level.words.map(word => word.word));
  const kept = progress.review.filter(word => !levelWords.has(word));
  const review = [...new Set([...kept, ...completion.review])].slice(-MAX_REVIEW_WORDS);
  return { contentVersion: HANZI_MATCH_CONTENT_VERSION, levels: { ...progress.levels, [level.id]: record }, review };
}

export function isHanziMatchLevelUnlocked(progress: HanziMatchProgress, level: HanziMatchLevel): boolean {
  if (level.number === 1) return true;
  const previous = hanziMatchLevels.find(item => item.difficulty === level.difficulty && item.number === level.number - 1);
  return Boolean(previous && progress.levels[previous.id]);
}

export function getNextHanziMatchLevel(level: HanziMatchLevel): HanziMatchLevel | undefined {
  return hanziMatchLevels.find(item => item.difficulty === level.difficulty && item.number === level.number + 1);
}
