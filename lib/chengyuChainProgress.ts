import { CHENGYU_CHAIN_CONTENT_VERSION } from "@/data/chengyuChains";
import { MAX_STARS } from "@/lib/gameStars";

export const CHENGYU_CHAIN_PROGRESS_KEY = `hanzis-games-chengyu-chain-v${CHENGYU_CHAIN_CONTENT_VERSION}`;

/** Best stars per chain id. */
export type ChengyuChainProgress = Readonly<Record<string, number>>;
export const emptyChengyuChainProgress: ChengyuChainProgress = Object.freeze({});

export function parseChengyuChainProgress(raw: string | null, ids: readonly string[]): ChengyuChainProgress {
  if (!raw) return emptyChengyuChainProgress;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return emptyChengyuChainProgress;
    const valid = new Set(ids);
    return Object.fromEntries(Object.entries(value).filter(([id, stars]) => valid.has(id) && Number.isInteger(stars) && stars >= 1 && stars <= MAX_STARS));
  } catch {
    return emptyChengyuChainProgress;
  }
}

export function recordChengyuChainRound(progress: ChengyuChainProgress, id: string, stars: number): ChengyuChainProgress {
  return { ...progress, [id]: Math.max(progress[id] ?? 0, stars) };
}
