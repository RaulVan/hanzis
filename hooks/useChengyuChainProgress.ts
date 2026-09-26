"use client";

import { chengyuChains } from "@/data/chengyuChains";
import { createLocalStore } from "@/hooks/createLocalStore";
import { CHENGYU_CHAIN_PROGRESS_KEY, emptyChengyuChainProgress, parseChengyuChainProgress, recordChengyuChainRound } from "@/lib/chengyuChainProgress";

const ids = chengyuChains.map(chain => chain.id);
const store = createLocalStore(CHENGYU_CHAIN_PROGRESS_KEY, raw => parseChengyuChainProgress(raw, ids), emptyChengyuChainProgress);

export function useChengyuChainProgress() {
  const progress = store.useStore();
  return { progress, record: (id: string, stars: number) => store.set(recordChengyuChainRound(store.get(), id, stars)) };
}
