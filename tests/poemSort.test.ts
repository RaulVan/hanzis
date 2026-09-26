import assert from "node:assert/strict";
import test from "node:test";
import { poems } from "../data/poems";
import {
  choosePoemSortTile,
  createPoemSortState,
  getPoemSortStars,
  hintPoemSort,
  poemSortCatalog,
  poemSortLevels,
  poemSortRemaining,
  type PoemSortState,
} from "../lib/poemSort";
import { emptyPoemSortProgress, parsePoemSortProgress, recordPoemSortRound } from "../lib/poemSortProgress";

function nextTile(state: PoemSortState): number {
  const line = state.level.lines[state.lineIndex];
  const needed = line.chars[state.filled];
  const tile = poemSortRemaining(state).find(index => line.chars[index] === needed);
  assert.ok(tile !== undefined);
  return tile;
}

function solve(state: PoemSortState): PoemSortState {
  let current = state;
  while (!current.done) current = choosePoemSortTile(current, nextTile(current));
  return current;
}

test("poem sort uses five- and seven-character lines from the curated poems", () => {
  assert.ok(poemSortCatalog.length >= 20);
  assert.equal(poemSortCatalog.some(level => level.slug === "ru-meng-ling"), false);
  const jing = poemSortCatalog.find(level => level.slug === "jing-ye-si");
  const bai = poemSortCatalog.find(level => level.slug === "zao-fa-bai-di-cheng");
  assert.equal(jing?.difficulty, "beginner");
  assert.deepEqual(jing?.lines[0].chars, ["床", "前", "明", "月", "光"]);
  assert.equal(bai?.difficulty, "intermediate");
  assert.equal(bai?.lines[0].chars.length, 7);
  for (const level of poemSortCatalog) {
    assert.ok(level.lines.length >= 2);
    for (const line of level.lines) {
      assert.ok(line.chars.length === 5 || line.chars.length === 7);
      assert.equal(line.pinyin.length, line.chars.length);
    }
    const five = level.lines.every(line => line.chars.length === 5);
    assert.equal(level.difficulty, five ? "beginner" : "intermediate");
  }
  assert.equal(poemSortLevels(poems).length, poemSortCatalog.length);
});

test("a round is scrambled and a wrong tile does not reveal the next character", () => {
  const level = poemSortCatalog.find(item => item.slug === "jing-ye-si")!;
  const state = createPoemSortState(level, 0);
  const shown = state.orders[0].map(index => level.lines[0].chars[index]).join("");
  assert.notEqual(shown, level.lines[0].chars.join(""));
  const wrong = poemSortRemaining(state).find(index => level.lines[0].chars[index] !== level.lines[0].chars[0])!;
  const missed = choosePoemSortTile(state, wrong);
  assert.equal(missed.mistakes, 1);
  assert.equal(missed.filled, 0);
  assert.equal(missed.feedback.text, "这个字还不到这里。");
  assert.equal(missed.feedback.text.includes("床"), false);
});

test("either copy of a repeated character can be placed", () => {
  const level = poemSortCatalog.find(item => item.slug === "chun-xiao")!;
  const lineIndex = level.lines.findIndex(line => line.chars.filter(char => char === "处").length === 2);
  assert.ok(lineIndex > 0);
  let state = createPoemSortState(level, 1);
  while (state.lineIndex < lineIndex) state = choosePoemSortTile(state, nextTile(state));
  const copies = poemSortRemaining(state).filter(index => state.level.lines[state.lineIndex].chars[index] === "处");
  assert.equal(copies.length, 2);
  state = choosePoemSortTile(state, Math.max(...copies));
  assert.equal(state.filled, 1);
  assert.equal(state.mistakes, 0);
});

test("hints place one character each and a clean solve keeps three stars", () => {
  const level = poemSortCatalog.find(item => item.slug === "jing-ye-si")!;
  let state = hintPoemSort(hintPoemSort(createPoemSortState(level, 2)));
  assert.equal(state.hints, 2);
  assert.equal(state.filled, 2);
  assert.equal(state.feedback.kind, "hint");
  state = solve(state);
  assert.equal(state.done, true);
  assert.equal(state.mistakes, 0);
  assert.equal(getPoemSortStars(state), 1);
  assert.equal(getPoemSortStars(solve(createPoemSortState(level, 3))), 3);
});

test("poem sort progress keeps the best stars and drops unknown saves", () => {
  const slugs = poemSortCatalog.map(level => level.slug);
  assert.deepEqual(parsePoemSortProgress(null, slugs), emptyPoemSortProgress);
  assert.deepEqual(parsePoemSortProgress("{", slugs), emptyPoemSortProgress);
  assert.deepEqual(parsePoemSortProgress(JSON.stringify({ "jing-ye-si": 3, missing: 2, "chun-xiao": 0, "yong-e": 4 }), slugs), { "jing-ye-si": 3 });
  assert.deepEqual(recordPoemSortRound({ "jing-ye-si": 3 }, "jing-ye-si", 1), { "jing-ye-si": 3 });
  assert.deepEqual(recordPoemSortRound({ "jing-ye-si": 1 }, "jing-ye-si", 2), { "jing-ye-si": 2 });
});
