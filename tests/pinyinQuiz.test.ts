import assert from "node:assert/strict";
import test from "node:test";
import { pinyin } from "pinyin-pro";
import { pinyinQuizCharacters, pinyinQuizWords, type PinyinQuizItem } from "../data/pinyinQuizItems";
import {
  createPinyinQuizState,
  currentPinyinQuizItem,
  describePinyinQuizFeedback,
  gradePinyinAnswer,
  isPinyinQuizExhausted,
  pinyinQuizReview,
  pinyinQuizScore,
  skipPinyinQuizItem,
  submitPinyinQuizAnswer,
  UNTIMED_QUESTION_COUNT,
} from "../lib/pinyinQuiz";
import { emptyPinyinQuizProgress, parsePinyinQuizProgress, recordPinyinQuizRound } from "../lib/pinyinQuizProgress";

const character = (text: string) => pinyinQuizCharacters.find(item => item.text === text)!;
const word = (text: string) => pinyinQuizWords.find(item => item.text === text)!;

test("character questions have a single standard reading, a tone, and come from their example word", () => {
  assert.ok(pinyinQuizCharacters.length >= 100);
  assert.equal(new Set(pinyinQuizCharacters.map(item => item.text)).size, pinyinQuizCharacters.length);
  for (const item of pinyinQuizCharacters) {
    assert.match(item.text, /^\p{Script=Han}$/u);
    assert.deepEqual(pinyin(item.text, { multiple: true, type: "array" }), [item.pinyin], item.text);
    assert.match(item.pinyin, /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/, `${item.text} is neutral`);
    const source = word(item.word);
    assert.equal(source.pinyin.split(" ")[[...source.text].indexOf(item.text)], item.pinyin, item.text);
  }
  assert.equal(pinyinQuizWords.length, 120);
  assert.ok(pinyinQuizWords.every(item => item.meaning));
});

test("plain mode ignores tones, spaces and capitals, and accepts v or u for ü where allowed", () => {
  const huo = character("火");
  for (const input of ["huo", " HUO ", "huo3", "huǒ"]) assert.equal(gradePinyinAnswer(huo, input, "plain"), "correct", input);
  assert.equal(gradePinyinAnswer(word("火车"), "huo che", "plain"), "correct");
  assert.equal(gradePinyinAnswer(word("火车"), "huoche", "plain"), "correct");
  const ju: PinyinQuizItem = { id: "t-ju", mode: "character", text: "居", pinyin: "jū", word: "居住" };
  const lv: PinyinQuizItem = { id: "t-lv", mode: "character", text: "绿", pinyin: "lǜ", word: "绿色" };
  for (const input of ["ju", "jv", "jü", "ju:"]) assert.equal(gradePinyinAnswer(ju, input, "plain"), "correct", input);
  for (const input of ["lv", "lü", "lu:", "lv4", "lǜ"]) assert.equal(gradePinyinAnswer(lv, input, "plain"), "correct", input);
  assert.equal(gradePinyinAnswer(lv, "lu", "plain"), "initial");
});

test("toned mode accepts digits or marks and treats the neutral tone as optional 0 or 5", () => {
  const moon = word("月亮");
  for (const input of ["yue4liang", "yue4 liang5", "yue4liang0", "yuèliang", "yuè liang"]) assert.equal(gradePinyinAnswer(moon, input, "toned"), "correct", input);
  for (const input of ["yueliang", "yue2liang", "yue4liang4", "yuéliang"]) assert.equal(gradePinyinAnswer(moon, input, "toned"), "tone", input);
  const lv: PinyinQuizItem = { id: "t-lv", mode: "character", text: "绿", pinyin: "lǜ", word: "绿色" };
  for (const input of ["lv4", "lü4", "lǜ"]) assert.equal(gradePinyinAnswer(lv, input, "toned"), "correct", input);
  const qu: PinyinQuizItem = { id: "t-qu", mode: "character", text: "去", pinyin: "qù", word: "去年" };
  for (const input of ["qu4", "qv4", "qù", "qǜ"]) assert.equal(gradePinyinAnswer(qu, input, "toned"), "correct", input);
});

