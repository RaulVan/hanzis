"use client";

import type { CharacterInfo } from "@/types";
import type { ICnChar } from "cnchar-types/main";
import { poems } from "@/data/poems";
import { filterChineseCharacters } from "@/lib/utils";

let instance: ICnChar | null = null;
let loading: Promise<ICnChar | null> | null = null;

export function loadCnchar(): Promise<ICnChar | null> {
  if (instance) return Promise.resolve(instance);
  if (loading) return loading;
  loading = Promise.all([
    import("cnchar"), import("cnchar-poly"), import("cnchar-order"), import("cnchar-radical"), import("cnchar-trad"),
  ]).then(([core, poly, order, radical, trad]) => {
    instance = core.default;
    instance.use(poly.default, order.default, radical.default, trad.default);
    // Contextual readings used by the built-in learning examples.
    instance.setPolyPhrase({
      "不觉": "bù jué", "处处": "chù chù", "长大": "zhǎng dà",
      "快乐": "kuài lè", "音乐": "yīn yuè", "银行": "yín háng",
      "看着": "kàn zhe", "睡觉": "shuì jiào", "重新": "chóng xīn",
    });
    instance.setPolyPhrase(Object.fromEntries(poems.flatMap(poem => poem.lines.map(line => [filterChineseCharacters(line.text), line.pinyin.join(" ")]))));
    return instance;
  }).catch(() => {
    loading = null;
    return null;
  });
  return loading;
}

export function getTextPinyin(text: string): string[] {
  if (!instance || !text) return [];
  const characters = Array.from(text);
  const result: string[] = [];
  // cnchar indexes UTF-16 code units. Keep BMP phrases together for polyphony,
  // but never pass a surrogate pair into its positional spelling API.
  for (let start = 0; start < characters.length;) {
    if (characters[start].length > 1) { result.push(""); start += 1; continue; }
    let end = start + 1;
    while (end < characters.length && characters[end].length === 1) end += 1;
    const phrase = characters.slice(start, end);
    const spellings = instance.spell(phrase.join(""), "array", "tone", "low");
    const values = Array.isArray(spellings) && spellings.length === phrase.length ? spellings : phrase.map(char => getPinyin(char));
    result.push(...values.map(value => normalizeSpelling(String(value))));
    start = end;
  }
  return result;
}

function normalizeSpelling(value: string): string {
  return /^[a-züêāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜńňǹḿ]+$/i.test(value) ? value.toLowerCase() : "";
}

export function getPinyin(char: string, withTone = true): string {
  if (!instance || char.length > 1) return "";
  const value = withTone ? instance.spell(char, "tone", "low") : instance.spell(char, "low");
  return typeof value === "string" && value !== char ? normalizeSpelling(value) : "";
}

export function getStrokeCount(char: string): number {
  if (!instance) return 0;
  const result = instance.stroke(char);
  return typeof result === "number" && Number.isFinite(result) ? result : 0;
}

export function getRadical(char: string): { radical: string; struct: string } {
  const result = instance?.radical?.(char);
  const first = Array.isArray(result) ? result[0] : undefined;
  return { radical: first?.radical || "", struct: first?.struct || "" };
}

export function getStrokeOrder(char: string): string[] {
  const result = instance?.stroke(char, "order", "name");
  return Array.isArray(result) && Array.isArray(result[0]) ? result[0] as string[] : [];
}

export function getCharacterInfo(char: string): CharacterInfo {
  const pinyinWithTone = getPinyin(char);
  const { radical, struct } = getRadical(char);
  const toneRows = ["āēīōūǖ", "áéíóúǘ", "ǎěǐǒǔǚ", "àèìòùǜ"];
  const tone = toneRows.findIndex(row => Array.from(pinyinWithTone).some(letter => row.includes(letter))) + 1;
  return { char, pinyin: getPinyin(char, false), pinyinWithTone, tone, strokeCount: getStrokeCount(char), radical, radicalStrokeCount: 0, struct, strokeOrder: [], strokeNames: getStrokeOrder(char) };
}

export function isCncharLoaded(): boolean {
  return instance !== null;
}
