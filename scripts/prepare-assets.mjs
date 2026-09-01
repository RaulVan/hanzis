import { createHash } from "node:crypto";
import { copyFile, cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { createRequire } from "node:module";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const json = (path, value) => writeFile(join(root, path), JSON.stringify(value));

// Build only from versioned/local inputs. No build-time network fetches.
const hanziDir = dirname(require.resolve("hanzi-writer-data/package.json"));
const hanziPackage = JSON.parse(await readFile(join(hanziDir, "package.json"), "utf8"));
const characters = (await readdir(hanziDir)).filter(name => name.endsWith(".json") && Array.from(name.slice(0, -5)).length === 1).map(name => name.slice(0, -5)).sort();
await mkdir(join(root, "public/hanzi"), { recursive: true });
for (const character of characters) {
  await copyFile(join(hanziDir, `${character}.json`), join(root, "public/hanzi", `${character.codePointAt(0).toString(16)}.json`));
}
await json("data/hanzi-manifest.json", { version: hanziPackage.version, characters });

const compressed = await readFile(join(root, "data/dictionary-source.json.gz"));
const sourceHash = createHash("sha256").update(compressed).digest("hex");
if (sourceHash !== "a433d1c954afb3f08309f57aafc58e084d557f13d490e636b2e415b7877fec76") {
  throw new Error("Dictionary source checksum changed. Review the source and update its provenance before building.");
}
const explanations = JSON.parse(gunzipSync(compressed));
const keys = Object.keys(explanations).sort();
const shards = Array.from({ length: 128 }, () => []);
for (const key of keys) shards[key.codePointAt(0) % shards.length].push([key, explanations[key]]);
await mkdir(join(root, "public/dictionary"), { recursive: true });
await json("public/dictionary/index.json", keys);
for (let index = 0; index < shards.length; index += 1) {
  await json(`public/dictionary/${index.toString(16).padStart(2, "0")}.json`, Object.fromEntries(shards[index]));
}

const moeCompressed = await readFile(join(root, "data/moe-concised-source.json.gz"));
const moeHash = createHash("sha256").update(moeCompressed).digest("hex");
if (moeHash !== "ecf26f7e6ecc48016598f4e4d156573083baa414a867d581e69d6135447510c2") throw new Error("MOE source checksum changed; review provenance before building.");
const moeSource = JSON.parse(gunzipSync(moeCompressed));
const moeGroups = new Map();
for (const entry of moeSource.entries) {
  const title = entry["字詞名"];
  if (!moeGroups.has(title)) moeGroups.set(title, []);
  moeGroups.get(title).push(entry);
}
const moeShards = Array.from({ length: 128 }, () => []);
for (const [title, entries] of moeGroups) moeShards[title.codePointAt(0) % moeShards.length].push([title, entries]);
await mkdir(join(root, "public/dictionary/moe"), { recursive: true });
await json("public/dictionary/moe/index.json", [...moeGroups.keys()].sort());
for (let index = 0; index < moeShards.length; index += 1) await json(`public/dictionary/moe/${index.toString(16).padStart(2, "0")}.json`, Object.fromEntries(moeShards[index]));

const audioFiles = (await readdir(join(root, "public/voice"))).filter(name => /^[a-z]+[1-4]\.mp3$/.test(name)).sort();
await json("data/audio-manifest.json", audioFiles);
await json("data/asset-manifest.json", { hanzi: characters.length, dictionary: keys.length, audio: audioFiles.length, moeEntries: moeSource.entries.length, moeCharacters: [...moeGroups.keys()].filter(title => Array.from(title).length === 1).length, moeVersion: moeSource.version, dictionarySourceSha256: sourceHash, moeSourceSha256: moeHash });
await cp(join(root, "licenses"), join(root, "public/licenses"), { recursive: true });
console.log(`Prepared ${characters.length} stroke files, ${keys.length} open explanations, ${moeSource.entries.length} unmodified MOE entries, ${audioFiles.length} recordings and license notices.`);
