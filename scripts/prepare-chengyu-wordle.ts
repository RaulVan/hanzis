import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import manifest from "../data/hanzi-manifest.json";
import { chengyuChains } from "../data/chengyuChains";
import { parsePinyinSyllables } from "../lib/pinyinSyllable";
import { hashString, shuffleWithSeed } from "../lib/seededRandom";

export const CHENGYU_WORDLE_ANSWER_COUNT = 366;
export const CHENGYU_WORDLE_EPOCH = "2026-01-01";

export interface ChengyuWordleSource {
  repository: string;
  revision: string;
  snapshotSha256: string;
}

export interface ChengyuWordleEntry {
  word: string;
  /** Tone-marked pinyin from the snapshot, one syllable per character. */
  pinyin: string;
}

export interface ChengyuWordleAnswer extends ChengyuWordleEntry {
  explanation: string;
}

export interface ChengyuWordleData {
  format: 1;
  source: ChengyuWordleSource & { name: string; license: string; reviewStatus: "unreviewed" };
  epoch: string;
  /** Preferred daily answers. The handwritten chains come first when the snapshot can read them. */
  answers: ChengyuWordleAnswer[];
  /** Every guessable four-character idiom, including the answers. */
  dictionary: ChengyuWordleEntry[];
}

interface SnapshotIdiom {
  word?: string;
  pinyin?: string;
  explanation?: string;
}

const HAN = /^\p{Script=Han}{4}$/u;
const known = new Set(manifest.characters);

export function normalizeIdiomPinyin(pinyin: string): string | null {
  const syllables = parsePinyinSyllables(pinyin, 4);
  if (!syllables) return null;
  return pinyin.normalize("NFC").trim().toLowerCase().replaceAll(/\s+/gu, " ");
}

function usable(item: SnapshotIdiom): item is { word: string; pinyin: string; explanation: string } {
  return typeof item.word === "string" && HAN.test(item.word) && [...item.word].every(char => known.has(char)) && typeof item.pinyin === "string" && normalizeIdiomPinyin(item.pinyin) !== null;
}

function answerExplanation(word: string, explanation: string | undefined): string | null {
  const text = explanation?.replaceAll(/\s+/gu, "").replaceAll("～", "") ?? "";
  if (text.length < 8 || text.length > 64 || text.includes(word)) return null;
  return text;
}

export function buildChengyuWordleData(rows: readonly SnapshotIdiom[], source: ChengyuWordleSource): ChengyuWordleData {
  const dictionary: ChengyuWordleEntry[] = [];
  const eligible: ChengyuWordleAnswer[] = [];
  const byWord = new Map<string, ChengyuWordleAnswer>();
  for (const row of rows) {
    if (!usable(row)) continue;
    const pinyin = normalizeIdiomPinyin(row.pinyin)!;
    dictionary.push({ word: row.word, pinyin });
    const explanation = answerExplanation(row.word, row.explanation);
    if (!explanation) continue;
    const answer = { word: row.word, pinyin, explanation };
    eligible.push(answer);
    byWord.set(row.word, answer);
  }
  dictionary.sort((a, b) => a.word.localeCompare(b.word, "zh"));
  const preferred = chengyuChains.flatMap(chain => chain.idioms.map(idiom => idiom.text));
  const front = preferred.flatMap(word => {
    const answer = byWord.get(word);
    return answer ? [answer] : [];
  });
  const frontWords = new Set(front.map(item => item.word));
  const rest = shuffleWithSeed(eligible.filter(item => !frontWords.has(item.word)), hashString("chengyu-wordle-answers-v1"));
  const answers = [...front, ...rest].slice(0, CHENGYU_WORDLE_ANSWER_COUNT);
  return {
    format: 1,
    source: { ...source, name: "pwxcoo/chinese-xinhua idiom.json", license: "MIT", reviewStatus: "unreviewed" },
    epoch: CHENGYU_WORDLE_EPOCH,
    answers,
    dictionary,
  };
}

export function loadChengyuSnapshot(path = new URL("../data/xinhua-idiom-source.json.gz", import.meta.url)): SnapshotIdiom[] {
  return JSON.parse(gunzipSync(readFileSync(path)).toString()) as SnapshotIdiom[];
}
