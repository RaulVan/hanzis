import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import test from "node:test";
import { join } from "node:path";
import assetManifest from "../data/asset-manifest.json";
import audioManifest from "../data/audio-manifest.json";
import { poems, getPoem, poemText } from "../data/poems";
import { dictionaryShard, validateDictionaryQuery, type DictionaryQuery } from "../lib/dictionaryData";

const root = process.cwd();
const query = (value: Partial<DictionaryQuery>): DictionaryQuery => ({ q: "学", kind: "all", radical: "", strokes: null, ...value });

test("the poetry library has unique routes and one pinyin syllable for every Han character", () => {
  assert.equal(poems.length, 30);
  assert.equal(new Set(poems.map(poem => poem.slug)).size, poems.length);
  assert.deepEqual(new Set(poems.map(poem => poem.dynasty)), new Set(["唐", "宋"]));
  const markedTone = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/u;
  for (const poem of poems) {
    assert.equal(getPoem(poem.slug), poem);
    assert.ok(poem.translation.length >= 20);
    assert.ok(poem.notes.length >= 2);
    assert.ok(Array.from(poemText(poem)).filter(char => /\p{Script=Han}/u.test(char)).length <= 200);
    for (const line of poem.lines) {
      const characters = Array.from(line.text).filter(char => /\p{Script=Han}/u.test(char));
      assert.equal(line.pinyin.length, characters.length, `${poem.title}: ${line.text}`);
      for (const syllable of line.pinyin) assert.match(syllable, markedTone, `${poem.title}: ${syllable}`);
    }
  }
  assert.equal(getPoem("lu-zhai")?.lines[2].pinyin[1], "yǐng");
});

test("dictionary validation accepts supported searches and rejects unsafe or ambiguous input", () => {
  for (const value of [query({ q: "学习" }), query({ q: "xué" }), query({ q: "xue2" }), query({ q: "", radical: "木" }), query({ q: "", strokes: 8 })]) {
    assert.equal(validateDictionaryQuery(value), null);
  }
  assert.match(validateDictionaryQuery(query({ q: "" })) ?? "", /请输入/);
  assert.match(validateDictionaryQuery(query({ q: "学<script>" })) ?? "", /请输入汉字/);
  assert.match(validateDictionaryQuery(query({ q: "学".repeat(25) })) ?? "", /最多输入/);
  assert.equal(dictionaryShard("学"), (("学".codePointAt(0) ?? 0) % 128).toString(16).padStart(2, "0"));
  assert.equal(dictionaryShard("𠮷"), (("𠮷".codePointAt(0) ?? 0) % 128).toString(16).padStart(2, "0"));
});

test("versioned source snapshots and license notices match the release manifest", async () => {
  const sources = [
    ["data/dictionary-source.json.gz", assetManifest.dictionarySourceSha256],
    ["data/moe-concised-source.json.gz", assetManifest.moeSourceSha256],
  ] as const;
  for (const [path, expected] of sources) {
    const digest = createHash("sha256").update(await readFile(join(root, path))).digest("hex");
    assert.equal(digest, expected);
  }
  for (const path of ["licenses/ARPHICPL.TXT", "licenses/cnchar-data-MIT.txt", "licenses/MOE-Concised-Usage.pdf", "licenses/NOTICE.txt"]) {
    assert.ok((await stat(join(root, path))).size > 100, path);
  }
  const notice = await readFile(join(root, "licenses/NOTICE.txt"), "utf8");
  assert.match(notice, /confirmed oral\s+authorization on 2026-09-01/);
  assert.match(notice, /written authorization statement will be added/);
});

test("every declared local recording exists with a non-empty MP3 frame or ID3 header", async () => {
  const files = (await readdir(join(root, "public/voice"))).filter(file => file.endsWith(".mp3")).sort();
  assert.equal(files.length, assetManifest.audio);
  assert.deepEqual(files, [...audioManifest].sort());
  for (const file of files) {
    const bytes = await readFile(join(root, "public/voice", file));
    assert.ok(bytes.length > 128, file);
    const id3 = bytes.subarray(0, 3).toString("ascii") === "ID3";
    const frame = bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;
    assert.ok(id3 || frame, `${file} does not begin with an MP3 header`);
  }
});
