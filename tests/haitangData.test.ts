import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { gunzipSync } from "node:zlib";
import test from "node:test";
import manifest from "../data/haitang-manifest.json";
import { curatedSummaries, filterPoetry, haitangId, haitangPoem, poetryText } from "../lib/poetryCatalog";
import { poemText } from "../data/poems";
import type { HaitangCatalog, HaitangWork } from "../lib/haitangTypes";

test("Haitang snapshots preserve all records and public shards faithfully expose every work", async () => {
  const bytes = await readFile(manifest.snapshot);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), manifest.snapshotSha256);
  const raw = gunzipSync(bytes);
  assert.equal(createHash("sha256").update(raw).digest("hex"), manifest.rawSha256);
  const { tables } = JSON.parse(raw.toString());
  for (const [table, count] of Object.entries(manifest.counts)) assert.equal(tables[table].length, count);
  const catalog: HaitangCatalog = JSON.parse(await readFile("public/poetry/haitang/index.json", "utf8"));
  assert.equal(catalog.revision, manifest.revision);
  assert.equal(catalog.works.length, manifest.counts.works);
  assert.equal(new Set(catalog.works.map(work => work.slug)).size, manifest.counts.works);
  const originals = new Map<number, HaitangWork>(tables.works.map((work: HaitangWork) => [work.id, work]));
  const exported = new Map<number, HaitangWork>();
  for (let shard = 0; shard < 128; shard++) {
    const records: Record<string, HaitangWork> = JSON.parse(await readFile(`public/poetry/haitang/${shard.toString(16).padStart(2, "0")}.json`, "utf8"));
    for (const work of Object.values(records)) {
      assert.equal(work.id % 128, shard);
      const original = originals.get(work.id)!;
      for (const field of ["title", "author", "dynasty", "content", "content_tr", "foreword", "annotation", "translation", "intro", "master_comment"] as const) assert.equal(work[field], original[field] ?? "");
      exported.set(work.id, work);
    }
  }
  assert.equal(exported.size, manifest.counts.works);
  for (const summary of catalog.works) {
    const work = exported.get(haitangId(summary.slug)!)!;
    assert.equal(summary.title, work.title);
    assert.equal(summary.excerpt, Array.from(poetryText(work.content)).slice(0, 120).join(""));
    for (const id of summary.collectionIds) assert.ok(catalog.collections.some(collection => collection.id === id));
  }
  const adapted = haitangPoem(exported.get(10103)!);
  assert.equal(adapted.title, "春江花月夜");
  assert.equal(poemText(adapted), poetryText(exported.get(10103)!.content));
  assert.ok(adapted.lines.every(line => line.pinyin.length === 0));
  // Known upstream defects are auditable, not fabricated into display records.
  const collectionIds = new Set<number>(tables.collections.map((row: { id: number }) => row.id));
  const links: { work_id: number; collection_id: number }[] = tables.collection_works;
  const validLinks = links.filter(link => originals.has(link.work_id) && collectionIds.has(link.collection_id));
  assert.equal(links.length - validLinks.length, manifest.missingReferences.collectionWorks);
  assert.equal(catalog.collections.length, new Set(validLinks.map(link => link.collection_id)).size);
  for (const [table, comparison] of Object.entries(manifest.jsonComparison)) {
    const ids = new Set(tables[table].map((row: { id?: number | string; version?: string }) => String(row.id ?? row.version)));
    for (const id of comparison.onlySqliteIds) assert.ok(ids.has(id));
    for (const id of comparison.onlyJsonIds) assert.ok(!ids.has(id));
  }
});

test("poetry filtering respects source, stable IDs, dynasty, collection and persisted favorites", () => {
  const extended = { slug: "haitang-10156", title: "静夜思", author: "李白", dynasty: "唐", kind: "诗", excerpt: "床前明月光", collectionIds: [1] };
  const all = [...curatedSummaries, extended];
  const filter = { query: "静夜思", source: "all", dynasty: "all", collection: "all", favorites: [] as string[] };
  assert.equal(filterPoetry(all, filter).length, 2);
  assert.equal(filterPoetry(all, { ...filter, source: "curated" })[0].slug, "jing-ye-si");
  assert.deepEqual(filterPoetry(all, { ...filter, source: "haitang", dynasty: "宋" }), []);
  assert.equal(filterPoetry(all, { ...filter, collection: "1" })[0].slug, extended.slug);
  assert.equal(filterPoetry(all, { ...filter, source: "saved", favorites: [extended.slug] })[0].slug, extended.slug);
  assert.equal(filterPoetry(all, { ...filter, query: "床前明月光", source: "haitang" }).length, 1);
  assert.equal(haitangId("haitang-10156"), 10156);
  for (const slug of ["haitang-0", "../10156", "haitang-1e3", "haitang-01", "haitang-99999999999"]) assert.equal(haitangId(slug), null);
});

test("the import/update CLI previews changes, rejects unreviewed drift and preserves deterministic sources", () => {
  execFileSync("python3", ["tests/haitang_import_test.py"], { timeout: 60_000, stdio: "pipe" });
});
