import { isChinese } from "./utils";

export interface PoetryPinyinEntry {
  textHash: string;
  lines: string[][];
  missing: number;
  correctedLines: number;
}
export interface PoetryPinyinShard {
  revision: string;
  entries: Record<string, PoetryPinyinEntry>;
}

export const normalizePoetryText = (text: string) => text.replace(/\r\n?/g, "\n");
export const isPinyinSyllable = (value: unknown): value is string =>
  typeof value === "string" && /^[a-züêāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜńňǹḿ]+$/.test(value);

// Empty readings occupy their original Han-character slot; never shift later syllables.
export function validatePoetryPinyin(text: string, entry: PoetryPinyinEntry): boolean {
  const lines = normalizePoetryText(text).split("\n");
  if (!entry || !Array.isArray(entry.lines) || entry.lines.length !== lines.length) return false;
  let missing = 0;
  for (let i = 0; i < lines.length; i++) {
    const values = entry.lines[i];
    if (!Array.isArray(values) || values.length !== Array.from(lines[i]).filter(isChinese).length) return false;
    for (const value of values) {
      if (value === "") missing++;
      else if (!isPinyinSyllable(value)) return false;
    }
  }
  return entry.missing === missing && Number.isInteger(entry.correctedLines) && entry.correctedLines >= 0 && entry.correctedLines <= lines.length;
}
