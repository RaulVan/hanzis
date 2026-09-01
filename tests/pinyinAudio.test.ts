import assert from "node:assert/strict";
import test from "node:test";
import {
  getPinyinAudioSource,
  getPinyinAudioUrl,
  parsePinyinSyllable,
} from "../lib/pinyinAudio";

test("marked, numeric, and umlaut syllables map to canonical recording names", () => {
  assert.deepEqual(parsePinyinSyllable("mā"), { syllable: "ma", tone: 1 });
  assert.deepEqual(parsePinyinSyllable("ma4"), { syllable: "ma", tone: 4 });
  assert.deepEqual(parsePinyinSyllable("nǚ"), { syllable: "nv", tone: 3 });
  assert.deepEqual(parsePinyinSyllable("nu:3"), { syllable: "nv", tone: 3 });
});

test("neutral tone never borrows a first-tone recording", () => {
  assert.deepEqual(parsePinyinSyllable("ma"), { syllable: "ma", tone: 0 });
  assert.deepEqual(parsePinyinSyllable("ma5"), { syllable: "ma", tone: 0 });
  assert.equal(getPinyinAudioUrl("ma"), null);
  assert.equal(getPinyinAudioSource("ma"), "系统中文语音");
});

test("known marked syllables resolve to packaged audio and contradictory marks are rejected", () => {
  assert.equal(getPinyinAudioUrl("mā"), "/voice/ma1.mp3");
  assert.equal(getPinyinAudioUrl("mà"), "/voice/ma4.mp3");
  assert.equal(getPinyinAudioSource("mǎ"), "本地录音");
  assert.equal(parsePinyinSyllable("mā2"), null);
  assert.equal(parsePinyinSyllable("not pinyin"), null);
});
