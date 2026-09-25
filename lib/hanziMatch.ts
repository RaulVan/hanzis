import type { HanziMatchLevel, HanziMatchWord } from "@/data/hanziMatchLevels";
import { getGameStars } from "@/lib/gameStars";
import { hashString, shuffleWithSeed } from "@/lib/seededRandom";

export const HANZI_MATCH_COLUMNS = 4;

export interface HanziMatchTile {
  id: number;
  char: string;
  /** Reading of the character inside the word it was dealt from; only shown when every copy shares it. */
  pinyin: string;
}

export type HanziMatchFeedback =
  | { kind: "idle" }
  | { kind: "selected"; char: string }
  | { kind: "deselected" }
  | { kind: "found"; word: HanziMatchWord }
  | { kind: "reversed"; attempt: string; word: string }
  | { kind: "not-word"; attempt: string }
  | { kind: "hint"; word: string };

export interface HanziMatchState {
  levelId: string;
  tiles: readonly HanziMatchTile[];
  removed: readonly number[];
  found: readonly string[];
  selected: number | null;
  hinted: readonly number[];
  mistakes: number;
  hints: number;
  /** Words the player needed a hint for or entered in the wrong order during this attempt. */
  review: readonly string[];
  feedback: HanziMatchFeedback;
}

function syllables(pinyin: string): string[] {
  return pinyin.split(" ");
}

/** Deals the level's characters onto a shuffled board; the same level and attempt always give the same layout. */
export function createHanziMatchState(level: HanziMatchLevel, attempt: number): HanziMatchState {
  const dealt = level.words.flatMap(word => {
    const readings = syllables(word.pinyin);
    return [...word.word].map((char, index) => ({ char, pinyin: readings[index] }));
  });
  return {
    levelId: level.id,
    tiles: shuffleWithSeed(dealt, hashString(`${level.id}:${attempt}`)).map((tile, id) => ({ id, ...tile })),
    removed: [],
    found: [],
    selected: null,
    hinted: [],
    mistakes: 0,
    hints: 0,
    review: [],
    feedback: { kind: "idle" },
  };
}

export function remainingWords(level: HanziMatchLevel, state: HanziMatchState): HanziMatchWord[] {
  const found = [...state.found];
  return level.words.filter(word => {
    const index = found.indexOf(word.word);
    if (index === -1) return true;
    found.splice(index, 1);
    return false;
  });
}

export function isHanziMatchComplete(level: HanziMatchLevel, state: HanziMatchState): boolean {
  return state.found.length === level.words.length;
}

const addReview = (review: readonly string[], word: string) => review.includes(word) ? review : [...review, word];

/** Applies one tile tap. The first tap selects; the second tap is judged in the order the tiles were chosen. */
export function selectHanziMatchTile(level: HanziMatchLevel, state: HanziMatchState, tileId: number): HanziMatchState {
  const tile = state.tiles[tileId];
  if (!tile || state.removed.includes(tileId) || isHanziMatchComplete(level, state)) return state;
  if (state.selected === null) return { ...state, selected: tileId, feedback: { kind: "selected", char: tile.char } };
  if (state.selected === tileId) return { ...state, selected: null, feedback: { kind: "deselected" } };

  const first = state.tiles[state.selected];
  const attempt = `${first.char}${tile.char}`;
  const reversed = `${tile.char}${first.char}`;
  const remaining = remainingWords(level, state);
  const match = remaining.find(word => word.word === attempt);
  if (match) {
    return {
      ...state,
      removed: [...state.removed, first.id, tile.id],
      found: [...state.found, match.word],
      selected: null,
      hinted: [],
      feedback: { kind: "found", word: match },
    };
  }
  const reversedMatch = remaining.find(word => word.word === reversed);
  if (reversedMatch) {
    return {
      ...state,
      selected: null,
      mistakes: state.mistakes + 1,
      review: addReview(state.review, reversedMatch.word),
      feedback: { kind: "reversed", attempt, word: reversedMatch.word },
    };
  }
  return { ...state, selected: null, mistakes: state.mistakes + 1, feedback: { kind: "not-word", attempt } };
}

/** Finds two distinct remaining tiles that spell the first unfinished word. */
export function findHintTiles(level: HanziMatchLevel, state: HanziMatchState): { word: string; tiles: [number, number] } | null {
  const available = state.tiles.filter(tile => !state.removed.includes(tile.id));
  for (const word of remainingWords(level, state)) {
    const [firstChar, secondChar] = [...word.word];
    const first = available.find(tile => tile.char === firstChar);
    const second = available.find(tile => tile.char === secondChar && tile.id !== first?.id);
    if (first && second) return { word: word.word, tiles: [first.id, second.id] };
  }
  return null;
}

export function applyHanziMatchHint(level: HanziMatchLevel, state: HanziMatchState): HanziMatchState {
  if (isHanziMatchComplete(level, state)) return state;
  // An unresolved hint is still on the board; asking again repeats it without costing another star.
  if (state.hinted.length > 0) {
    const word = state.hinted.map(id => state.tiles[id].char).join("");
    return { ...state, selected: null, feedback: { kind: "hint", word } };
  }
  const hint = findHintTiles(level, state);
  if (!hint) return state;
  return {
    ...state,
    selected: null,
    hinted: hint.tiles,
    hints: state.hints + 1,
    review: addReview(state.review, hint.word),
    feedback: { kind: "hint", word: hint.word },
  };
}

export function getHanziMatchStars(mistakes: number, hints: number): number {
  return getGameStars(mistakes, hints);
}

/** Beginner tiles may show pinyin only when every copy of a character on the board has the same reading. */
export function hasConsistentTileReadings(level: HanziMatchLevel): boolean {
  const readings = new Map<string, string>();
  for (const word of level.words) {
    const parts = syllables(word.pinyin);
    for (const [index, char] of [...word.word].entries()) {
      const known = readings.get(char);
      if (known && known !== parts[index]) return false;
      readings.set(char, parts[index]);
    }
  }
  return true;
}

export function describeHanziMatchFeedback(feedback: HanziMatchFeedback): string {
  switch (feedback.kind) {
    case "idle": return "先点词语的第一个字，再点第二个字。";
    case "selected": return `已选「${feedback.char}」，再点这个词的第二个字。`;
    case "deselected": return "已取消选择。";
    case "found": return `找到了「${feedback.word.word}」（${feedback.word.pinyin}）：${feedback.word.meaning}`;
    case "reversed": return `字找对了，但顺序反了：不是「${feedback.attempt}」，而是「${feedback.word}」。`;
    case "not-word": return `「${feedback.attempt}」不是本关要找的词语，换一个字试试。`;
    case "hint": return "提示已高亮两个字，按从前到后的顺序点它们。";
  }
}
