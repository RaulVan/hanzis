"use client";

import { createLocalStore } from "@/hooks/createLocalStore";
import { poemSortCatalog } from "@/lib/poemSort";
import { emptyPoemSortProgress, parsePoemSortProgress, POEM_SORT_PROGRESS_KEY, recordPoemSortRound } from "@/lib/poemSortProgress";

const slugs = poemSortCatalog.map(level => level.slug);
const store = createLocalStore(POEM_SORT_PROGRESS_KEY, raw => parsePoemSortProgress(raw, slugs), emptyPoemSortProgress);

export function usePoemSortProgress() {
  const progress = store.useStore();
  return { progress, record: (slug: string, stars: number) => store.set(recordPoemSortRound(store.get(), slug, stars)) };
}
