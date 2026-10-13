import assert from "node:assert/strict";
import { test } from "node:test";
import english from "../locales/en.json";
import { resolveLanguage, translate } from "../lib/i18n";

test("Chinese language variants select Chinese and every other language selects English", () => {
  for (const value of ["zh", "zh-CN", "zh-TW", "zh-Hant-HK", "ZH-sg", "zh_CN"]) assert.equal(resolveLanguage(value), "zh");
  for (const value of ["en-US", "ja-JP", "fr-FR", "de-DE", "", "zho"]) assert.equal(resolveLanguage(value), "en");
  assert.equal(resolveLanguage("en-US", "zh"), "zh");
  assert.equal(resolveLanguage("zh-CN", "en"), "en");
  assert.equal(resolveLanguage("ja-JP", "invalid"), "en");
});

test("interface templates translate while learning values stay verbatim", () => {
  assert.equal(translate("第 2 / 8 句", "en"), "Line 2 / 8");
  assert.equal(translate("第 {0} / {1} 页", "en", ["2", "5"]), "Page 2 / 5");
  assert.equal(translate("用“{0}”生成字帖", "en", ["字"]), "Create worksheet for “字”");
  assert.equal(translate("查询“字”的释义", "en"), "Look up “字”");
  assert.equal(translate("写出上面{0}的拼音", "en", ["词语"]), "Write the pinyin for the Words above");
  assert.equal(translate("第 2 / 8 句", "zh"), "第 2 / 8 句");
  assert.equal(translate("春眠不觉晓，处处闻啼鸟。", "en"), "春眠不觉晓，处处闻啼鸟。");
});

test("English messages retain every source placeholder", () => {
  for (const [source, target] of Object.entries(english)) {
    const parameters = (value: string) => [...new Set(value.match(/\{\d+\}/g) ?? [])].sort();
    assert.deepEqual(parameters(target), parameters(source), source);
  }
});

test("English count labels use singular forms without rewriting learning values", () => {
  assert.equal(translate("共 {0} 页", "en", ["1"]), "1 page");
  assert.equal(translate("共 12 页", "en"), "12 pages");
  assert.equal(translate("{0} 个汉字", "en", ["1"]), "1 character");
  assert.equal(translate("用“{0}”生成字帖", "en", ["1 pages"]), "Create worksheet for “1 pages”");
});
