import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { buildChengyuWordleData, loadChengyuSnapshot } from "./prepare-chengyu-wordle";

/** Regenerates data/chengyuWordle.json from the verified chinese-xinhua idiom snapshot. */
async function main() {
  const sources = JSON.parse(await readFile(new URL("../data/dictionary-sources.json", import.meta.url), "utf8")) as { id: string; repository: string; revision: string; snapshotSha256: string }[];
  const source = sources.find(item => item.id === "xinhua-idiom");
  if (!source) throw new Error("Missing xinhua-idiom source");
  const bytes = await readFile(new URL("../data/xinhua-idiom-source.json.gz", import.meta.url));
  const snapshotSha256 = createHash("sha256").update(bytes).digest("hex");
  if (snapshotSha256 !== source.snapshotSha256) throw new Error("Idiom source checksum mismatch");
  const data = buildChengyuWordleData(loadChengyuSnapshot(), { repository: source.repository, revision: source.revision, snapshotSha256 });
  const json = `${JSON.stringify(data)}\n`;
  await writeFile(new URL("../data/chengyuWordle.json", import.meta.url), json);
  console.log(JSON.stringify({ answers: data.answers.length, dictionary: data.dictionary.length, bytes: Buffer.byteLength(json), first: data.answers.slice(0, 8).map(item => item.word) }));
}

void main().catch(error => { console.error(error); process.exitCode = 1; });
