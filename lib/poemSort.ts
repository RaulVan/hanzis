import { poems, type Poem } from "@/data/poems";
import { getGameStars } from "@/lib/gameStars";
import { hashString, shuffleWithSeed } from "@/lib/seededRandom";

const PUNCTUATION = /[，。！？、；：]/g;

export type PoemSortDifficulty = "beginner" | "intermediate";

export interface PoemSortLine {
  chars: string[];
  pinyin: string[];
}

export interface PoemSortLevel {
  slug: string;
  title: string;
  author: string;
  dynasty: string;
  translation: string;
  notes: { word: string; meaning: string }[];
  difficulty: PoemSortDifficulty;
  lines: PoemSortLine[];
}

export interface PoemSortFeedback {
  kind: "idle" | "wrong" | "hint" | "line";
  text: string;
}

export interface PoemSortState {
  level: PoemSortLevel;
  orders: number[][];
  lineIndex: number;
  filled: number;
  picked: number[];
  mistakes: number;
  hints: number;
  done: boolean;
  feedback: PoemSortFeedback;
}

/** Five- and seven-character lines from the curated poems. A poem needs at least two such lines. */
export function poemSortLevels(source: readonly Poem[] = poems): PoemSortLevel[] {
  return source.flatMap(poem => {
    const lines: PoemSortLine[] = [];
    for (const line of poem.lines) {
      const chars = [...line.text.replace(PUNCTUATION, "")];
      if ((chars.length !== 5 && chars.length !== 7) || chars.length !== line.pinyin.length) continue;
      lines.push({ chars, pinyin: [...line.pinyin] });
    }
    if (lines.length < 2) return [];
    const difficulty: PoemSortDifficulty = lines.every(line => line.chars.length === 5) ? "beginner" : "intermediate";
    return [{
      slug: poem.slug,
      title: poem.title,
      author: poem.author,
      dynasty: poem.dynasty,
      translation: poem.translation,
      notes: poem.notes.map(note => ({ ...note })),
      difficulty,
      lines,
    }];
  });
}

export const poemSortCatalog = poemSortLevels();

function scrambledOrder(chars: readonly string[], seed: number): number[] {
  const original = chars.join("");
  let order = shuffleWithSeed(chars.map((_, index) => index), seed);
  for (let turn = 0; turn < chars.length && order.map(index => chars[index]).join("") === original; turn += 1) {
    order = [order[order.length - 1], ...order.slice(0, -1)];
  }
  return order;
}

export function createPoemSortState(level: PoemSortLevel, attempt: number): PoemSortState {
  return {
    level,
    orders: level.lines.map((line, index) => scrambledOrder(line.chars, hashString(`${level.slug}:${attempt}:${index}`))),
    lineIndex: 0,
    filled: 0,
    picked: [],
    mistakes: 0,
    hints: 0,
    done: false,
    feedback: { kind: "idle", text: "按顺序点出这一句。" },
  };
}

export function poemSortRemaining(state: PoemSortState): number[] {
  return state.orders[state.lineIndex].filter(index => !state.picked.includes(index));
}

/** Accepts any unused tile with the next character, so a repeated character is not tied to one slot. */
export function choosePoemSortTile(state: PoemSortState, tileIndex: number): PoemSortState {
  if (state.done || state.picked.includes(tileIndex)) return state;
  const line = state.level.lines[state.lineIndex];
  if (!line || line.chars[tileIndex] !== line.chars[state.filled]) {
    return { ...state, mistakes: state.mistakes + 1, feedback: { kind: "wrong", text: "这个字还不到这里。" } };
  }
  const filled = state.filled + 1;
  const picked = [...state.picked, tileIndex];
  if (filled < line.chars.length) {
    return { ...state, filled, picked, feedback: { kind: "idle", text: "继续点下一个字。" } };
  }
  if (state.lineIndex + 1 >= state.level.lines.length) {
    return { ...state, filled, picked, done: true, feedback: { kind: "line", text: "整首诗排好了。" } };
  }
  return {
    ...state,
    lineIndex: state.lineIndex + 1,
    filled: 0,
    picked: [],
    feedback: { kind: "line", text: "这一句排好了，开始下一句。" },
  };
}

export function hintPoemSort(state: PoemSortState): PoemSortState {
  if (state.done) return state;
  const line = state.level.lines[state.lineIndex];
  const tileIndex = poemSortRemaining(state).find(index => line.chars[index] === line.chars[state.filled]);
  if (tileIndex === undefined) return state;
  const next = choosePoemSortTile({ ...state, hints: state.hints + 1 }, tileIndex);
  if (next.lineIndex === state.lineIndex && !next.done) {
    return { ...next, feedback: { kind: "hint", text: "已经放上下一个字。" } };
  }
  return next;
}

export function getPoemSortStars(state: Pick<PoemSortState, "mistakes" | "hints">): number {
  return getGameStars(state.mistakes, state.hints);
}
