import assert from "node:assert/strict";
import test from "node:test";
import type { HanziData } from "../lib/hanziData";
import { createLocalStrokeDataLoader } from "../lib/strokeDataLoader";
import {
  extractFirstStrokeCharacter,
  getCumulativeStrokePaths,
  getStrokeLoadErrorMessage,
  getStrokeName,
  getStrokeSpeed,
  type StrokeSpeedId,
} from "../lib/strokeLearning";

test("character extraction uses Unicode code points and keeps the first Han character", () => {
  assert.equal(extractFirstStrokeCharacter("abc，学习"), "学");
  assert.equal(extractFirstStrokeCharacter("😀𠀀汉"), "𠀀");
  assert.equal(extractFirstStrokeCharacter("A豈B"), "豈");
  assert.equal(extractFirstStrokeCharacter("pinyin 123"), null);
  assert.equal(extractFirstStrokeCharacter(null), null);
});

test("animation speed presets preserve a clear slow-to-fast order and a safe default", () => {
  const slow = getStrokeSpeed("slow");
  const normal = getStrokeSpeed("normal");
  const fast = getStrokeSpeed("fast");
  assert.ok(slow.animationSpeed < normal.animationSpeed);
  assert.ok(normal.animationSpeed < fast.animationSpeed);
  assert.ok(slow.delayBetweenStrokes > normal.delayBetweenStrokes);
  assert.ok(normal.delayBetweenStrokes > fast.delayBetweenStrokes);
  assert.equal(getStrokeSpeed("unknown" as StrokeSpeedId), normal);
});

test("cumulative stroke stages add exactly one path without changing the source", () => {
  const paths = ["first", "second", "third"];
  const before = [...paths];
  assert.deepEqual(getCumulativeStrokePaths(paths), [
    ["first"],
    ["first", "second"],
    ["first", "second", "third"],
  ]);
  assert.deepEqual(paths, before);
});

test("stroke names and recoverable loading errors remain useful to learners", () => {
  assert.equal(getStrokeName("h", 0), "横");
  assert.equal(getStrokeName("横撇|横钩", 1), "横撇／横钩");
  assert.equal(getStrokeName("横折弯钩", 1), "横折弯钩");
  assert.equal(getStrokeName(undefined, 2), "第 3 笔");
  const timeout = new DOMException("The operation was aborted", "AbortError");
  assert.match(getStrokeLoadErrorMessage(timeout), /超时/);
  assert.equal(
    getStrokeLoadErrorMessage(new Error("字库暂未收录这个字的笔顺，可继续查看读音或生成字帖。")),
    "字库暂未收录这个字的笔顺，可继续查看读音或生成字帖。",
  );
  assert.match(getStrokeLoadErrorMessage("unknown"), /稍后重试/);
});

test("the HanziWriter adapter serves preloaded data without a network request", () => {
  const data: HanziData = { strokes: ["M0 0"], medians: [[[0, 0], [1, 1]]] };
  const loader = createLocalStrokeDataLoader("永", data);
  assert.equal(loader("永", () => undefined, () => undefined), data);
});
