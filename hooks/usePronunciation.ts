"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getPinyinAudioSource } from "@/lib/pinyinAudio";
import { speakPinyin, stopSpeech } from "@/lib/speechHelper";

export type PronunciationItem = { pinyin: string; char: string };

export function usePronunciation() {
  const pathname = usePathname();
  const request = useRef(0);
  const previous = useRef<{ key: string; items: PronunciationItem[] } | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [source, setSource] = useState("");
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    request.current += 1;
    stopSpeech();
    setActiveKey(null);
    setError(null);
  }, []);

  useEffect(() => () => { request.current += 1; stopSpeech(); }, [pathname]);

  const play = useCallback(async (key: string, items: PronunciationItem[]) => {
    const current = ++request.current;
    stopSpeech();
    previous.current = { key, items };
    setActiveKey(key);
    setError(null);
    try {
      for (const item of items) {
        if (current !== request.current) return;
        setSource(getPinyinAudioSource(item.pinyin));
        await speakPinyin(item.pinyin, item.char);
      }
    } catch (error) {
      if (current === request.current && (!(error instanceof Error) || error.name !== "AbortError")) {
        setError(error instanceof Error ? error.message : "声音播放失败，请重试。");
      }
    } finally {
      if (current === request.current) setActiveKey(null);
    }
  }, []);

  const retry = () => { if (previous.current) void play(previous.current.key, previous.current.items); };
  return { activeKey, source, error, play, stop, retry };
}
