import { preparePoetryPinyin } from "./prepare-poetry-pinyin.ts";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

export async function prepareHaitang(root) {
  const manifest = JSON.parse(await readFile(join(root, "data/haitang-manifest.json"), "utf8"));
  const bytes = await readFile(join(root, manifest.snapshot));
  if (createHash("sha256").update(bytes).digest("hex") !== manifest.snapshotSha256) throw new Error("Haitang snapshot checksum changed; audit and import the source first.");
  const { tables } = JSON.parse(gunzipSync(bytes));
  for (const [table, count] of Object.entries(manifest.counts)) {
    if (tables[table]?.length !== count) throw new Error(`Haitang ${table}: count mismatch`);
  }
  const works = new Map(tables.works.map(work => [work.id, work]));
  const collections = new Map(tables.collections.map(collection => [collection.id, collection]));
  const memberships = new Map();
  const coverage = new Map();
  for (const link of tables.collection_works) {
    // The source contains orphan links. Keep them in the snapshot, never fabricate a work.
    if (!works.has(link.work_id) || !collections.has(link.collection_id)) continue;
    if (!memberships.has(link.work_id)) memberships.set(link.work_id, new Set());
    memberships.get(link.work_id).add(link.collection_id);
    if (!coverage.has(link.collection_id)) coverage.set(link.collection_id, new Set());
    coverage.get(link.collection_id).add(link.work_id);
  }
  const quotes = new Map();
  for (const quote of tables.quotes) {
    if (!quotes.has(quote.work_id)) quotes.set(quote.work_id, []);
    quotes.get(quote.work_id).push(quote.quote);
  }
  const shards = Array.from({ length: 128 }, () => ({}));
  const index = [];
  for (const work of tables.works) {
    const collectionIds = [...(memberships.get(work.id) ?? [])].sort((a, b) => a - b);
    const content = work.content.replace(/\r\n?/g, "\n");
    index.push({ slug: `haitang-${work.id}`, title: work.title, author: work.author, dynasty: work.dynasty,
      kind: work.kind_cn, excerpt: Array.from(content).slice(0, 120).join(""), collectionIds });
    const fields = ["id", "title", "author", "author_id", "dynasty", "kind_cn", "content", "content_tr", "foreword", "intro", "annotation", "translation", "master_comment", "layout"];
    shards[work.id % 128][work.id] = { ...Object.fromEntries(fields.map(field => [field, work[field] ?? ""])),
      collections: collectionIds.map(id => collections.get(id).name), quotes: quotes.get(work.id) ?? [] };
  }
  const catalog = { revision: manifest.revision, works: index,
    dynasties: tables.dynasties.map(row => row.name),
    collections: tables.collections.filter(row => coverage.has(row.id)).map(row => ({ id: row.id, name: row.name, kind: row.kind, count: coverage.get(row.id).size })) };
  const directory = join(root, "public/poetry/haitang");
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, "index.json"), JSON.stringify(catalog));
  for (const [index, shard] of shards.entries()) await writeFile(join(directory, `${index.toString(16).padStart(2, "0")}.json`), JSON.stringify(shard));
  await preparePoetryPinyin(root, tables.works, manifest.snapshotSha256);
  console.log(`Prepared ${works.size} Haitang works, ${catalog.collections.length} collections with local works, 128 poetry shards.`);
}
