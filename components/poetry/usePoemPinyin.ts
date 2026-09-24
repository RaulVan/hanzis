"use client";
import { useEffect, useState } from "react";
import { type Poem, poemText } from "@/data/poems";
import { getPoetryPinyin } from "@/lib/poetryPinyinData";
import type { PoetryPinyinEntry } from "@/lib/poetryPinyin";

type State = { status: "idle" | "loading" | "error"; entry?: undefined } | { status: "ready"; entry: PoetryPinyinEntry };
export function usePoemPinyin(poem: Poem, enabled: boolean) {
  const [loaded, setLoaded] = useState<{ key: string; state: State } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const text = poemText(poem);
  const imported = Boolean(poem.haitang);
  const key = `${poem.slug}:${text}:${attempt}`;
  const state: State = !enabled || !imported ? { status: "idle" } : loaded?.key === key ? loaded.state : { status: "loading" };
  useEffect(() => {
    if (!imported || !enabled) return;
    let active = true;
    getPoetryPinyin(poem.slug, text).then(entry => {
      if (active) setLoaded({ key, state: { status: "ready", entry } });
    }).catch(() => { if (active) setLoaded({ key, state: { status: "error" } }); });
    return () => { active = false; };
  }, [imported, enabled, poem.slug, text, key]);
  return { ...state, retry: () => setAttempt(value => value + 1) };
}
