import type { ChengyuWordleAnswer, ChengyuWordleData, ChengyuWordleEntry } from "@/scripts/prepare-chengyu-wordle";
import { getGameStars } from "@/lib/gameStars";
import { parsePinyinSyllables, toneLabel, type PinyinSyllable } from "@/lib/pinyinSyllable";

export const CHENGYU_WORDLE_TRIES = 6;
export const CHENGYU_WORDLE_SOURCE_NOTE = "释义和读音来自 chinese-xinhua 成语快照，未经人工审校。每条成语只用资料里的一种读音。";

export type ChengyuMark = "exact" | "present" | "absent";

export interface ChengyuSlotFeedback {
  char: ChengyuMark;
  initial: ChengyuMark;
  final: ChengyuMark;
  tone: ChengyuMark;
}

export interface ChengyuGuess {
  word: string;
  marks: readonly ChengyuSlotFeedback[];
}

export type ChengyuWordleFeedback =
  | { kind: "idle" | "empty" | "format" | "unknown" | "duplicate" | "guess" | "win" | "loss"; text: string };

export interface ChengyuWordleState {
  date: string;
  practice: boolean;
  answer: ChengyuWordleAnswer;
  syllables: readonly PinyinSyllable[];
  guesses: readonly ChengyuGuess[];
  hints: number;
  explanationShown: boolean;
  revealed: readonly number[];
  done: boolean;
  won: boolean;
  feedback: ChengyuWordleFeedback;
}

const HAN4 = /^\p{Script=Han}{4}$/u;

export function chengyuWordleDate(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function chengyuWordleDayIndex(day: string, epoch: string): number {
  const utc = (value: string) => {
    const [year, month, date] = value.split("-").map(Number);
    return Date.UTC(year, month - 1, date);
  };
  return Math.round((utc(day) - utc(epoch)) / 86_400_000);
}

export function isChengyuWordleDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false;
  const [year, month, date] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, date));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === date;
}

export function chengyuWordlePath(date: string): string {
  return `/games/chengyu-wordle/?d=${date}`;
}

export function answerForDate(data: ChengyuWordleData, day: string): ChengyuWordleAnswer {
  const index = chengyuWordleDayIndex(day, data.epoch);
  return data.answers[((index % data.answers.length) + data.answers.length) % data.answers.length];
}

export function answerForPractice(data: ChengyuWordleData, seed: string): ChengyuWordleAnswer {
  let hash = 2166136261;
  for (const char of seed) hash = Math.imul(hash ^ char.codePointAt(0)!, 16777619);
  return data.answers[(hash >>> 0) % data.answers.length];
}

export function indexChengyuDictionary(entries: readonly ChengyuWordleEntry[]): Map<string, { entry: ChengyuWordleEntry; syllables: PinyinSyllable[] }> {
  const index = new Map<string, { entry: ChengyuWordleEntry; syllables: PinyinSyllable[] }>();
  for (const entry of entries) {
    const syllables = parsePinyinSyllables(entry.pinyin, 4);
    if (syllables) index.set(entry.word, { entry, syllables });
  }
  return index;
}

export function initialLabel(initial: string): string {
  return initial === "" ? "零声母" : initial;
}

export function normalizeChengyuInput(input: string): string {
  return [...input.normalize("NFC")].filter(char => /\p{Script=Han}/u.test(char)).join("");
}

function markValues(guess: readonly string[], answer: readonly string[]): ChengyuMark[] {
  const marks: ChengyuMark[] = Array.from({ length: guess.length }, () => "absent");
  const leftover = new Map<string, number>();
  guess.forEach((value, index) => {
    if (value === answer[index]) marks[index] = "exact";
    else leftover.set(answer[index], (leftover.get(answer[index]) ?? 0) + 1);
  });
  guess.forEach((value, index) => {
    if (marks[index] === "exact") return;
    const count = leftover.get(value) ?? 0;
    if (count > 0) {
      marks[index] = "present";
      leftover.set(value, count - 1);
    }
  });
  return marks;
}

export function compareChengyu(guess: string, guessSyllables: readonly PinyinSyllable[], answer: string, answerSyllables: readonly PinyinSyllable[]): ChengyuSlotFeedback[] {
  const chars = markValues([...guess], [...answer]);
  const initials = markValues(guessSyllables.map(item => item.initial), answerSyllables.map(item => item.initial));
  const finals = markValues(guessSyllables.map(item => item.final), answerSyllables.map(item => item.final));
  const tones = markValues(guessSyllables.map(item => String(item.tone)), answerSyllables.map(item => String(item.tone)));
  return chars.map((char, index) => ({ char, initial: initials[index], final: finals[index], tone: tones[index] }));
}

