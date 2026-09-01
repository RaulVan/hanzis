import audioManifest from "../data/audio-manifest.json";

export type PinyinTone = 0 | 1 | 2 | 3 | 4;

const recordings = new Set(audioManifest);
const markedVowels: Record<string, [string, PinyinTone]> = {};
for (const [base, vowels] of Object.entries({ a: "āáǎà", e: "ēéěè", i: "īíǐì", o: "ōóǒò", u: "ūúǔù", v: "ǖǘǚǜ" })) {
  Array.from(vowels).forEach((vowel, index) => { markedVowels[vowel] = [base, (index + 1) as PinyinTone]; });
}

/** A missing tone is neutral/unspecified; never substitute a first-tone recording. */
export function parsePinyinSyllable(value: string): { syllable: string; tone: PinyinTone } | null {
  const normalized = value.trim().toLowerCase().normalize("NFC").replaceAll("u:", "ü");
  const numeric = normalized.match(/[0-5]$/)?.[0];
  const body = numeric ? normalized.slice(0, -1) : normalized;
  let markedTone: PinyinTone | undefined;
  let syllable = "";
  for (const char of Array.from(body)) {
    const marked = markedVowels[char];
    if (marked) {
      if (markedTone !== undefined) return null;
      markedTone = marked[1];
      syllable += marked[0];
    } else {
      syllable += char === "ü" ? "v" : char;
    }
  }
  if (!/^[a-z]+$/.test(syllable)) return null;
  const numericTone = numeric ? (Number(numeric) % 5) as PinyinTone : undefined;
  if (numericTone !== undefined && markedTone !== undefined && numericTone !== markedTone) return null;
  return { syllable, tone: numericTone ?? markedTone ?? 0 };
}

export function getPinyinAudioUrl(pinyin: string): string | null {
  const parsed = parsePinyinSyllable(pinyin);
  if (!parsed || parsed.tone === 0) return null;
  const filename = `${parsed.syllable}${parsed.tone}.mp3`;
  return recordings.has(filename) ? `/voice/${filename}` : null;
}

export function getPinyinAudioSource(pinyin: string): "本地录音" | "系统中文语音" {
  return getPinyinAudioUrl(pinyin) ? "本地录音" : "系统中文语音";
}
