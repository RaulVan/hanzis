import type { FeihuaMode } from "@/lib/feihua";
import type { FeihuaTier } from "@/lib/feihuaTypes";
import { MAX_STARS } from "@/lib/gameStars";

export const FEIHUA_PROGRESS_KEY = "hanzis-games-feihua-v1";

/** Best stars per fill `tier:key`, recite `recite:tier:key`, or theme `theme:tier:id`. */
export type FeihuaProgress = Readonly<Record<string, number>>;
export const emptyFeihuaProgress: FeihuaProgress = Object.freeze({});

export function feihuaProgressKey(tier: FeihuaTier, key: string, mode: FeihuaMode = "fill") {
  if (mode === "fill") return `${tier}:${key}`;
  return `${mode}:${tier}:${key}`;
}

export function parseFeihuaProgress(raw: string | null, keys: readonly string[], themeIds: readonly string[] = []): FeihuaProgress {
  if (!raw) return emptyFeihuaProgress;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return emptyFeihuaProgress;
    const tiers = ["basic", "advanced"] as const;
    const valid = new Set([
      ...tiers.flatMap(tier => keys.map(key => feihuaProgressKey(tier, key))),
      ...tiers.flatMap(tier => keys.map(key => feihuaProgressKey(tier, key, "recite"))),
      ...tiers.flatMap(tier => themeIds.map(id => feihuaProgressKey(tier, id, "theme"))),
    ]);
    return Object.fromEntries(Object.entries(value).filter(([id, stars]) => valid.has(id) && Number.isInteger(stars) && stars >= 1 && stars <= MAX_STARS));
  } catch {
    return emptyFeihuaProgress;
  }
}

export function recordFeihuaRound(progress: FeihuaProgress, tier: FeihuaTier, key: string, stars: number, mode: FeihuaMode = "fill"): FeihuaProgress {
  const id = feihuaProgressKey(tier, key, mode);
  return { ...progress, [id]: Math.max(progress[id] ?? 0, stars) };
}
