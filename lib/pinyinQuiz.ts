import type { PinyinQuizItem } from "@/data/pinyinQuizItems";
import { shuffleWithSeed } from "@/lib/seededRandom";

export type PinyinToneMode = "plain" | "toned";
/** Seconds per round; 0 means untimed with a fixed number of questions. */
export type PinyinQuizDuration = 90 | 180 | 0;
export const UNTIMED_QUESTION_COUNT = 20;

export type PinyinQuizVerdict = "correct" | "empty" | "han" | "tone" | "initial" | "wrong";

const toneMarks: Record<string, [string, number]> = {
  ā: ["a", 1], á: ["a", 2], ǎ: ["a", 3], à: ["a", 4],
  ē: ["e", 1], é: ["e", 2], ě: ["e", 3], è: ["e", 4],
  ī: ["i", 1], í: ["i", 2], ǐ: ["i", 3], ì: ["i", 4],
  ō: ["o", 1], ó: ["o", 2], ǒ: ["o", 3], ò: ["o", 4],
  ū: ["u", 1], ú: ["u", 2], ǔ: ["u", 3], ù: ["u", 4],
  ǖ: ["v", 1], ǘ: ["v", 2], ǚ: ["v", 3], ǜ: ["v", 4],
};
const initials = ["zh", "ch", "sh", "b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h", "j", "q", "x", "r", "z", "c", "s", "y", "w"];

/** After j/q/x/y the ü is written u, so learners may type either u or v. */
const unifyU = (letters: string) => letters.replace(/([jqxy])v/g, "$1u");

