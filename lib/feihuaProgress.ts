import type { FeihuaTier } from "@/lib/feihuaTypes";
import { MAX_STARS } from "@/lib/gameStars";

export const FEIHUA_PROGRESS_KEY = "hanzis-games-feihua-v1";

/** Best stars per `tier:key`. */
export type FeihuaProgress = Readonly<Record<string, number>>;
export const emptyFeihuaProgress: FeihuaProgress = Object.freeze({});

export const feihuaProgressKey = (tier: FeihuaTier, key: string) => `${tier}:${key}`;

export function parseFeihuaProgress(raw: string | null, keys: readonly string[]): FeihuaProgress {
  if (!raw) return emptyFeihuaProgress;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return emptyFeihuaProgress;
    const valid = new Set((["basic", "advanced"] as const).flatMap(tier => keys.map(key => feihuaProgressKey(tier, key))));
    return Object.fromEntries(Object.entries(value).filter(([id, stars]) => valid.has(id) && Number.isInteger(stars) && stars >= 1 && stars <= MAX_STARS));
  } catch {
    return emptyFeihuaProgress;
  }
}

export function recordFeihuaRound(progress: FeihuaProgress, tier: FeihuaTier, key: string, stars: number): FeihuaProgress {
  const id = feihuaProgressKey(tier, key);
  return { ...progress, [id]: Math.max(progress[id] ?? 0, stars) };
}
