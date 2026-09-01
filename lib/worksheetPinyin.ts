import type { CharacterInfo } from "../types";

export function isWorksheetPinyin(value: unknown): value is string {
  return typeof value === "string" && /^[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜńňǹḿê' -]+$/i.test(value);
}

function withoutTone(pinyin: string) {
  const vowels: Record<string, string> = {
    ā: "a", á: "a", ǎ: "a", à: "a", ē: "e", é: "e", ě: "e", è: "e",
    ī: "i", í: "i", ǐ: "i", ì: "i", ō: "o", ó: "o", ǒ: "o", ò: "o",
    ū: "u", ú: "u", ǔ: "u", ù: "u", ǖ: "ü", ǘ: "ü", ǚ: "ü", ǜ: "ü", ń: "n", ň: "n", ǹ: "n", ḿ: "m",
  };
  return Array.from(pinyin).map((letter) => vowels[letter] ?? letter).join("");
}

/** Reject unaligned UTF-16 results and missing-glyph placeholders from older dictionaries. */
export function applyWorksheetPinyin(information: readonly CharacterInfo[], contextual: readonly string[]): CharacterInfo[] {
  const aligned = contextual.length === information.length;
  return information.map((info, index) => {
    const candidate = aligned && isWorksheetPinyin(contextual[index]) ? contextual[index] : info.pinyinWithTone;
    const pinyinWithTone = isWorksheetPinyin(candidate) ? candidate.toLowerCase() : "";
    const toneRows = ["āēīōūǖ", "áéíóúǘńḿ", "ǎěǐǒǔǚň", "àèìòùǜǹ"];
    return { ...info, pinyinWithTone, pinyin: withoutTone(pinyinWithTone),
      tone: toneRows.findIndex((row) => Array.from(pinyinWithTone).some((letter) => row.includes(letter))) + 1 };
  });
}
