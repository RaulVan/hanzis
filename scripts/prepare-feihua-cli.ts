import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { buildFeihuaData } from "./prepare-feihua";

/** Regenerates data/feihuaLines.json from the verified Haitang snapshot; run after importing a new snapshot. */
async function main() {
  const manifest = JSON.parse(await readFile(new URL("../data/haitang-manifest.json", import.meta.url), "utf8"));
  const bytes = await readFile(new URL(`../${manifest.snapshot}`, import.meta.url));
  const snapshotSha256 = createHash("sha256").update(bytes).digest("hex");
  if (snapshotSha256 !== manifest.snapshotSha256) throw new Error("Poetry source checksum mismatch");
  const data = buildFeihuaData(JSON.parse(gunzipSync(bytes).toString()).tables, { repository: manifest.repository, revision: manifest.revision, snapshotSha256 });
  await writeFile(new URL("../data/feihuaLines.json", import.meta.url), `${JSON.stringify(data)}\n`);
  console.log(JSON.stringify({ lines: data.lines.length, basic: Object.values(data.tiers.basic).map(ids => ids.length), advanced: Object.values(data.tiers.advanced).map(ids => ids.length) }));
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
