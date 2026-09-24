import { getPinyinAudioUrl } from "./pinyinAudio";
import { speechBoundaryEnd, speechChunks } from "./speechProgress";

type PlaybackScope = {
  isActive: () => boolean;
  finish: (error?: Error) => void;
  cleanup: (callback: () => void) => void;
};
let cancelActive: (() => void) | null = null;

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function getChineseVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => /^zh[-_]CN$/i.test(voice.lang))
    ?? voices.find((voice) => /^(zh|cmn)([-_]|$)/i.test(voice.lang) && !/^zh[-_](HK|MO)$/i.test(voice.lang))
    ?? null;
}

/** Cancelling rejects the current promise so sequential playback cannot continue. */
export function stopSpeech(): void {
  cancelActive?.();
}

function startPlayback(setup: (scope: PlaybackScope) => Promise<void>): Promise<void> {
  stopSpeech();
  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanups: Array<() => void> = [];
    const cancel = () => finish(new DOMException("播放已停止", "AbortError"));
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      cleanups.forEach((cleanup) => cleanup());
      if (cancelActive === cancel) cancelActive = null;
      if (error) reject(error); else resolve();
    };
    cancelActive = cancel;
    void setup({
      isActive: () => !settled,
      finish,
      cleanup: (callback) => { if (settled) callback(); else cleanups.push(callback); },
    }).catch((error: unknown) => finish(error instanceof Error ? error : new Error("播放失败，请重试。")));
  });
}

function waitForVoice(synth: SpeechSynthesis, lang: string, scope: PlaybackScope): Promise<SpeechSynthesisVoice | null> {
  const selectVoice = () => /^(zh|cmn)([-_]|$)/i.test(lang) ? getChineseVoice()
    : synth.getVoices().find((voice) => voice.lang.toLowerCase().startsWith(lang.toLowerCase().split("-")[0])) ?? null;
  const available = selectVoice();
  if (available) return Promise.resolve(available);
  return new Promise((resolve) => {
    const check = () => { const voice = selectVoice(); if (voice) resolve(voice); };
    const timeout = setTimeout(() => resolve(selectVoice()), 2500);
    synth.addEventListener("voiceschanged", check);
    scope.cleanup(() => { clearTimeout(timeout); synth.removeEventListener("voiceschanged", check); resolve(null); });
  });
}

/** Uses an explicitly selected system voice and resolves only after the utterance ends. */
export function speak(text: string, options: { rate?: number; lang?: string; onProgress?: (end: number) => void } = {}): Promise<void> {
  return startPlayback(async (scope) => {
    if (!text.trim()) throw new Error("没有可以朗读的文字。");
    if (!isSpeechSupported()) throw new Error("当前浏览器不支持系统语音。拼音页仍可播放已有本地录音。");
    const synth = window.speechSynthesis;
    const lang = options.lang || "zh-CN";
    const voice = await waitForVoice(synth, lang, scope);
    if (!scope.isActive()) return;
    if (!voice) throw new Error("当前设备没有可用的中文语音，请安装系统中文语音包后重试。");
    // Progress readers use short clauses, so voices without boundary events still advance
    // on actual completion and long prose does not hit a whole-document timeout.
    const chunks = options.onProgress ? speechChunks(text) : [{ text: text.trim(), start: 0, end: text.length }];
    let dispose = () => {};
    let progress = 0;
    const report = (end: number) => {
      if (!scope.isActive() || end <= progress) return;
      progress = end; options.onProgress?.(end);
    };
    scope.cleanup(() => { dispose(); synth.cancel(); });
    for (const chunk of chunks) {
      if (!scope.isActive()) return;
      await new Promise<void>((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(chunk.text);
        utterance.voice = voice;
        utterance.lang = voice.lang || lang;
        utterance.rate = Number.isFinite(options.rate) ? Math.min(1.5, Math.max(0.5, options.rate!)) : 0.8;
        let active = true;
        const timeout = setTimeout(() => {
          reject(new Error("系统语音没有完成播放，请重试。")); dispose();
        }, Math.max(15000, Math.min(240000, Array.from(chunk.text).length * 1500 / utterance.rate)));
        dispose = () => {
          active = false; clearTimeout(timeout);
          utterance.onend = null; utterance.onerror = null; utterance.onboundary = null;
          resolve();
        };
        utterance.onboundary = (event) => {
          if (!active || !scope.isActive()) return;
          const end = speechBoundaryEnd(chunk.text, event.charIndex, event.charLength, event.name);
          if (end !== null) report(chunk.start + end);
        };
        utterance.onend = () => { if (active && scope.isActive()) { report(chunk.end); dispose(); } };
        utterance.onerror = (event) => {
          if (!active || !scope.isActive()) return;
          reject(new Error(event.error === "not-allowed" ? "浏览器未允许播放声音，请点击朗读按钮重试。" : "系统中文语音播放失败，请检查设备语音设置后重试。"));
          dispose();
        };
        synth.speak(utterance);
      });
    }
    if (scope.isActive()) { report(text.length); scope.finish(); }
  });
}

export function speakPinyin(pinyin: string, example?: string): Promise<void> {
  const url = getPinyinAudioUrl(pinyin);
  if (!url) {
    if (example && /\p{Script=Han}/u.test(example)) return speak(example, { rate: 0.75, lang: "zh-CN" });
    stopSpeech();
    return Promise.reject(new Error("暂缺这段拼音的录音，请选择带汉字的例音。"));
  }
  return startPlayback(async (scope) => {
    if (typeof Audio === "undefined") throw new Error("当前浏览器无法播放录音，请换用现代浏览器重试。");
    const audio = new Audio(url);
    audio.preload = "auto";
    audio.onended = () => scope.finish();
    audio.onerror = () => scope.finish(new Error("本地录音加载失败，请检查连接后重试。"));
    const timeout = setTimeout(() => scope.finish(new Error("录音播放超时，请检查连接后重试。")), 20000);
    scope.cleanup(() => {
      clearTimeout(timeout);
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    });
    try { await audio.play(); }
    catch {
      if (scope.isActive()) throw new Error("浏览器未能播放录音，请点击播放按钮重试。");
    }
  });
}
