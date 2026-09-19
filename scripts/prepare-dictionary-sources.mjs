import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

// Keep records and source categories intact; only group by title for transport.
export async function prepareDictionarySources(root) {
  const manifest = JSON.parse(await readFile(join(root, "data/dictionary-sources.json"), "utf8"));
  const groups = { revised: new Map(), xinhua: new Map() };
  const idioms = new Set();
  for (const source of manifest) {
    const bytes = await readFile(join(root, source.snapshot));
    if (createHash("sha256").update(bytes).digest("hex") !== source.snapshotSha256) throw new Error(`${source.id}: source checksum mismatch`);
    const entries = JSON.parse(gunzipSync(bytes));
    if (!Array.isArray(entries) || entries.length !== source.entries) throw new Error(`${source.id}: source count mismatch`);
    const revised = source.id === "revised";
    const kind = source.id.replace("xinhua-", "");
    const group = groups[revised ? "revised" : "xinhua"];
    const heads = new Set();
    for (const entry of entries) {
      const title = revised ? entry.title : kind === "word" ? entry.ci : entry.word;
      if (typeof title !== "string" || !title) throw new Error(`${source.id}: missing title`);
      heads.add(title);
      if (!group.has(title)) group.set(title, []);
      group.get(title).push(revised ? entry : { kind, data: entry });
      if (kind === "idiom") idioms.add(title);
    }
    if (heads.size !== source.uniqueHeads) throw new Error(`${source.id}: title count mismatch`);
  }
  for (const [name, group] of Object.entries(groups)) {
    const directory = join(root, "public/dictionary", name);
    await mkdir(directory, { recursive: true });
    const titles = [...group.keys()].sort();
    await writeFile(join(directory, "index.json"), JSON.stringify(titles));
    const shards = Array.from({ length: 128 }, () => Object.create(null));
    for (const title of titles) shards[title.codePointAt(0) % 128][title] = group.get(title);
    for (const [index, shard] of shards.entries()) await writeFile(join(directory, `${index.toString(16).padStart(2, "0")}.json`), JSON.stringify(shard));
  }
  await writeFile(join(root, "public/dictionary/xinhua/idioms.json"), JSON.stringify([...idioms].sort()));
  return { revisedEntries: manifest.find(source => source.id === "revised").entries, xinhuaEntries: manifest.filter(source => source.id.startsWith("xinhua-")).reduce((sum, source) => sum + source.entries, 0) };
}
