const TONE_MARKS: Record<string, readonly [string, number]> = {
  ā: ["a", 1], á: ["a", 2], ǎ: ["a", 3], à: ["a", 4],
  ē: ["e", 1], é: ["e", 2], ě: ["e", 3], è: ["e", 4],
  ī: ["i", 1], í: ["i", 2], ǐ: ["i", 3], ì: ["i", 4],
  ō: ["o", 1], ó: ["o", 2], ǒ: ["o", 3], ò: ["o", 4],
  ū: ["u", 1], ú: ["u", 2], ǔ: ["u", 3], ù: ["u", 4],
  ǖ: ["ü", 1], ǘ: ["ü", 2], ǚ: ["ü", 3], ǜ: ["ü", 4],
  ń: ["n", 2], ň: ["n", 3], ǹ: ["n", 4],
};

/** Longer onsets first so zh/ch/sh are not read as z/c/s. y and w are spelling letters, not initials. */
const INITIALS = ["zh", "ch", "sh", "b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h", "j", "q", "x", "r", "z", "c", "s"];

export interface PinyinSyllable {
  /** Empty string when the syllable has no initial. */
  initial: string;
  final: string;
  /** 0 is the neutral tone. */
  tone: number;
}

export const toneLabel = (tone: number) => tone === 0 ? "轻声" : `${"一二三四"[tone - 1]}声`;

function rewriteZeroInitial(base: string): string {
  if (base.startsWith("yu")) return `ü${base.slice(2)}`;
  if (base === "yi") return "i";
  if (base === "you") return "iu";
  if (base === "yong") return "iong";
  if (base === "ye") return "ie";
  if (base.startsWith("y")) return base.length === 1 ? "i" : `i${base.slice(1)}`;
  if (base === "wu") return "u";
  if (base === "wei") return "ui";
  if (base === "wen") return "un";
  if (base === "weng") return "ueng";
  if (base.startsWith("w")) return base.length === 1 ? "u" : `u${base.slice(1)}`;
  return base;
}

/** Splits one marked syllable the way the pinyin lessons do: 23 initials, y/w rewritten into the final. */
export function parsePinyinSyllable(marked: string): PinyinSyllable | null {
  const raw = marked.normalize("NFC").trim().toLowerCase().replaceAll("v", "ü");
  if (!raw) return null;
  let tone = 0;
  let base = "";
  for (const char of raw) {
    const markedTone = TONE_MARKS[char];
    if (markedTone) {
      if (tone !== 0) return null;
      tone = markedTone[1];
      base += markedTone[0];
    } else base += char;
  }
  if (!/^[a-zü]+$/u.test(base)) return null;
  let initial = "";
  let final = base;
  for (const onset of INITIALS) {
    if (base.startsWith(onset)) {
      initial = onset;
      final = base.slice(onset.length);
      break;
    }
  }
  if (!initial) final = rewriteZeroInitial(final);
  if (initial === "j" || initial === "q" || initial === "x") {
    if (final.startsWith("u")) final = `ü${final.slice(1)}`;
  }
  if (!final) return null;
  return { initial, final, tone };
}

export function parsePinyinSyllables(marked: string, count: number): PinyinSyllable[] | null {
  const parts = marked.normalize("NFC").trim().split(/\s+/u);
  if (parts.length !== count) return null;
  const syllables = parts.map(parsePinyinSyllable);
  if (syllables.some(item => item === null)) return null;
  return syllables as PinyinSyllable[];
}
