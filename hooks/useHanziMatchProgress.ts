"use client";

import { useSyncExternalStore } from "react";
import {
  emptyHanziMatchProgress,
  HANZI_MATCH_PROGRESS_KEY,
  parseHanziMatchProgress,
  recordHanziMatchCompletion,
  type HanziMatchCompletion,
  type HanziMatchProgress,
} from "@/lib/hanziMatchProgress";

let progress: HanziMatchProgress = emptyHanziMatchProgress;
let lastRaw: string | null | undefined;
let memoryOnly = false;
const listeners = new Set<() => void>();

function getSnapshot(): HanziMatchProgress {
  if (memoryOnly) return progress;
  try {
    const raw = window.localStorage.getItem(HANZI_MATCH_PROGRESS_KEY);
    if (raw === lastRaw) return progress;
    lastRaw = raw;
    progress = parseHanziMatchProgress(raw);
  } catch { memoryOnly = true; }
  return progress;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => { if (event.key === HANZI_MATCH_PROGRESS_KEY || event.key === null) listener(); };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(listener); window.removeEventListener("storage", onStorage); };
}

/** Local-only progress; when storage is blocked results stay in memory for this page view. */
export function useHanziMatchProgress() {
  const current = useSyncExternalStore(subscribe, getSnapshot, () => emptyHanziMatchProgress);
  function record(completion: HanziMatchCompletion): boolean {
    progress = recordHanziMatchCompletion(getSnapshot(), completion);
    try { lastRaw = JSON.stringify(progress); window.localStorage.setItem(HANZI_MATCH_PROGRESS_KEY, lastRaw); }
    catch { memoryOnly = true; }
    listeners.forEach(listener => listener());
    return !memoryOnly;
  }
  return { progress: current, record };
}
