"use client";

import feihuaJson from "@/data/feihuaLines.json";
import { createLocalStore } from "@/hooks/createLocalStore";
import { emptyFeihuaProgress, FEIHUA_PROGRESS_KEY, parseFeihuaProgress, recordFeihuaRound } from "@/lib/feihuaProgress";
import type { FeihuaTier } from "@/lib/feihuaTypes";

const store = createLocalStore(FEIHUA_PROGRESS_KEY, raw => parseFeihuaProgress(raw, feihuaJson.keys), emptyFeihuaProgress);

export function useFeihuaProgress() {
  const progress = store.useStore();
  return { progress, record: (tier: FeihuaTier, key: string, stars: number) => store.set(recordFeihuaRound(store.get(), tier, key, stars)) };
}
