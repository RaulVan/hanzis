import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { preparePoetryPinyin } from "./prepare-poetry-pinyin";

async function main() {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const manifest = JSON.parse(await readFile(new URL("../data/haitang-manifest.json", import.meta.url), "utf8"));
  const bytes = await readFile(new URL(`../${manifest.snapshot}`, import.meta.url));
  if (createHash("sha256").update(bytes).digest("hex") !== manifest.snapshotSha256) throw new Error("Poetry source checksum mismatch");
  await preparePoetryPinyin(root, JSON.parse(gunzipSync(bytes).toString()).tables.works, manifest.snapshotSha256);
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
