import assert from "node:assert/strict";
import test from "node:test";
import type { CharacterInfo } from "../types";
import { applyWorksheetPinyin } from "../lib/worksheetPinyin";

const info = (char: string, pinyinWithTone: string): CharacterInfo => ({ char, pinyinWithTone, pinyin: "", tone: 0,
  strokeCount: 0, radical: "", radicalStrokeCount: 0, struct: "", strokeOrder: [], strokeNames: [] });

test("contextual pronunciation updates the tone without losing umlaut vowels", () => {
  const result = applyWorksheetPinyin([info("觉", "jiào"), info("女", "nǚ")], ["jué", "nǚ"]);
  assert.equal(result[0].pinyinWithTone, "jué");
  assert.equal(result[0].tone, 2);
  assert.equal(result[1].pinyin, "nü");
});

test("a missing supplementary character cannot shift the following syllable", () => {
  const result = applyWorksheetPinyin([info("春", "chūn"), info("𠮷", "𠮷"), info("眠", "mián")], ["chūn", "\uD842", "\uDFB7", "mián"]);
  assert.deepEqual(result.map((item) => item.pinyinWithTone), ["chūn", "", "mián"]);
});

test("replacement symbols and original Han characters never print as pinyin", () => {
  const result = applyWorksheetPinyin([info("𠮷", "�"), info("龘", "龘")], ["�", "龘"]);
  assert.deepEqual(result.map((item) => item.pinyin), ["", ""]);
});
