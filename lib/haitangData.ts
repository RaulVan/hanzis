"use client";
import manifest from "@/data/haitang-manifest.json";
import type { HaitangCatalog, HaitangWork } from "@/lib/haitangTypes";
import { haitangId, haitangPoem } from "@/lib/poetryCatalog";

const cache = new Map<string, Promise<unknown>>();
async function fetchPoetry<T>(file: string): Promise<T> {
  if (cache.has(file)) return cache.get(file) as Promise<T>;
  const request = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`/poetry/haitang/${file}?v=${manifest.snapshotSha256.slice(0, 12)}`, { signal: controller.signal });
      if (!response.ok) throw new Error("诗词资料暂时无法读取，请重试。");
      return await response.json() as T;
    } catch (error) { cache.delete(file); throw error; }
    finally { clearTimeout(timeout); }
  })();
  cache.set(file, request);
  if (cache.size > 12) cache.delete(cache.keys().next().value!);
  return request;
}
export async function getHaitangCatalog(): Promise<HaitangCatalog> {
  const catalog = await fetchPoetry<HaitangCatalog>("index.json");
  if (catalog.revision !== manifest.revision || !Array.isArray(catalog.works)) {
    cache.delete("index.json");
    throw new Error("诗词索引版本不匹配，请刷新后重试。");
  }
  return catalog;
}
export async function getHaitangPoem(slug: string) {
  const id = haitangId(slug);
  if (id === null) throw new Error("诗词编号无效。");
  const shard = await fetchPoetry<Record<string, HaitangWork>>(`${(id % 128).toString(16).padStart(2, "0")}.json`);
  if (!shard[id]) throw new Error("当前诗词库未收录这篇作品，可能已在来源更新时移除。");
  return haitangPoem(shard[id]);
}
