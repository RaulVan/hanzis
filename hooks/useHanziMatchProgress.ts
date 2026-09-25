"use client";

import { createLocalStore } from "@/hooks/createLocalStore";
import {
  emptyHanziMatchProgress,
  HANZI_MATCH_PROGRESS_KEY,
  parseHanziMatchProgress,
  recordHanziMatchCompletion,
  type HanziMatchCompletion,
} from "@/lib/hanziMatchProgress";

const store = createLocalStore(HANZI_MATCH_PROGRESS_KEY, parseHanziMatchProgress, emptyHanziMatchProgress);

export function useHanziMatchProgress() {
  const progress = store.useStore();
  return { progress, record: (completion: HanziMatchCompletion) => store.set(recordHanziMatchCompletion(store.get(), completion)) };
}
