"use client";

import { createLocalStore } from "@/hooks/createLocalStore";
import { emptyChengyuWordleProgress, CHENGYU_WORDLE_PROGRESS_KEY, parseChengyuWordleProgress } from "@/lib/chengyuWordleProgress";

const store = createLocalStore(CHENGYU_WORDLE_PROGRESS_KEY, parseChengyuWordleProgress, emptyChengyuWordleProgress);

export function useChengyuWordleProgress() {
  return { progress: store.useStore(), save: store.set, read: store.get };
}
