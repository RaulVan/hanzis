import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import test from "node:test";
import manifest from "../data/poetry-pinyin-manifest.json";
import source from "../data/haitang-manifest.json";
import { makePoetryPinyin, textHash, type PinyinOverrides } from "../scripts/prepare-poetry-pinyin";
import { validatePoetryPinyin, type PoetryPinyinEntry } from "../lib/poetryPinyin";

const empty: PinyinOverrides = { phrases: {}, works: {} };
test("poetry readings preserve alignment and curated context instead of modern default polyphony", () => {
  const work = { id: 1, content: "朝辞白帝彩云间，千里江陵一日还。\r\n曲项向天歌。\n𠮷𠀀ABC，\n" };
  const result = makePoetryPinyin(work, empty);
  assert.equal(result.lines[0][0], "zhāo");
  assert.equal(result.lines[0].at(-1), "huán");
  assert.equal(result.lines[1][0], "qū");
  assert.deepEqual(result.lines[2], ["", ""]);
  assert.deepEqual(result.lines[3], []);
  assert.equal(result.missing, 2);
  assert.equal(result.correctedLines, 2);
  assert.ok(validatePoetryPinyin(work.content, result));
  assert.equal(work.content.includes("\r\n"), true);
  assert.equal(validatePoetryPinyin(work.content, { ...result, lines: [result.lines[0].slice(1), ...result.lines.slice(1)] }), false);
});

test("work-specific overrides win, bind to text and reject stale, invalid and unused positions", () => {
  const work = { id: 2, content: "𠮷\n曲项向天歌。" };
  const specific = { textHash: textHash(work.content), readings: { "0": { char: "𠮷", pinyin: "jí" }, "2": { char: "曲", pinyin: "qǔ" } } };
  const result = makePoetryPinyin(work, { phrases: { "曲项向天歌": "qū xiàng xiàng tiān gē" }, works: { "2": specific } });
  assert.equal(result.lines[0][0], "jí");
  assert.equal(result.lines[1][0], "qǔ");
  assert.equal(result.missing, 0);
  assert.throws(() => makePoetryPinyin({ ...work, content: work.content + "！" }, { ...empty, works: { "2": specific } }), /Stale/);
  assert.throws(() => makePoetryPinyin(work, { ...empty, works: { "2": { ...specific, readings: { "99": { char: "字", pinyin: "zì" } } } } }), /Out-of-range/);
  assert.throws(() => makePoetryPinyin(work, { phrases: { "曲项": "qū" }, works: {} }), /Invalid/);
  assert.throws(() => makePoetryPinyin(work, { ...empty, works: { "2": { ...specific, readings: { "0": { char: "错", pinyin: "cuò" } } } } }), /Invalid/);
});

test("all published pinyin shards match the source text and manifest, including missing readings", async () => {
  const { tables } = JSON.parse(gunzipSync(await readFile(source.snapshot)).toString());
  const works = new Map<number, { content: string }>(tables.works.map((work: { id: number; content: string }) => [work.id, work]));
  let count = 0, han = 0, missing = 0, partialWorks = 0, correctedLines = 0;
  assert.equal(manifest.sourceSnapshotSha256, source.snapshotSha256);
  for (const [file, hash] of Object.entries(manifest.shards)) {
    const raw = await readFile(`public/poetry/pinyin/${file}`);
    assert.equal(createHash("sha256").update(raw).digest("hex"), hash);
    const shard = JSON.parse(raw.toString());
    assert.equal(shard.revision, manifest.revision);
    for (const [id, value] of Object.entries(shard.entries)) {
      const entry = value as PoetryPinyinEntry;
      const work = works.get(Number(id))!;
      assert.ok(work);
      assert.equal(Number(id) % 128, parseInt(file, 16));
      assert.equal(entry.textHash, textHash(work.content));
      assert.ok(validatePoetryPinyin(work.content, entry), id);
      count++; missing += entry.missing; correctedLines += entry.correctedLines;
      if (entry.missing) partialWorks++;
      han += entry.lines.reduce((n, line) => n + line.length, 0);
    }
  }
  assert.deepEqual({ count, han, missing, partialWorks, correctedLines }, { count: manifest.works, han: manifest.han, missing: manifest.missing, partialWorks: manifest.partialWorks, correctedLines: manifest.correctedLines });
  assert.equal(count, works.size);
});
