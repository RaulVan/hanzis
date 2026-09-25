import assert from "node:assert/strict";
import test from "node:test";
import { pinyin } from "pinyin-pro";
import { HANZI_MATCH_CONTENT_VERSION, hanziMatchContentSource, hanziMatchLevels, type HanziMatchLevel } from "../data/hanziMatchLevels";
import {
  applyHanziMatchHint,
  createHanziMatchState,
  describeHanziMatchFeedback,
  findHintTiles,
  getHanziMatchStars,
  hasConsistentTileReadings,
  isHanziMatchComplete,
  selectHanziMatchTile,
  type HanziMatchState,
} from "../lib/hanziMatch";
import {
  emptyHanziMatchProgress,
  getNextHanziMatchLevel,
  isHanziMatchLevelUnlocked,
  MAX_REVIEW_WORDS,
  parseHanziMatchProgress,
  recordHanziMatchCompletion,
} from "../lib/hanziMatchProgress";

/** Words whose standard reading (现代汉语词典) differs from the engine, which does not mark the neutral tone. */
const reviewedReadings: Record<string, string> = {
  月亮: "轻声 liang",
  朋友: "轻声 you",
  热闹: "轻声 nao",
  月饼: "轻声 bing",
  饺子: "轻声 zi",
  学生: "轻声 sheng",
  故事: "轻声 shi",
  湖泊: "泊读 pō，不读 bó",
};

const level = (id: string) => hanziMatchLevels.find(item => item.id === id)!;
const allWords = hanziMatchLevels.flatMap(item => item.words);

function tileFor(state: HanziMatchState, char: string, exclude?: number) {
  return state.tiles.find(tile => tile.char === char && !state.removed.includes(tile.id) && tile.id !== exclude)!.id;
}

function play(item: HanziMatchLevel, state: HanziMatchState, word: string) {
  const [a, b] = [...word];
  const first = tileFor(state, a);
  return selectHanziMatchTile(item, selectHanziMatchTile(item, state, first), tileFor(state, b, first));
}

test("each difficulty has five numbered levels of eight unique two-character words", () => {
  for (const difficulty of ["beginner", "intermediate", "challenge"] as const) {
    const levels = hanziMatchLevels.filter(item => item.difficulty === difficulty);
    assert.deepEqual(levels.map(item => item.number), [1, 2, 3, 4, 5]);
    for (const item of levels) {
      assert.equal(item.id, `${difficulty}-${item.number}`);
      assert.equal(item.words.length, 8);
      assert.ok(item.theme.length > 0);
    }
  }
  assert.equal(new Set(allWords.map(word => word.word)).size, allWords.length, "a word appears in more than one level");
  assert.equal(new Set(hanziMatchLevels.map(item => item.id)).size, hanziMatchLevels.length);
  assert.equal(HANZI_MATCH_CONTENT_VERSION, 1);
  assert.equal(hanziMatchContentSource.reviewStatus, "unreviewed");
});

test("every entry has Han characters, one syllable per character, a meaning, and an example using the word", () => {
  for (const entry of allWords) {
    assert.match(entry.word, /^\p{Script=Han}{2}$/u, entry.word);
    assert.equal(entry.pinyin.split(" ").length, 2, entry.word);
    assert.match(entry.pinyin, /^[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]+ [a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]+$/, entry.word);
    assert.ok(entry.meaning.length >= 3 && entry.meaning.endsWith("。"), entry.word);
    assert.ok(entry.example.includes(entry.word), `${entry.word} example does not use the word`);
    assert.ok(!entry.meaning.includes(entry.word), `${entry.word} meaning repeats the answer`);
  }
});

test("word readings agree with pinyin-pro unless explicitly reviewed", () => {
  const mismatches = allWords
    .filter(entry => entry.pinyin !== pinyin(entry.word, { toneSandhi: false }))
    .map(entry => entry.word);
  assert.deepEqual(mismatches.sort(), Object.keys(reviewedReadings).sort());
});

