import type { FeihuaData, FeihuaLine, FeihuaTier } from "@/lib/feihuaTypes";
import { getGameStars } from "@/lib/gameStars";
import { hashString, shuffleWithSeed } from "@/lib/seededRandom";

export const FEIHUA_ROUND_LINES = 8;
export const FEIHUA_OPTION_COUNT = 4;
export const feihuaBlankCount: Record<FeihuaTier, number> = { basic: 1, advanced: 2 };

export interface FeihuaQuestion {
  line: FeihuaLine;
  /** Character positions to fill, in reading order. */
  blanks: number[];
  /** Four choices per blank, shuffled. */
  options: string[][];
}

export interface FeihuaAnswer {
  line: FeihuaLine;
  mistakes: number;
}

export type FeihuaFeedback =
  | { kind: "idle" }
  | { kind: "correct"; char: string }
  | { kind: "wrong"; char: string }
  | { kind: "solved"; line: FeihuaLine };

export interface FeihuaState {
  key: string;
  tier: FeihuaTier;
  questions: readonly FeihuaQuestion[];
  index: number;
  /** How many blanks of the current question are filled. */
  filled: number;
  eliminated: readonly string[];
  lineMistakes: number;
  mistakes: number;
  answers: readonly FeihuaAnswer[];
  feedback: FeihuaFeedback;
}

export function feihuaLinesFor(data: FeihuaData, tier: FeihuaTier, key: string): FeihuaLine[] {
  return (data.tiers[tier][key] ?? []).map(id => data.lines[id]);
}

function buildQuestion(data: FeihuaData, tier: FeihuaTier, key: string, line: FeihuaLine, seed: number): FeihuaQuestion {
  const chars = [...line.text];
  const candidates = chars.map((char, index) => ({ char, index })).filter(item => item.char !== key);
  const blanks = shuffleWithSeed(candidates, seed).slice(0, feihuaBlankCount[tier]).map(item => item.index).sort((a, b) => a - b);
  const allTexts = new Set(data.lines.map(item => item.text));
  const siblings = feihuaLinesFor(data, tier, key).filter(item => item.id !== line.id && item.text.length === line.text.length);
  const fallback = [...new Set(data.lines.flatMap(item => [...item.text]))];
  const options = blanks.map((position, blankIndex) => {
    const correct = chars[position];
    const usable = (char: string) => {
      if (char === correct || char === key || chars.includes(char)) return false;
      const variant = [...chars];
      variant[position] = char;
      return !allTexts.has(variant.join(""));
    };
    // Prefer characters that stand in the same position of other lines with this key: they sound plausible.
    const near = shuffleWithSeed([...new Set(siblings.map(item => [...item.text][position]))].filter(usable), seed + blankIndex + 1);
    const far = shuffleWithSeed(fallback.filter(char => usable(char) && !near.includes(char)), seed + blankIndex + 7);
    return shuffleWithSeed([correct, ...[...near, ...far].slice(0, FEIHUA_OPTION_COUNT - 1)], seed + blankIndex + 13);
  });
  return { line, blanks, options };
}

export function createFeihuaState(data: FeihuaData, tier: FeihuaTier, key: string, attempt: number): FeihuaState {
  const seed = hashString(`${tier}:${key}:${attempt}`);
  const lines = shuffleWithSeed(feihuaLinesFor(data, tier, key), seed).slice(0, FEIHUA_ROUND_LINES);
  return {
    key,
    tier,
    questions: lines.map((line, index) => buildQuestion(data, tier, key, line, seed + index * 31)),
    index: 0,
    filled: 0,
    eliminated: [],
    lineMistakes: 0,
    mistakes: 0,
    answers: [],
    feedback: { kind: "idle" },
  };
}

export const currentFeihuaQuestion = (state: FeihuaState): FeihuaQuestion | undefined => state.questions[state.index];
export const isFeihuaLineSolved = (state: FeihuaState) => state.feedback.kind === "solved";
export const isFeihuaComplete = (state: FeihuaState) => state.answers.length === state.questions.length;

export function chooseFeihuaOption(state: FeihuaState, char: string): FeihuaState {
  const question = currentFeihuaQuestion(state);
  if (!question || isFeihuaLineSolved(state) || state.eliminated.includes(char)) return state;
  if (!question.options[state.filled]?.includes(char)) return state;
  const correct = [...question.line.text][question.blanks[state.filled]];
  if (char !== correct) {
    return { ...state, eliminated: [...state.eliminated, char], lineMistakes: state.lineMistakes + 1, mistakes: state.mistakes + 1, feedback: { kind: "wrong", char } };
  }
  const filled = state.filled + 1;
  if (filled < question.blanks.length) return { ...state, filled, eliminated: [], feedback: { kind: "correct", char } };
  return {
    ...state,
    filled,
    eliminated: [],
    answers: [...state.answers, { line: question.line, mistakes: state.lineMistakes }],
    feedback: { kind: "solved", line: question.line },
  };
}

export function nextFeihuaLine(state: FeihuaState): FeihuaState {
  if (!isFeihuaLineSolved(state) || isFeihuaComplete(state)) return state;
  return { ...state, index: state.index + 1, filled: 0, eliminated: [], lineMistakes: 0, feedback: { kind: "idle" } };
}

export function getFeihuaStars(state: FeihuaState): number {
  return getGameStars(state.mistakes, 0);
}

export function describeFeihuaFeedback(feedback: FeihuaFeedback, key: string): string {
  switch (feedback.kind) {
    case "idle": return `这句诗里有「${key}」，选出空格里缺的字。`;
    case "correct": return `「${feedback.char}」对了，再填下一个空。`;
    case "wrong": return `不是「${feedback.char}」，已把它划掉，再想想。`;
    case "solved": return `答对了：${feedback.line.text}——《${feedback.line.title}》${feedback.line.author}`;
  }
}

export const feihuaWorkHref = (line: FeihuaLine) => `/poetry/read/?poem=haitang-${line.workId}`;
