import assert from "node:assert/strict";
import test from "node:test";
import { speechBoundaryEnd, speechChunks } from "../lib/speechProgress";

test("speech clauses retain source UTF-16 offsets across blank lines, whitespace and supplementary characters", () => {
  const text = "  𠮷山，\r\n\n 月明。  风！";
  const chunks = speechChunks(text);
  assert.deepEqual(chunks.map(chunk => chunk.text), ["𠮷山，", "月明。", "风！"]);
  for (const chunk of chunks) assert.equal(text.slice(chunk.start, chunk.end).trimEnd(), chunk.text);
  assert.equal(chunks[0].start, 2);
  assert.equal(chunks[1].start, 10);
  assert.equal(chunks.at(-1)!.end, text.length);
  assert.deepEqual(speechChunks("\n  "), []);
});

test("long speech segments are bounded without splitting supplementary characters", () => {
  const text = "𠮷".repeat(301);
  const chunks = speechChunks(text);
  assert.deepEqual(chunks.map(chunk => Array.from(chunk.text).length), [120, 120, 61]);
  assert.equal(chunks.map(chunk => chunk.text).join(""), text);
  assert.equal(chunks.at(-1)!.end, text.length);
});

test("word boundaries include the current word, while sentence boundaries never mark the entire sentence early", () => {
  assert.equal(speechBoundaryEnd("岱宗夫如何？", 0, 2, "word"), 2);
  assert.equal(speechBoundaryEnd("岱宗夫如何？", 0, 6, "sentence"), 0);
  assert.equal(speechBoundaryEnd("𠮷山，", 0, 0, "word"), 2);
  assert.equal(speechBoundaryEnd("𠮷山，", 0, 1, "word"), 2);
  assert.equal(speechBoundaryEnd("明月", 1, 99, "word"), 2);
  for (const offset of [-1, 2, NaN, 0.5]) assert.equal(speechBoundaryEnd("明月", offset, 1, "word"), null);
});