test("beginner tiles show readings only where every copy of a character is read the same way", () => {
  for (const item of hanziMatchLevels.filter(entry => entry.difficulty === "beginner")) {
    assert.ok(hasConsistentTileReadings(item), item.id);
  }
  assert.equal(hasConsistentTileReadings(level("challenge-5")), false);
});

test("challenge levels are built around shared characters or reversible pairs", () => {
  for (const item of hanziMatchLevels.filter(entry => entry.difficulty === "challenge")) {
    const counts = new Map<string, number>();
    for (const char of item.words.flatMap(word => [...word.word])) counts.set(char, (counts.get(char) ?? 0) + 1);
    assert.ok([...counts.values()].filter(count => count > 1).length >= 3, item.id);
  }
});

test("boards are deterministic per attempt and deal exactly the level's characters", () => {
  const item = level("beginner-1");
  const first = createHanziMatchState(item, 0);
  assert.deepEqual(first, createHanziMatchState(item, 0));
  assert.notDeepEqual(first.tiles.map(tile => tile.char), createHanziMatchState(item, 1).tiles.map(tile => tile.char));
  assert.equal(first.tiles.length, 16);
  assert.deepEqual(first.tiles.map(tile => tile.char).sort(), item.words.flatMap(word => [...word.word]).sort());
  assert.deepEqual(first.tiles.map(tile => tile.id), [...Array(16).keys()]);
});

test("every level can be finished in word order with no mistakes and earns three stars", () => {
  for (const item of hanziMatchLevels) {
    let state = createHanziMatchState(item, 7);
    for (const entry of item.words) {
      state = play(item, state, entry.word);
      assert.equal(state.feedback.kind, "found", `${item.id}: ${entry.word}`);
    }
    assert.ok(isHanziMatchComplete(item, state));
    assert.equal(state.removed.length, 16);
    assert.equal(getHanziMatchStars(state.mistakes, state.hints), 3);
  }
});

test("selection explains reversed order, words outside the level, and deselection", () => {
  const item = level("beginner-1");
  let state = createHanziMatchState(item, 0);
  const huo = tileFor(state, "火");
  const che = tileFor(state, "车");
  state = selectHanziMatchTile(item, state, huo);
  assert.deepEqual(state.feedback, { kind: "selected", char: "火" });
  state = selectHanziMatchTile(item, state, huo);
  assert.deepEqual(state.feedback, { kind: "deselected" });
  state = selectHanziMatchTile(item, selectHanziMatchTile(item, state, che), huo);
  assert.deepEqual(state.feedback, { kind: "reversed", attempt: "车火", word: "火车" });
  assert.deepEqual(state.review, ["火车"]);
  state = selectHanziMatchTile(item, selectHanziMatchTile(item, state, huo), tileFor(state, "海"));
  assert.deepEqual(state.feedback, { kind: "not-word", attempt: "火海" });
  assert.equal(state.mistakes, 2);
  assert.equal(state.removed.length, 0);
  assert.match(describeHanziMatchFeedback({ kind: "reversed", attempt: "车火", word: "火车" }), /顺序反了.*火车/);
  const unchanged = selectHanziMatchTile(item, state, 99);
  assert.equal(unchanged, state);
});

test("reversible pairs accept both orders once each and a solved word cannot be claimed twice", () => {
  const item = level("challenge-4");
  let state = play(item, createHanziMatchState(item, 3), "牛奶");
  assert.equal(state.feedback.kind, "found");
  state = play(item, state, "牛奶");
  assert.deepEqual(state.feedback, { kind: "reversed", attempt: "牛奶", word: "奶牛" });
  state = play(item, state, "奶牛");
  assert.equal(state.feedback.kind, "found");
  assert.deepEqual(state.found, ["牛奶", "奶牛"]);
});

test("words made of one repeated character need two different tiles", () => {
  const item = level("beginner-2");
  let state = createHanziMatchState(item, 0);
  const hua = tileFor(state, "画");
  state = selectHanziMatchTile(item, selectHanziMatchTile(item, state, hua), hua);
  assert.equal(state.feedback.kind, "deselected");
  state = play(item, state, "画画");
  assert.equal(state.feedback.kind, "found");
});

