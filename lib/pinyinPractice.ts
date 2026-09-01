export type PracticeQuestionKind = "sight" | "audio-tone";
export type PracticeTone = 0 | 1 | 2 | 3 | 4;

export interface PracticeOption {
  id: string;
  label: string;
}

export interface PracticeQuestion {
  id: string;
  kind: PracticeQuestionKind;
  prompt: string;
  char: string;
  pinyin: string;
  tone: PracticeTone;
  options: PracticeOption[];
  correctOptionId: string;
  explanation: string;
}

interface SightSource {
  id: string;
  char: string;
  pinyin: string;
  tone: Exclude<PracticeTone, 0>;
  choices: readonly [string, string, string, string];
}

interface AudioSource {
  id: string;
  char: string;
  pinyin: string;
  tone: PracticeTone;
}

export const PRACTICE_QUESTION_COUNT = 10;

const toneLabels: Record<PracticeTone, string> = {
  0: "轻声（不标调号）",
  1: "第一声（55）",
  2: "第二声（35）",
  3: "第三声（214）",
  4: "第四声（51）",
};

const sightSources: readonly SightSource[] = [
  { id: "zi", char: "字", pinyin: "zì", tone: 4, choices: ["zì", "zhì", "cí", "sī"] },
  { id: "shan", char: "山", pinyin: "shān", tone: 1, choices: ["shān", "shàng", "shuǐ", "shū"] },
  { id: "xue", char: "学", pinyin: "xué", tone: 2, choices: ["xué", "xuě", "xiě", "yuè"] },
  { id: "nv", char: "女", pinyin: "nǚ", tone: 3, choices: ["nǚ", "lǜ", "yǔ", "ní"] },
  { id: "ren", char: "人", pinyin: "rén", tone: 2, choices: ["rén", "rì", "lái", "lín"] },
  { id: "hua", char: "花", pinyin: "huā", tone: 1, choices: ["huā", "huí", "hóng", "hē"] },
  { id: "yue", char: "月", pinyin: "yuè", tone: 4, choices: ["yuè", "yún", "yè", "xué"] },
  { id: "shui", char: "水", pinyin: "shuǐ", tone: 3, choices: ["shuǐ", "shuì", "shū", "shuāi"] },
  { id: "hao", char: "好", pinyin: "hǎo", tone: 3, choices: ["hǎo", "gāo", "háo", "hào"] },
  { id: "tian", char: "天", pinyin: "tiān", tone: 1, choices: ["tiān", "tīng", "diǎn", "nián"] },
];

const audioSources: readonly AudioSource[] = [
  { id: "ma-1", char: "妈", pinyin: "mā", tone: 1 },
  { id: "ma-2", char: "麻", pinyin: "má", tone: 2 },
  { id: "ma-3", char: "马", pinyin: "mǎ", tone: 3 },
  { id: "ma-4", char: "骂", pinyin: "mà", tone: 4 },
  { id: "ma-0", char: "吗", pinyin: "ma", tone: 0 },
];

function normalizeRound(round: number): number {
  return Number.isFinite(round) ? Math.max(0, Math.trunc(round)) : 0;
}

function rotate<T>(values: readonly T[], offset: number): T[] {
  if (values.length === 0) return [];
  const start = ((offset % values.length) + values.length) % values.length;
  return [...values.slice(start), ...values.slice(0, start)];
}

function createSightQuestion(source: SightSource, round: number, index: number): PracticeQuestion {
  const choices = rotate(source.choices, round + index);
  return {
    id: `round-${round}-sight-${source.id}`,
    kind: "sight",
    prompt: `“${source.char}”读什么？`,
    char: source.char,
    pinyin: source.pinyin,
    tone: source.tone,
    options: choices.map((label) => ({ id: `pinyin-${label}`, label })),
    correctOptionId: `pinyin-${source.pinyin}`,
    explanation: `“${source.char}”读 ${source.pinyin}，是${toneLabels[source.tone]}。`,
  };
}

function createAudioQuestion(source: AudioSource, round: number, index: number): PracticeQuestion {
  const tones = rotate<PracticeTone>([0, 1, 2, 3, 4], round + index);
  const lightToneNote = source.tone === 0 ? "，轻声不标调号" : "";
  return {
    id: `round-${round}-audio-${source.id}`,
    kind: "audio-tone",
    prompt: "听发音，选择声调",
    char: source.char,
    pinyin: source.pinyin,
    tone: source.tone,
    options: tones.map((tone) => ({ id: `tone-${tone}`, label: toneLabels[tone] })),
    correctOptionId: `tone-${source.tone}`,
    explanation: `“${source.char}”读 ${source.pinyin}，是${toneLabels[source.tone]}${lightToneNote}。`,
  };
}

/**
 * Produces a repeatable ten-question round: five sight questions alternate with
 * all five tone-listening questions. The round number changes order without
 * relying on runtime randomness, so the same input is always testable.
 */
export function createPracticeRound(round = 0): PracticeQuestion[] {
  const normalizedRound = normalizeRound(round);
  const sightStart = (normalizedRound * 5) % sightSources.length;
  const selectedSight = Array.from({ length: 5 }, (_, index) =>
    sightSources[(sightStart + index) % sightSources.length],
  );
  const selectedAudio = rotate(audioSources, normalizedRound);

  return selectedSight.flatMap((source, index) => [
    createSightQuestion(source, normalizedRound, index),
    createAudioQuestion(selectedAudio[index], normalizedRound, index),
  ]);
}

export function gradePracticeAnswer(question: PracticeQuestion, optionId: string): {
  correct: boolean;
  correctOption: PracticeOption;
  selectedOption: PracticeOption | null;
} {
  const correctOption = question.options.find((option) => option.id === question.correctOptionId);
  if (!correctOption) throw new Error(`题目 ${question.id} 缺少正确选项。`);
  const selectedOption = question.options.find((option) => option.id === optionId) ?? null;
  return { correct: selectedOption?.id === correctOption.id, correctOption, selectedOption };
}

export function getPracticeResultMessage(score: number, total: number): string {
  if (total <= 0) return "先完成一轮练习，再查看学习结果。";
  const ratio = Math.max(0, Math.min(score, total)) / total;
  if (ratio === 1) return "全部答对，四声和常见拼音已经掌握得很稳。";
  if (ratio >= 0.8) return "掌握得很好，再听一轮，把容易混淆的声调读稳。";
  if (ratio >= 0.6) return "已经有进步，建议重听错题中的发音再练一次。";
  return "先回到声调页跟读，再来完成一轮练习。";
}
