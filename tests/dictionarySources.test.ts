import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import test from "node:test";
import sources from "../data/dictionary-sources.json";
import { dictionaryShard } from "../lib/dictionaryData";
import type { RevisedEntry, XinhuaEntry } from "../lib/dictionarySources";

test("all added source records round-trip to static shards with fields and duplicates intact", async () => {
  const expected: Record<string, Map<string, unknown[]>> = { revised: new Map(), xinhua: new Map() };
  const idioms = new Set<string>();
  for (const source of sources) {
    const bytes = await readFile(source.snapshot);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), source.snapshotSha256);
    const entries = JSON.parse(gunzipSync(bytes).toString());
    assert.equal(entries.length, source.entries);
    const kind = source.id.replace("xinhua-", "");
    const group = expected[source.id === "revised" ? "revised" : "xinhua"];
    const heads = new Set();
    for (const entry of entries) {
      const head = source.id === "revised" ? entry.title : kind === "word" ? entry.ci : entry.word;
      heads.add(head);
      if (!group.has(head)) group.set(head, []);
      group.get(head)!.push(source.id === "revised" ? entry : { kind, data: entry });
      if (kind === "idiom") idioms.add(head);
    }
    assert.equal(heads.size, source.uniqueHeads);
  }
  for (const [name, group] of Object.entries(expected)) {
    const titles = JSON.parse(await readFile(`public/dictionary/${name}/index.json`, "utf8"));
    assert.deepEqual(titles, [...group.keys()].sort());
    let count = 0;
    for (let shard = 0; shard < 128; shard++) {
      const key = shard.toString(16).padStart(2, "0");
      const actual = JSON.parse(await readFile(`public/dictionary/${name}/${key}.json`, "utf8"));
      for (const [head, records] of Object.entries(actual)) {
        assert.equal(dictionaryShard(head), key);
        assert.deepEqual(records, group.get(head), `${name}: ${head}`);
        count++;
      }
    }
    assert.equal(count, group.size);
  }
  assert.deepEqual(JSON.parse(await readFile("public/dictionary/xinhua/idioms.json", "utf8")), [...idioms].sort());
  const readings = (expected.revised.get("學習")![0] as RevisedEntry).heteronyms;
  assert.deepEqual(readings.map(reading => reading.pinyin), ["xué xi", "xué xí"]);
  const repeated = [...expected.xinhua.values()].find(records => records.filter(record => (record as XinhuaEntry).kind === "character").length > 1);
  assert.ok(repeated, "polyphonic character records must not be overwritten");
});
