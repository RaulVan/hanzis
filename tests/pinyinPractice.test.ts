import assert from "node:assert/strict";
import test from "node:test";
import { finals, wholeSyllables } from "../data/pinyin";
import {
  createPracticeRound,
  getPracticeResultMessage,
  gradePracticeAnswer,
  PRACTICE_QUESTION_COUNT,
} from "../lib/pinyinPractice";

test("a round is deterministic, contains ten alternating question types, and covers every tone", () => {
  const first = createPracticeRound(0);
  assert.deepEqual(first, createPracticeRound(0));
  assert.equal(first.length, PRACTICE_QUESTION_COUNT);
  assert.deepEqual(
    first.map((question) => question.kind),
    Array.from({ length: 5 }).flatMap(() => ["sight", "audio-tone"]),
  );
  assert.deepEqual(
    first.filter((question) => question.kind === "audio-tone").map((question) => question.tone).sort(),
    [0, 1, 2, 3, 4],
  );
});

test("every question has one reachable correct answer and no duplicate options", () => {
  for (const question of createPracticeRound(3)) {
    assert.equal(new Set(question.options.map((option) => option.id)).size, question.options.length);
    assert.equal(question.options.filter((option) => option.id === question.correctOptionId).length, 1);
  }
});

test("the next round changes the question order while remaining repeatable", () => {
  const roundZero = createPracticeRound(0).map((question) => `${question.kind}:${question.char}`);
  const roundOne = createPracticeRound(1).map((question) => `${question.kind}:${question.char}`);
  assert.notDeepEqual(roundZero, roundOne);
  assert.deepEqual(createPracticeRound(1), createPracticeRound(1));
});

test("answer grading reports correct, incorrect, and unknown selections without changing the source", () => {
  const question = createPracticeRound(0)[0];
  const before = structuredClone(question);
  const correct = gradePracticeAnswer(question, question.correctOptionId);
  const wrongId = question.options.find((option) => option.id !== question.correctOptionId)?.id;
  assert.equal(correct.correct, true);
  assert.equal(gradePracticeAnswer(question, wrongId ?? "missing").correct, false);
  assert.equal(gradePracticeAnswer(question, "missing").selectedOption, null);
  assert.deepEqual(question, before);
});

test("result messages distinguish perfect, strong, developing, and empty attempts", () => {
  assert.match(getPracticeResultMessage(10, 10), /全部答对/);
  assert.match(getPracticeResultMessage(8, 10), /掌握得很好/);
  assert.match(getPracticeResultMessage(6, 10), /已经有进步/);
  assert.match(getPracticeResultMessage(3, 10), /回到声调页/);
  assert.match(getPracticeResultMessage(0, 0), /先完成一轮/);
});

test("teaching examples keep o, un, and ri aligned with their actual syllables", () => {
  const singleO = finals.find((item) => item.letter === "o");
  const frontUn = finals.find((item) => item.letter === "un");
  const wholeRi = wholeSyllables.find((item) => item.syllable === "ri");
  assert.ok(singleO?.examples.some((example) => example.char === "摸" && example.pinyin === "mō"));
  assert.equal(singleO?.examples.some((example) => example.char === "我"), false);
  assert.ok(frontUn?.examples.some((example) => example.char === "轮" && example.pinyin === "lún"));
  assert.equal(frontUn?.examples.some((example) => example.char === "云"), false);
  assert.deepEqual(wholeRi?.examples, [{ char: "日", pinyin: "rì" }]);
});
