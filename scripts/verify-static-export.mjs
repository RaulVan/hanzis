import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const outputRoot = join(projectRoot, "out");
const failures = [];
const assetManifest = JSON.parse(await readFile(join(projectRoot, "data/asset-manifest.json"), "utf8"));
const audioManifest = JSON.parse(await readFile(join(projectRoot, "data/audio-manifest.json"), "utf8"));

async function exists(path) {
  return stat(path).then(info => info.isFile()).catch(() => false);
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)]));
  return nested.flat();
}

function localTarget(value) {
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  const pathname = decodeURIComponent(value.split(/[?#]/, 1)[0]);
  const candidate = resolve(outputRoot, `.${pathname}`);
  if (candidate !== outputRoot && !candidate.startsWith(outputRoot + sep)) return null;
  return pathname;
}

async function verifyLink(source, value) {
  const pathname = localTarget(value);
  if (pathname === null) return;
  const target = join(outputRoot, pathname);
  const choices = extname(pathname) ? [target] : [target, join(target, "index.html"), `${target}.html`];
  if (!(await Promise.any(choices.map(async path => (await exists(path)) ? path : Promise.reject())).catch(() => null))) {
    failures.push(`${relative(outputRoot, source)} -> ${value}`);
  }
}

for (const required of ["index.html", "404.html", "robots.txt", "sitemap.xml", "manifest.webmanifest", "_headers", "icon.svg", "licenses/NOTICE.txt"]) {
  if (!(await exists(join(outputRoot, required)))) failures.push(`missing ${required}`);
}

const files = await walk(outputRoot);
if (files.length >= 20_000) failures.push(`static file budget exceeded: ${files.length}`);

const htmlFiles = files.filter(file => file.endsWith(".html"));
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) await verifyLink(file, match[1]);
}

const strokeFiles = (await readdir(join(outputRoot, "hanzi"))).filter(file => file.endsWith(".json"));
if (strokeFiles.length !== assetManifest.hanzi) failures.push(`stroke count ${strokeFiles.length} != ${assetManifest.hanzi}`);

const recordings = (await readdir(join(outputRoot, "voice"))).filter(file => file.endsWith(".mp3")).sort();
if (recordings.length !== assetManifest.audio) failures.push(`audio count ${recordings.length} != ${assetManifest.audio}`);
if (JSON.stringify(recordings) !== JSON.stringify([...audioManifest].sort())) failures.push("audio manifest does not match exported recordings");

const dictionaryFiles = (await readdir(join(outputRoot, "dictionary"))).filter(file => /^[0-9a-f]{2}\.json$/.test(file));
const moeFiles = (await readdir(join(outputRoot, "dictionary", "moe"))).filter(file => /^[0-9a-f]{2}\.json$/.test(file));
if (dictionaryFiles.length !== 128) failures.push(`open dictionary shard count ${dictionaryFiles.length} != 128`);
if (moeFiles.length !== 128) failures.push(`MOE shard count ${moeFiles.length} != 128`);

for (const source of ["revised", "xinhua"]) {
  const directory = join(outputRoot, "dictionary", source);
  const shards = (await readdir(directory)).filter(file => /^[0-9a-f]{2}\.json$/.test(file));
  if (shards.length !== 128) failures.push(`${source} shard count ${shards.length} != 128`);
  if (!(await exists(join(directory, "index.json")))) failures.push(`${source}: missing index`);
}
for (const path of ["dictionary/xinhua/idioms.json", "licenses/MOE-Revised-Usage.txt", "licenses/moedict-data-README.txt", "licenses/chinese-xinhua-README.txt", "licenses/chinese-xinhua-MIT.txt"]) {
  if (!(await exists(join(outputRoot, path)))) failures.push(`missing ${path}`);
}

const poetryDir = join(outputRoot, "poetry", "haitang");
const poetryShards = (await readdir(poetryDir)).filter(file => /^[0-9a-f]{2}\.json$/.test(file));
if (poetryShards.length !== 128) failures.push(`poetry shard count ${poetryShards.length} != 128`);
const poetryIndex = JSON.parse(await readFile(join(poetryDir, "index.json"), "utf8"));
const poetryManifest = JSON.parse(await readFile(join(projectRoot, "data/haitang-manifest.json"), "utf8"));
if (poetryIndex.works.length !== poetryManifest.counts.works || poetryIndex.revision !== poetryManifest.revision) failures.push("poetry export does not match source manifest");
for (const name of ["haitang-MIT.txt", "haitang-README.txt"]) if (!(await exists(join(outputRoot, "licenses", name)))) failures.push(`missing poetry notice ${name}`);

const pinyinManifest = JSON.parse(await readFile(join(projectRoot, "data/poetry-pinyin-manifest.json"), "utf8"));
const exportedPinyinManifest = JSON.parse(await readFile(join(outputRoot, "poetry/pinyin/manifest.json"), "utf8"));
if (JSON.stringify(pinyinManifest) !== JSON.stringify(exportedPinyinManifest)) failures.push("poetry pinyin manifest mismatch");
for (const [file, hash] of Object.entries(pinyinManifest.shards)) {
  const bytes = await readFile(join(outputRoot, "poetry/pinyin", file));
  if (createHash("sha256").update(bytes).digest("hex") !== hash) failures.push(`poetry pinyin checksum mismatch: ${file}`);
}
if (!(await exists(join(outputRoot, "licenses/pinyin-pro-MIT.txt")))) failures.push("missing pinyin-pro notice");

if (failures.length) {
  console.error(`Static export verification failed (${failures.length}):`);
  for (const failure of failures.slice(0, 50)) console.error(`- ${failure}`);
  process.exit(1);
}

const bytes = (await Promise.all(files.map(file => stat(file).then(info => info.size)))).reduce((sum, size) => sum + size, 0);
console.log(JSON.stringify({ files: files.length, html: htmlFiles.length, bytes, strokes: strokeFiles.length, recordings: recordings.length, dictionaryShards: dictionaryFiles.length, moeShards: moeFiles.length }));