export function createChengyuWordleState(answer: ChengyuWordleAnswer, date: string, practice: boolean): ChengyuWordleState {
  const syllables = parsePinyinSyllables(answer.pinyin, 4);
  if (!syllables) throw new Error(`无法拆读：${answer.word}`);
  return {
    date,
    practice,
    answer,
    syllables,
    guesses: [],
    hints: 0,
    explanationShown: false,
    revealed: [],
    done: false,
    won: false,
    feedback: { kind: "idle", text: practice ? "练习题。猜一个四字成语，共 6 次。" : `${date} 的成语。猜一个四字成语，共 6 次。` },
  };
}

export function submitChengyuGuess(
  state: ChengyuWordleState,
  input: string,
  dictionary: ReadonlyMap<string, { entry: ChengyuWordleEntry; syllables: PinyinSyllable[] }>,
): ChengyuWordleState {
  if (state.done) return state;
  const word = normalizeChengyuInput(input);
  if (!word) return { ...state, feedback: { kind: "empty", text: "先写一个四字成语。" } };
  if (!HAN4.test(word)) return { ...state, feedback: { kind: "format", text: "请输入四个汉字。" } };
  if (state.guesses.some(guess => guess.word === word)) return { ...state, feedback: { kind: "duplicate", text: "这个成语已经猜过了。" } };
  const known = dictionary.get(word);
  if (!known) return { ...state, feedback: { kind: "unknown", text: "词库里没有这个成语。" } };
  const marks = compareChengyu(word, known.syllables, state.answer.word, state.syllables);
  const guesses = [...state.guesses, { word, marks }];
  const won = word === state.answer.word;
  const done = won || guesses.length >= CHENGYU_WORDLE_TRIES;
  const feedback = won
    ? { kind: "win" as const, text: `猜对了。${state.answer.word}，${state.answer.pinyin}。` }
    : done
      ? { kind: "loss" as const, text: `次数用完了。答案是${state.answer.word}，${state.answer.pinyin}。` }
      : { kind: "guess" as const, text: `还有 ${CHENGYU_WORDLE_TRIES - guesses.length} 次。看每一字的字、声母、韵母和声调。` };
  return { ...state, guesses, done, won, feedback };
}

export function showChengyuExplanation(state: ChengyuWordleState): ChengyuWordleState {
  if (state.done || state.explanationShown) return state;
  return { ...state, hints: state.hints + 1, explanationShown: true, feedback: { kind: "guess", text: `释义：${state.answer.explanation}` } };
}

export function revealChengyuInitial(state: ChengyuWordleState): ChengyuWordleState {
  if (state.done) return state;
  const exact = new Set<number>();
  for (const guess of state.guesses) guess.marks.forEach((mark, index) => { if (mark.initial === "exact") exact.add(index); });
  const next = [0, 1, 2, 3].find(index => !exact.has(index) && !state.revealed.includes(index));
  if (next === undefined) return state;
  const label = initialLabel(state.syllables[next].initial);
  return {
    ...state,
    hints: state.hints + 1,
    revealed: [...state.revealed, next],
    feedback: { kind: "guess", text: `第 ${next + 1} 个字的声母是${label}。` },
  };
}

export function chengyuWordleMistakes(state: ChengyuWordleState): number {
  return state.guesses.length - (state.won ? 1 : 0);
}

export function getChengyuWordleStars(state: ChengyuWordleState): number {
  return getGameStars(chengyuWordleMistakes(state), state.hints);
}

const markSymbol: Record<ChengyuMark, string> = { exact: "●", present: "◐", absent: "○" };
const dimensionLabel = { char: "字", initial: "声", final: "韵", tone: "调" } as const;

export function shareChengyuWordle(state: ChengyuWordleState): string {
  const title = state.practice ? "练习" : state.date;
  const rows = state.guesses.map(guess => (Object.keys(dimensionLabel) as (keyof typeof dimensionLabel)[])
    .map(dimension => `${dimensionLabel[dimension]}${guess.marks.map(mark => markSymbol[mark[dimension]]).join("")}`)
    .join(" "));
  return [`汉字网 · 每日成语 ${title} ${state.guesses.length}/${CHENGYU_WORDLE_TRIES}`, ...rows, "●对 ◐有 ○无"].join("\n");
}

export function describeChengyuMark(mark: ChengyuMark): string {
  if (mark === "exact") return "对";
  if (mark === "present") return "有";
  return "无";
}

export function describeChengyuSlot(mark: ChengyuSlotFeedback, syllable: PinyinSyllable): string {
  return `字${describeChengyuMark(mark.char)}，声母${describeChengyuMark(mark.initial)} ${initialLabel(syllable.initial)}，韵母${describeChengyuMark(mark.final)} ${syllable.final}，声调${describeChengyuMark(mark.tone)} ${toneLabel(syllable.tone)}`;
}
