"use client";

import { createLocalStore } from "@/hooks/createLocalStore";
import {
  emptyPinyinQuizProgress,
  parsePinyinQuizProgress,
  PINYIN_QUIZ_PROGRESS_KEY,
  recordPinyinQuizRound,
  type PinyinQuizBest,
  type PinyinQuizSettings,
} from "@/lib/pinyinQuizProgress";

const store = createLocalStore(PINYIN_QUIZ_PROGRESS_KEY, parsePinyinQuizProgress, emptyPinyinQuizProgress);

export function usePinyinQuizProgress() {
  const progress = store.useStore();
  return {
    progress,
    record: (settings: PinyinQuizSettings, round: PinyinQuizBest) => store.set(recordPinyinQuizRound(store.get(), settings, round)),
  };
}