function prepare(input: string): string {
  return input.normalize("NFC").trim().toLowerCase().replace(/u:/g, "v").replace(/[\s'’·\-]/g, "");
}

function stripTones(text: string): string {
  return unifyU([...text].map(char => toneMarks[char]?.[0] ?? (char === "ü" ? "v" : char)).join("").replace(/[0-5]/g, ""));
}

interface Syllable { letters: string; tone: number }

export function parsePinyin(pinyin: string): Syllable[] {
  return pinyin.split(" ").map(part => {
    let tone = 0;
    const letters = [...part].map(char => {
      const mark = toneMarks[char];
      if (mark) { tone = mark[1]; return mark[0]; }
      return char === "ü" ? "v" : char;
    }).join("");
    return { letters: unifyU(letters), tone };
  });
}

function initialOf(letters: string): string {
  return initials.find(initial => letters.startsWith(initial)) ?? "";
}

/** Tone check for input written with marks: compare the marked spelling itself. */
function sameMarkedSpelling(input: string, expected: string): boolean {
  const canonical = (text: string) => unifyMarkedU(prepare(text).replace(/v/g, "ü"));
  return canonical(input) === canonical(expected);
}

function unifyMarkedU(text: string): string {
  return text.replace(/([jqxy])([üǖǘǚǜ])/g, (_, initial: string, vowel: string) => initial + ({ ü: "u", ǖ: "ū", ǘ: "ú", ǚ: "ǔ", ǜ: "ù" } as Record<string, string>)[vowel]);
}

/** Tone check for input written with digits: neutral syllables may be left bare or written 0/5. */
function sameNumberedSpelling(input: string, syllables: Syllable[]): boolean {
  const pattern = syllables.map(syllable => `${syllable.letters}${syllable.tone ? syllable.tone : "[05]?"}`).join("");
  return new RegExp(`^${pattern}$`).test(unifyU(prepare(input).replace(/ü/g, "v")));
}

export function gradePinyinAnswer(item: PinyinQuizItem, input: string, toneMode: PinyinToneMode): PinyinQuizVerdict {
  const prepared = prepare(input);
  if (!prepared) return "empty";
  if (/\p{Script=Han}/u.test(prepared)) return "han";
  const syllables = parsePinyin(item.pinyin);
  const expectedLetters = syllables.map(syllable => syllable.letters).join("");
  const letters = stripTones(prepared);
  if (letters !== expectedLetters) {
    const initial = initialOf(expectedLetters);
    return item.mode === "character" && initial && initialOf(letters) === initial ? "initial" : "wrong";
  }
  if (toneMode === "plain") return "correct";
  const usesMarks = [...prepared].some(char => char in toneMarks);
  const correct = usesMarks ? sameMarkedSpelling(prepared, item.pinyin) : sameNumberedSpelling(prepared, syllables);
  return correct ? "correct" : "tone";
}

export interface PinyinQuizAnswer {
  item: PinyinQuizItem;
  outcome: "correct" | "skipped";
  wrongAttempts: number;
}

export type PinyinQuizFeedback =
  | { kind: "idle" }
  | { kind: "correct"; item: PinyinQuizItem }
  | { kind: "skipped"; item: PinyinQuizItem }
  | { kind: "retry"; verdict: Exclude<PinyinQuizVerdict, "correct"> };

export interface PinyinQuizState {
  items: readonly PinyinQuizItem[];
  index: number;
  wrongAttempts: number;
  streak: number;
  bestStreak: number;
  answers: readonly PinyinQuizAnswer[];
  feedback: PinyinQuizFeedback;
}

export function createPinyinQuizState(pool: readonly PinyinQuizItem[], duration: PinyinQuizDuration, seed: number): PinyinQuizState {
  const items = shuffleWithSeed(pool, seed);
  return {
    items: duration === 0 ? items.slice(0, UNTIMED_QUESTION_COUNT) : items,
    index: 0,
    wrongAttempts: 0,
    streak: 0,
    bestStreak: 0,
    answers: [],
    feedback: { kind: "idle" },
  };
}

export const currentPinyinQuizItem = (state: PinyinQuizState): PinyinQuizItem | undefined => state.items[state.index];
export const isPinyinQuizExhausted = (state: PinyinQuizState) => state.index >= state.items.length;
export const pinyinQuizScore = (state: PinyinQuizState) => state.answers.filter(answer => answer.outcome === "correct").length;

function advance(state: PinyinQuizState, answer: PinyinQuizAnswer, feedback: PinyinQuizFeedback, streak: number): PinyinQuizState {
  return {
    ...state,
    index: state.index + 1,
    wrongAttempts: 0,
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
    answers: [...state.answers, answer],
    feedback,
  };
}

export function submitPinyinQuizAnswer(state: PinyinQuizState, input: string, toneMode: PinyinToneMode): PinyinQuizState {
  const item = currentPinyinQuizItem(state);
  if (!item) return state;
  const verdict = gradePinyinAnswer(item, input, toneMode);
  if (verdict === "correct") {
    return advance(state, { item, outcome: "correct", wrongAttempts: state.wrongAttempts }, { kind: "correct", item }, state.streak + 1);
  }
  // Empty or Chinese-character input is a usage problem, not a wrong answer.
  const counts = verdict !== "empty" && verdict !== "han";
  return { ...state, wrongAttempts: state.wrongAttempts + (counts ? 1 : 0), streak: counts ? 0 : state.streak, feedback: { kind: "retry", verdict } };
}

export function skipPinyinQuizItem(state: PinyinQuizState): PinyinQuizState {
  const item = currentPinyinQuizItem(state);
  if (!item) return state;
  return advance(state, { item, outcome: "skipped", wrongAttempts: state.wrongAttempts }, { kind: "skipped", item }, 0);
}

/** Answers worth reviewing: skipped, or solved only after a wrong attempt. */
export function pinyinQuizReview(state: PinyinQuizState): PinyinQuizAnswer[] {
  return state.answers.filter(answer => answer.outcome === "skipped" || answer.wrongAttempts > 0);
}

export function describePinyinQuizFeedback(feedback: PinyinQuizFeedback, toneMode: PinyinToneMode): string {
  switch (feedback.kind) {
    case "idle": return toneMode === "toned" ? "输入拼音并标出声调，按回车提交。" : "输入拼音，不用标声调，按回车提交。";
    case "correct": return `答对了：${feedback.item.text} ${feedback.item.pinyin}${feedback.item.mode === "character" ? `（${feedback.item.word}）` : ""}`;
    case "skipped": return `已跳过：${feedback.item.text} 读 ${feedback.item.pinyin}`;
    case "retry":
      switch (feedback.verdict) {
        case "empty": return "还没有输入拼音。";
        case "han": return "请用字母输入拼音，先关闭中文输入法。";
        case "tone": return "字母对了，声调不对，再想想是第几声。";
        case "initial": return "声母对了，韵母再想想。";
        case "wrong": return "拼写不对，再试一次，或者跳过看答案。";
      }
  }
}