test("wrong answers are classified so feedback can say what to fix", () => {
  assert.equal(gradePinyinAnswer(character("火"), "", "plain"), "empty");
  assert.equal(gradePinyinAnswer(character("火"), "火", "plain"), "han");
  assert.equal(gradePinyinAnswer(character("火"), "hua", "plain"), "initial");
  assert.equal(gradePinyinAnswer(character("花"), "fa", "plain"), "wrong");
  assert.equal(gradePinyinAnswer(word("火车"), "huo chi", "plain"), "wrong");
  assert.equal(gradePinyinAnswer(character("书"), "shu3", "toned"), "tone");
  assert.match(describePinyinQuizFeedback({ kind: "retry", verdict: "tone" }, "toned"), /声调不对/);
  assert.match(describePinyinQuizFeedback({ kind: "retry", verdict: "han" }, "plain"), /关闭中文输入法/);
  assert.match(describePinyinQuizFeedback({ kind: "correct", item: character("火") }, "plain"), /火 huǒ（火车）/);
});

test("rounds are shuffled deterministically; untimed rounds stop after twenty questions", () => {
  const first = createPinyinQuizState(pinyinQuizCharacters, 90, 1);
  assert.deepEqual(first, createPinyinQuizState(pinyinQuizCharacters, 90, 1));
  assert.equal(first.items.length, pinyinQuizCharacters.length);
  assert.notDeepEqual(first.items.map(item => item.id), createPinyinQuizState(pinyinQuizCharacters, 90, 2).items.map(item => item.id));
  const untimed = createPinyinQuizState(pinyinQuizWords, 0, 1);
  assert.equal(untimed.items.length, UNTIMED_QUESTION_COUNT);
  assert.equal(new Set(untimed.items.map(item => item.id)).size, UNTIMED_QUESTION_COUNT);
});

test("answering tracks score, streaks, wrong attempts and skipped items for review", () => {
  let state = createPinyinQuizState(pinyinQuizCharacters, 0, 3);
  const answer = () => currentPinyinQuizItem(state)!.pinyin;
  state = submitPinyinQuizAnswer(state, answer(), "toned");
  state = submitPinyinQuizAnswer(state, answer(), "toned");
  assert.equal(state.streak, 2);
  const third = currentPinyinQuizItem(state)!;
  state = submitPinyinQuizAnswer(state, "", "plain");
  assert.equal(state.wrongAttempts, 0, "empty input is not a mistake");
  assert.equal(state.streak, 2);
  state = submitPinyinQuizAnswer(state, "xx", "plain");
  assert.equal(state.wrongAttempts, 1);
  assert.equal(state.streak, 0);
  assert.equal(currentPinyinQuizItem(state), third);
  state = submitPinyinQuizAnswer(state, answer(), "plain");
  state = skipPinyinQuizItem(state);
  assert.equal(pinyinQuizScore(state), 3);
  assert.equal(state.bestStreak, 2);
  assert.deepEqual(pinyinQuizReview(state).map(item => [item.item.id, item.outcome, item.wrongAttempts]), [[third.id, "correct", 1], [state.answers[3].item.id, "skipped", 0]]);
  while (!isPinyinQuizExhausted(state)) state = skipPinyinQuizItem(state);
  assert.equal(state.answers.length, UNTIMED_QUESTION_COUNT);
  assert.equal(skipPinyinQuizItem(state), state);
  assert.equal(submitPinyinQuizAnswer(state, "a", "plain"), state);
});

test("best scores are kept per setting and stored data is validated", () => {
  const settings = { mode: "word", toneMode: "plain", duration: 90 } as const;
  let progress = recordPinyinQuizRound(emptyPinyinQuizProgress, settings, { score: 12, bestStreak: 5 });
  progress = recordPinyinQuizRound(progress, settings, { score: 9, bestStreak: 7 });
  assert.deepEqual(progress["word:plain:90"], { score: 12, bestStreak: 7 });
  assert.deepEqual(parsePinyinQuizProgress(JSON.stringify(progress)), progress);
  assert.deepEqual(parsePinyinQuizProgress(JSON.stringify({ "word:plain:90": { score: -1, bestStreak: 0 }, "x:y:z": { score: 1, bestStreak: 1 }, "character:toned:0": { score: 4, bestStreak: 2 } })), { "character:toned:0": { score: 4, bestStreak: 2 } });
  assert.equal(parsePinyinQuizProgress("nope"), emptyPinyinQuizProgress);
});
