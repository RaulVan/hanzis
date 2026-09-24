import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pinyin } from "pinyin-pro";
import { poems } from "../data/poems";
import { isChinese } from "../lib/utils";
import { isPinyinSyllable, normalizePoetryText, validatePoetryPinyin, type PoetryPinyinEntry, type PoetryPinyinShard } from "../lib/poetryPinyin";

interface Work { id: number; content: string }
export interface PinyinOverrides {
  phrases: Record<string, string>;
  works: Record<string, { textHash: string; readings: Record<string, { char: string; pinyin: string }> }>;
}
export const textHash = (text: string) => createHash("sha256").update(normalizePoetryText(text)).digest("hex");

export function makePoetryPinyin(work: Work, overrides: PinyinOverrides): PoetryPinyinEntry {
  const text = normalizePoetryText(work.content);
  const known = new Map<string, string[]>();
  for (const poem of poems) for (const line of poem.lines) known.set(Array.from(line.text).filter(isChinese).join(""), line.pinyin);
  for (const [phrase, reading] of Object.entries(overrides.phrases)) {
    const values = reading.split(" ");
    if (!phrase || Array.from(phrase).some(char => !isChinese(char)) || values.length !== Array.from(phrase).length || values.some(value => !isPinyinSyllable(value))) throw new Error(`Invalid poetry phrase override: ${phrase}`);
    known.set(phrase, values);
  }
  // Long phrases take priority over contained short phrases.
  const phrases = [...known].sort((a, b) => Array.from(b[0]).length - Array.from(a[0]).length);
  let missing = 0, correctedLines = 0, position = 0;
  const specific = overrides.works[String(work.id)];
  if (specific && specific.textHash !== textHash(text)) throw new Error(`Stale pronunciation overrides for work ${work.id}`);
  const applied = new Set<string>();
  const lines = text.split("\n").map(line => {
    const chars = Array.from(line);
    const tokens = pinyin(line, { type: "all", toneSandhi: false });
    if (tokens.length !== chars.length || tokens.some((token, i) => token.origin !== chars[i])) throw new Error(`Pinyin alignment failed: ${work.id}`);
    const values = tokens.map(token => isPinyinSyllable(token.pinyin) ? token.pinyin : "");
    const corrected = new Set<number>();
    // Match across punctuation, but never across line boundaries. Keep original text intact.
    const hanIndices = chars.flatMap((char, i) => isChinese(char) ? [i] : []);
    const hanChars = hanIndices.map(i => chars[i]);
    for (const [phrase, readings] of phrases) {
      const needle = Array.from(phrase);
      for (let start = 0; start <= hanChars.length - needle.length; start++) {
        if (!needle.every((char, i) => char === hanChars[start + i]) || needle.some((_, i) => corrected.has(hanIndices[start + i]))) continue;
        needle.forEach((_, i) => { values[hanIndices[start + i]] = readings[i]; corrected.add(hanIndices[start + i]); });
      }
    }
    for (let i = 0; i < chars.length; i++) {
      const key = String(position + i);
      const override = specific?.readings[key];
      if (!override) continue;
      if (override.char !== chars[i] || !isChinese(chars[i]) || !isPinyinSyllable(override.pinyin)) throw new Error(`Invalid pronunciation override: ${work.id}:${key}`);
      values[i] = override.pinyin; corrected.add(i); applied.add(key);
    }
    position += chars.length + 1; // Code-point offsets in normalized text, including newlines.
    if (corrected.size) correctedLines++;
    return hanIndices.map(i => { if (!values[i]) missing++; return values[i]; });
  });
  if (specific && Object.keys(specific.readings).some(key => !applied.has(key))) throw new Error(`Out-of-range pronunciation override: ${work.id}`);
  return { textHash: textHash(text), lines, missing, correctedLines };
}

export async function preparePoetryPinyin(root: string, works: Work[], snapshotSha256: string) {
  const overridesRaw = await readFile(join(root, "data/poetry-pinyin-overrides.json"), "utf8");
  const overrides: PinyinOverrides = JSON.parse(overridesRaw);
  for (const id of Object.keys(overrides.works)) if (!works.some(work => String(work.id) === id)) throw new Error(`Unknown pronunciation override work: ${id}`);
  const engine = JSON.parse(await readFile(join(root, "node_modules/pinyin-pro/package.json"), "utf8"));
  const inputs = await Promise.all(["scripts/prepare-poetry-pinyin.ts", "lib/poetryPinyin.ts", "lib/utils.ts", "data/poems.ts"].map(file => readFile(join(root, file))));
  const generatorRevision = createHash("sha256").update(engine.version).update(overridesRaw).update(Buffer.concat(inputs)).digest("hex");
  const revision = createHash("sha256").update(generatorRevision).update(snapshotSha256).digest("hex");
  const dir = join(root, "public/poetry/pinyin");
  await mkdir(dir, { recursive: true });
  const previous = await readFile(join(dir, "manifest.json"), "utf8").then(JSON.parse).catch(() => null);
  const cache = new Map<string, PoetryPinyinEntry>();
  if (previous?.generatorRevision === generatorRevision) {
    for (let i = 0; i < 128; i++) {
      const name = `${i.toString(16).padStart(2, "0")}.json`;
      const bytes = await readFile(join(dir, name)).catch(() => null);
      if (!bytes || createHash("sha256").update(bytes).digest("hex") !== previous.shards?.[name]) continue;
      const shard: PoetryPinyinShard = JSON.parse(bytes.toString());
      if (shard.revision === previous.revision) for (const [id, entry] of Object.entries(shard.entries)) cache.set(id, entry);
    }
  }
  const shards: PoetryPinyinShard[] = Array.from({ length: 128 }, () => ({ revision, entries: {} }));
  let generated = 0, reused = 0, han = 0, missing = 0, correctedLines = 0, partialWorks = 0;
  for (const work of works) {
    let entry = cache.get(String(work.id));
    if (entry?.textHash === textHash(work.content) && validatePoetryPinyin(work.content, entry)) reused++;
    else { entry = makePoetryPinyin(work, overrides); generated++; }
    if (!validatePoetryPinyin(work.content, entry)) throw new Error(`Invalid generated pinyin: ${work.id}`);
    shards[work.id % 128].entries[work.id] = entry;
    han += entry.lines.reduce((n, line) => n + line.length, 0);
    missing += entry.missing; correctedLines += entry.correctedLines;
    if (entry.missing) partialWorks++;
    if ((generated + reused) % 2000 === 0) console.log(`Poetry pinyin: ${generated + reused}/${works.length}`);
  }
  const hashes: Record<string, string> = {};
  for (let i = 0; i < shards.length; i++) {
    const name = `${i.toString(16).padStart(2, "0")}.json`, value = JSON.stringify(shards[i]);
    hashes[name] = createHash("sha256").update(value).digest("hex");
    await writeFile(join(dir, name), value);
  }
  const manifest = { format: 1, revision, generatorRevision, engine: `pinyin-pro@${engine.version}`, sourceSnapshotSha256: snapshotSha256, works: works.length, han, missing, partialWorks, correctedLines, shards: hashes };
  const value = JSON.stringify(manifest, null, 2) + "\n";
  await writeFile(join(dir, "manifest.json"), value);
  await writeFile(join(root, "data/poetry-pinyin-manifest.json"), value);
  console.log(`Prepared poetry pinyin: ${generated} generated, ${reused} reused, ${missing}/${han} readings unavailable.`);
}
