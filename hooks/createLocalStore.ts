"use client";

import { useSyncExternalStore } from "react";

/** A localStorage-backed value shared by every component on the page; blocked storage falls back to memory. */
export function createLocalStore<T>(key: string, parse: (raw: string | null) => T, empty: T) {
  let value = empty;
  let lastRaw: string | null | undefined;
  let memoryOnly = false;
  const listeners = new Set<() => void>();

  function get(): T {
    if (memoryOnly) return value;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === lastRaw) return value;
      lastRaw = raw;
      value = parse(raw);
    } catch { memoryOnly = true; }
    return value;
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => { if (event.key === key || event.key === null) listener(); };
    window.addEventListener("storage", onStorage);
    return () => { listeners.delete(listener); window.removeEventListener("storage", onStorage); };
  }

  /** Returns false when the value could only be kept in memory for this page view. */
  function set(next: T): boolean {
    value = next;
    try { lastRaw = JSON.stringify(next); window.localStorage.setItem(key, lastRaw); }
    catch { memoryOnly = true; }
    listeners.forEach(listener => listener());
    return !memoryOnly;
  }

  function useStore(): T {
    return useSyncExternalStore(subscribe, get, () => empty);
  }

  return { get, set, useStore };
}
