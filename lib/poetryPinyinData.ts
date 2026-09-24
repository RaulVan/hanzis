"use client";

import manifest from "@/data/poetry-pinyin-manifest.json";
import { haitangId } from "./poetryCatalog";
import { normalizePoetryText, validatePoetryPinyin, type PoetryPinyinEntry, type PoetryPinyinShard } from "./poetryPinyin";

const cache = new Map<string, Promise<PoetryPinyinShard>>();
async function sha256(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function getPoetryPinyin(slug: string, text: string): Promise<PoetryPinyinEntry> {
  const id = haitangId(slug);
  if (id === null) throw new Error("作品编号无效。");
  const file = `${(id % 128).toString(16).padStart(2, "0")}.json`;
  if (!cache.has(file)) {
    const pending = (async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(`/poetry/pinyin/${file}?v=${manifest.revision}`, { signal: controller.signal });
        if (!response.ok) throw new Error("拼音暂时无法加载。");
        const raw = await response.text();
        const hashes: Record<string, string> = manifest.shards;
        if (await sha256(raw) !== hashes[file]) throw new Error("拼音资源校验失败。");
        const shard: PoetryPinyinShard = JSON.parse(raw);
        if (shard.revision !== manifest.revision || !shard.entries) throw new Error("拼音资源版本不匹配。");
        return shard;
      } catch (error) { cache.delete(file); throw error; }
      finally { clearTimeout(timer); }
    })();
    cache.set(file, pending);
    if (cache.size > 8) cache.delete(cache.keys().next().value!);
  }
  const shard = await cache.get(file)!;
  const entry = shard.entries[id];
  if (!validatePoetryPinyin(text, entry) || entry.textHash !== await sha256(normalizePoetryText(text))) {
    cache.delete(file);
    throw new Error("拼音与当前正文不匹配。");
  }
  return entry;
}
