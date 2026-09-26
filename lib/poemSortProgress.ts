import { MAX_STARS } from "@/lib/gameStars";

export const POEM_SORT_PROGRESS_KEY = "hanzis-games-poem-sort-v1";

/** Best stars per poem slug. */
export type PoemSortProgress = Readonly<Record<string, number>>;
export const emptyPoemSortProgress: PoemSortProgress = Object.freeze({});

export function parsePoemSortProgress(raw: string | null, slugs: readonly string[]): PoemSortProgress {
  if (!raw) return emptyPoemSortProgress;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return emptyPoemSortProgress;
    const valid = new Set(slugs);
    return Object.fromEntries(Object.entries(value).filter(([id, stars]) => valid.has(id) && Number.isInteger(stars) && stars >= 1 && stars <= MAX_STARS));
  } catch {
    return emptyPoemSortProgress;
  }
}

export function recordPoemSortRound(progress: PoemSortProgress, slug: string, stars: number): PoemSortProgress {
  return { ...progress, [slug]: Math.max(progress[slug] ?? 0, stars) };
}
