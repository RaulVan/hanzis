"use client";

import { useSyncExternalStore } from "react";
import { poems } from "@/data/poems";

const key = "hanzis-poetry-favorites-v1";
const validSlugs = new Set(poems.map(poem => poem.slug));
const isValidSlug = (slug: string) => validSlugs.has(slug) || /^haitang-[1-9]\d{0,9}$/.test(slug);
const empty: readonly string[] = [];
let favorites: readonly string[] = empty;
let lastRaw: string | null | undefined;
let memoryOnly = false;
const listeners = new Set<() => void>();

function getSnapshot(): readonly string[] {
  if (memoryOnly) return favorites;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === lastRaw) return favorites;
    lastRaw = raw;
    const value: unknown = raw ? JSON.parse(raw) : [];
    favorites = Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === "string" && isValidSlug(id)))] : empty;
  } catch { memoryOnly = true; }
  return favorites;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => { if (event.key === key || event.key === null) listener(); };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(listener); window.removeEventListener("storage", onStorage); };
}

export function usePoetryFavorites() {
  const slugs = useSyncExternalStore(subscribe, getSnapshot, () => empty);
  function toggle(slug: string): boolean {
    if (!isValidSlug(slug)) return false;
    const current = getSnapshot();
    favorites = current.includes(slug) ? current.filter(id => id !== slug) : [...current, slug];
    try { lastRaw = JSON.stringify(favorites); window.localStorage.setItem(key, lastRaw); }
    catch { memoryOnly = true; }
    listeners.forEach(listener => listener());
    return !memoryOnly;
  }
  return { favorites: slugs, toggle };
}
