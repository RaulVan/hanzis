"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { speak, stopSpeech } from "@/lib/speechHelper";

export function ReadAloudButton({ text, label = "朗读", className, onProgress }: { text: string; label?: string; className?: string; onProgress?: (end: number) => void }) {
  const [playing, setPlaying] = useState(false);
  const request = useRef(0);
  useEffect(() => () => { request.current += 1; stopSpeech(); }, [text]);

  async function handlePlay() {
    if (playing) { request.current += 1; stopSpeech(); setPlaying(false); return; }
    const current = ++request.current;
    onProgress?.(0);
    setPlaying(true);
    try { await speak(text, { rate: 0.8, lang: "zh-CN", onProgress: onProgress ? end => { if (current === request.current) onProgress(end); } : undefined }); }
    catch (error) {
      if (current === request.current && (!(error instanceof Error) || error.name !== "AbortError")) {
        toast.error(error instanceof Error ? error.message : "朗读失败，请检查设备的中文语音设置。");
      }
    } finally { if (current === request.current) setPlaying(false); }
  }

  return <Button variant="outline" onClick={handlePlay} aria-pressed={playing} className={className} title="使用设备的中文语音，发音因设备而异">{playing ? <Square aria-hidden="true" /> : <Volume2 aria-hidden="true" />}{playing ? "停止朗读" : label}</Button>;
}