test("hints highlight a solvable pair, record the word for review, and cost stars", () => {
  const item = level("challenge-1");
  let state = createHanziMatchState(item, 0);
  state = applyHanziMatchHint(item, state);
  assert.equal(state.hints, 1);
  assert.equal(state.hinted.length, 2);
  const [first, second] = state.hinted;
  assert.equal(state.tiles[first].char + state.tiles[second].char, "天空");
  assert.deepEqual(state.review, ["天空"]);
  const repeated = applyHanziMatchHint(item, selectHanziMatchTile(item, state, first));
  assert.equal(repeated.hints, 1, "asking again for the same unresolved hint must not cost another star");
  assert.deepEqual(repeated.hinted, [first, second]);
  assert.equal(repeated.selected, null);
  assert.deepEqual(repeated.feedback, { kind: "hint", word: "天空" });
  state = selectHanziMatchTile(item, selectHanziMatchTile(item, state, first), second);
  assert.equal(state.feedback.kind, "found");
  assert.deepEqual(state.hinted, []);
  assert.equal(findHintTiles(item, state)?.word, "空气");
  assert.equal(getHanziMatchStars(0, 1), 2);
  assert.equal(getHanziMatchStars(3, 0), 2);
  assert.equal(getHanziMatchStars(9, 4), 1);
});

test("progress keeps best results, unlocks the next level, and prunes review words solved cleanly", () => {
  const first = level("beginner-1");
  const second = level("beginner-2");
  assert.ok(isHanziMatchLevelUnlocked(emptyHanziMatchProgress, first));
  assert.equal(isHanziMatchLevelUnlocked(emptyHanziMatchProgress, second), false);
  assert.equal(getNextHanziMatchLevel(first)?.id, "beginner-2");
  assert.equal(getNextHanziMatchLevel(level("beginner-5")), undefined);

  let progress = recordHanziMatchCompletion(emptyHanziMatchProgress, { levelId: first.id, stars: 2, mistakes: 3, hints: 0, review: ["火车", "白云"] });
  assert.ok(isHanziMatchLevelUnlocked(progress, second));
  progress = recordHanziMatchCompletion(progress, { levelId: first.id, stars: 1, mistakes: 1, hints: 2, review: ["白云"] });
  assert.deepEqual(progress.levels[first.id], { stars: 2, bestMistakes: 1, bestHints: 0 });
  assert.deepEqual(progress.review, ["白云"]);
  assert.equal(recordHanziMatchCompletion(progress, { levelId: "missing", stars: 3, mistakes: 0, hints: 0, review: [] }), progress);
});

test("stored progress is validated and discarded when the content version changes", () => {
  const saved = recordHanziMatchCompletion(emptyHanziMatchProgress, { levelId: "intermediate-1", stars: 3, mistakes: 0, hints: 0, review: ["勇敢"] });
  assert.deepEqual(parseHanziMatchProgress(JSON.stringify(saved)), saved);
  assert.equal(parseHanziMatchProgress(JSON.stringify({ ...saved, contentVersion: 0 })), emptyHanziMatchProgress);
  assert.equal(parseHanziMatchProgress("{not json"), emptyHanziMatchProgress);
  assert.equal(parseHanziMatchProgress(null), emptyHanziMatchProgress);
  const dirty = parseHanziMatchProgress(JSON.stringify({
    contentVersion: HANZI_MATCH_CONTENT_VERSION,
    levels: { "intermediate-1": { stars: 5, bestMistakes: 0, bestHints: 0 }, "beginner-1": { stars: 1, bestMistakes: 2, bestHints: 1 }, unknown: { stars: 3, bestMistakes: 0, bestHints: 0 } },
    review: ["勇敢", "勇敢", "不存在", 3, ...allWords.map(word => word.word)],
  }));
  assert.deepEqual(Object.keys(dirty.levels), ["beginner-1"]);
  assert.equal(dirty.review.length, MAX_REVIEW_WORDS);
  assert.ok(!dirty.review.includes("不存在"));
});
