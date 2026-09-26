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
  /** Theme rounds mark this character instead of the round title. */
  highlight?: string;
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

export type FeihuaMode = "fill" | "theme" | "recite";

export const FEIHUA_THEMES = [
  { id: "spring", name: "春天", keys: ["春", "花"] },
  { id: "moon", name: "月夜", keys: ["月", "夜"] },
  { id: "water", name: "山水", keys: ["山", "水", "江"] },
  { id: "wind", name: "风雨", keys: ["风", "雨", "云"] },
  { id: "autumn", name: "秋色", keys: ["秋"] },
  { id: "snow", name: "冬雪", keys: ["雪"] },
] as const;

export type FeihuaThemeId = (typeof FEIHUA_THEMES)[number]["id"];

export interface FeihuaState {
  key: string;
  tier: FeihuaTier;
  mode: "fill" | "theme";
  /** Storage id: a keyword, or a theme id. */
  progressId: string;
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
    mode: "fill",
    progressId: key,
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

export function feihuaThemeById(id: string) {
  return FEIHUA_THEMES.find(theme => theme.id === id);
}

/** Lines in this tier that contain one of the theme's keywords. The highlighted character stays visible. */
export function feihuaThemeLines(data: FeihuaData, tier: FeihuaTier, themeId: string): { line: FeihuaLine; highlight: string }[] {
  const theme = feihuaThemeById(themeId);
  if (!theme) return [];
  const seen = new Set<number>();
  const lines: { line: FeihuaLine; highlight: string }[] = [];
  for (const key of theme.keys) {
    for (const line of feihuaLinesFor(data, tier, key)) {
      if (seen.has(line.id)) continue;
      const highlight = theme.keys.find(item => line.text.includes(item));
      const others = highlight ? [...line.text].filter(char => char !== highlight).length : 0;
      if (!highlight || others < feihuaBlankCount[tier]) continue;
      seen.add(line.id);
      lines.push({ line, highlight });
    }
  }
  return lines;
}

export function createFeihuaThemeState(data: FeihuaData, tier: FeihuaTier, themeId: string, attempt: number): FeihuaState {
  const theme = feihuaThemeById(themeId);
  if (!theme) throw new Error(`未知飞花主题：${themeId}`);
  const seed = hashString(`theme:${tier}:${themeId}:${attempt}`);
  const picked = shuffleWithSeed(feihuaThemeLines(data, tier, themeId), seed).slice(0, FEIHUA_ROUND_LINES);
  return {
    key: theme.name,
    tier,
    mode: "theme",
    progressId: theme.id,
    questions: picked.map((item, index) => ({ ...buildQuestion(data, tier, item.highlight, item.line, seed + index * 31), highlight: item.highlight })),
    index: 0,
    filled: 0,
    eliminated: [],
    lineMistakes: 0,
    mistakes: 0,
    answers: [],
    feedback: { kind: "idle" },
  };
}

export interface FeihuaReciteTurn {
  by: "player" | "system";
  line: FeihuaLine;
}

export type FeihuaReciteFeedback =
  | { kind: "idle" | "empty" | "format" | "missing" | "duplicate" | "unknown" | "accepted" | "done"; text: string };

export interface FeihuaReciteState {
  key: string;
  tier: FeihuaTier;
  progressId: string;
  pool: readonly FeihuaLine[];
  bank: ReadonlyMap<string, FeihuaLine>;
  used: readonly string[];
  turns: readonly FeihuaReciteTurn[];
  mistakes: number;
  done: boolean;
  feedback: FeihuaReciteFeedback;
}

export const FEIHUA_RECITE_TURNS = 4;

export function normalizeFeihuaInput(input: string): string {
  return [...input.normalize("NFC").replace(/[\s，。！？、；：,.!?《》「」『』“”‘’—…·（）()【】]/gu, "")].join("");
}

export function createFeihuaReciteState(data: FeihuaData, tier: FeihuaTier, key: string, attempt: number): FeihuaReciteState {
  const seed = hashString(`recite:${tier}:${key}:${attempt}`);
  const bank = new Map<string, FeihuaLine>();
  for (const item of [...feihuaLinesFor(data, "basic", key), ...feihuaLinesFor(data, "advanced", key)]) {
    if (!bank.has(item.text)) bank.set(item.text, item);
  }
  return {
    key,
    tier,
    progressId: key,
    pool: shuffleWithSeed(feihuaLinesFor(data, tier, key), seed),
    bank,
    used: [],
    turns: [],
    mistakes: 0,
    done: false,
    feedback: { kind: "idle", text: `说出一句含有「${key}」的五言或七言。系统会接着给一句。` },
  };
}

export function submitFeihuaRecite(state: FeihuaReciteState, input: string): FeihuaReciteState {
  if (state.done) return state;
  const text = normalizeFeihuaInput(input);
  if (!text) return { ...state, feedback: { kind: "empty", text: "先写一句诗。" } };
  const chars = [...text];
  if ((chars.length !== 5 && chars.length !== 7) || chars.some(char => !/\p{Script=Han}/u.test(char))) {
    return { ...state, feedback: { kind: "format", text: "请输入五个或七个汉字，不用标点。" } };
  }
  if (!text.includes(state.key)) {
    return { ...state, mistakes: state.mistakes + 1, feedback: { kind: "missing", text: `这句里没有「${state.key}」。` } };
  }
  if (state.used.includes(text)) {
    return { ...state, mistakes: state.mistakes + 1, feedback: { kind: "duplicate", text: "这句已经用过了。" } };
  }
  const line = state.bank.get(text);
  if (!line) return { ...state, mistakes: state.mistakes + 1, feedback: { kind: "unknown", text: "未收录。这句不在本题库里。" } };
  const example = state.pool.find(item => item.text !== text && !state.used.includes(item.text));
  const turns = [...state.turns, { by: "player" as const, line }, ...(example ? [{ by: "system" as const, line: example }] : [])];
  const used = [...state.used, text, ...(example ? [example.text] : [])];
  const done = turns.filter(turn => turn.by === "player").length >= FEIHUA_RECITE_TURNS;
  const reply = example ? `接得上。系统接了一句：${example.text}` : "接得上。这一档里没有更多句子了。";
  return { ...state, turns, used, done, feedback: { kind: done ? "done" : "accepted", text: reply } };
}

export function getFeihuaReciteStars(state: FeihuaReciteState): number {
  return getGameStars(state.mistakes, 0);
}
