import assert from "node:assert/strict";
import test from "node:test";
import { parsePinyinSyllable, parsePinyinSyllables, toneLabel } from "../lib/pinyinSyllable";

test("pinyin syllables follow the 23-initial lessons, with y and w folded into the final", () => {
  assert.deepEqual(parsePinyinSyllable("yī"), { initial: "", final: "i", tone: 1 });
  assert.deepEqual(parsePinyinSyllable("yuè"), { initial: "", final: "üe", tone: 4 });
  assert.deepEqual(parsePinyinSyllable("wǔ"), { initial: "", final: "u", tone: 3 });
  assert.deepEqual(parsePinyinSyllable("zhōng"), { initial: "zh", final: "ong", tone: 1 });
  assert.deepEqual(parsePinyinSyllable("lǜ"), { initial: "l", final: "ü", tone: 4 });
  assert.deepEqual(parsePinyinSyllable("de"), { initial: "d", final: "e", tone: 0 });
  assert.deepEqual(parsePinyinSyllable("jū"), { initial: "j", final: "ü", tone: 1 });
  assert.deepEqual(parsePinyinSyllable("qù"), { initial: "q", final: "ü", tone: 4 });
  assert.deepEqual(parsePinyinSyllable("xué"), { initial: "x", final: "üe", tone: 2 });
  assert.equal(parsePinyinSyllable("zh"), null);
  assert.equal(parsePinyinSyllables("yī xīn yī yì", 4)?.map(item => item.tone).join(""), "1114");
  assert.equal(toneLabel(0), "轻声");
  assert.equal(toneLabel(1), "一声");
});
