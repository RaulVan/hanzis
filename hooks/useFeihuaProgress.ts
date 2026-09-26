"use client";

import feihuaJson from "@/data/feihuaLines.json";
import { createLocalStore } from "@/hooks/createLocalStore";
import { FEIHUA_THEMES, type FeihuaMode } from "@/lib/feihua";
import { emptyFeihuaProgress, FEIHUA_PROGRESS_KEY, parseFeihuaProgress, recordFeihuaRound } from "@/lib/feihuaProgress";
import type { FeihuaTier } from "@/lib/feihuaTypes";

const themeIds = FEIHUA_THEMES.map(theme => theme.id);
const store = createLocalStore(FEIHUA_PROGRESS_KEY, raw => parseFeihuaProgress(raw, feihuaJson.keys, themeIds), emptyFeihuaProgress);

export function useFeihuaProgress() {
  const progress = store.useStore();
  return {
    progress,
    record: (tier: FeihuaTier, key: string, stars: number, mode: FeihuaMode = "fill") => store.set(recordFeihuaRound(store.get(), tier, key, stars, mode)),
  };
}
