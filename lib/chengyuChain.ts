import { chengyuChains, type ChengyuChain, type ChengyuEntry } from "@/data/chengyuChains";
import { getGameStars } from "@/lib/gameStars";
import { hashString, shuffleWithSeed } from "@/lib/seededRandom";

export interface ChengyuQuestion {
  prompt: string;
  answer: string;
  options: string[];
}

export interface ChengyuFeedback {
  kind: "idle" | "wrong" | "correct" | "hint";
  text: string;
}

export interface ChengyuChainState {
  chain: ChengyuChain;
  questions: ChengyuQuestion[];
  index: number;
  eliminated: string[];
  mistakes: number;
  hints: number;
  hinted: boolean;
  done: boolean;
  feedback: ChengyuFeedback;
}

const byText = new Map(chengyuChains.flatMap(chain => chain.idioms.map(entry => [entry.text, entry] as const)));

export function chengyuEntry(text: string): ChengyuEntry | undefined {
  return byText.get(text);
}

export function createChengyuChainState(chain: ChengyuChain, attempt: number): ChengyuChainState {
  const bank = chengyuChains.flatMap(item => item.idioms);
  const questions = chain.idioms.slice(0, -1).map((prompt, index) => {
    const answer = chain.idioms[index + 1];
    const start = [...answer.text][0];
    const pool = bank.filter(item => item.text !== answer.text && [...item.text][0] !== start).map(item => item.text);
    const distractors = shuffleWithSeed(pool, hashString(`${chain.id}:${attempt}:${index}:d`)).slice(0, 3);
    if (distractors.length < 3) throw new Error(`成语接龙干扰项不足：${answer.text}`);
    return {
      prompt: prompt.text,
      answer: answer.text,
      options: shuffleWithSeed([answer.text, ...distractors], hashString(`${chain.id}:${attempt}:${index}:o`)),
    };
  });
  return {
    chain,
    questions,
    index: 0,
    eliminated: [],
    mistakes: 0,
    hints: 0,
    hinted: false,
    done: false,
    feedback: { kind: "idle", text: `从「${chain.idioms[0].text}」接下去。` },
  };
}

export function chooseChengyuOption(state: ChengyuChainState, option: string): ChengyuChainState {
  if (state.done) return state;
  const question = state.questions[state.index];
  if (!question.options.includes(option) || state.eliminated.includes(option)) return state;
  if (option === question.answer) {
    const meaning = byText.get(option)?.meaning;
    const text = meaning ? `接上了「${option}」：${meaning}` : `接上了「${option}」。`;
    if (state.index + 1 >= state.questions.length) return { ...state, done: true, feedback: { kind: "correct", text } };
    return { ...state, index: state.index + 1, eliminated: [], hinted: false, feedback: { kind: "correct", text } };
  }
  const needed = [...question.answer][0];
  const got = [...option][0];
  return {
    ...state,
    mistakes: state.mistakes + 1,
    eliminated: [...state.eliminated, option],
    feedback: { kind: "wrong", text: `「${option}」以「${got}」开头，这里要接以「${needed}」开头的成语。` },
  };
}

export function hintChengyuChain(state: ChengyuChainState): ChengyuChainState {
  if (state.done) return state;
  if (state.hinted) return { ...state, feedback: { kind: "hint", text: "正确的成语已经标出来了。" } };
  return { ...state, hints: state.hints + 1, hinted: true, feedback: { kind: "hint", text: "正确的成语已经标出来了。" } };
}

export function getChengyuChainStars(state: Pick<ChengyuChainState, "mistakes" | "hints">): number {
  return getGameStars(state.mistakes, state.hints);
}
