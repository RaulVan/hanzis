import manifest from "@/data/hanzi-manifest.json";

export interface HanziData {
  strokes: string[];
  medians: number[][][];
  radStrokes?: number[];
}

const available = new Set(manifest.characters);
const cache = new Map<string, Promise<HanziData>>();

export function loadHanziData(char: string): Promise<HanziData> {
  if (!available.has(char)) return Promise.reject(new Error("字库暂未收录这个字的笔顺，可继续查看读音或生成字帖。"));
  const existing = cache.get(char);
  if (existing) return existing;
  const pending = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(`/hanzi/${char.codePointAt(0)!.toString(16)}.json`, { signal: controller.signal });
      if (!response.ok) throw new Error("笔顺数据暂时无法加载，请重试。");
      const data: unknown = await response.json();
      if (!data || typeof data !== "object" || !("strokes" in data) || !Array.isArray(data.strokes) || !("medians" in data) || !Array.isArray(data.medians) || !data.strokes.length) throw new Error("笔顺数据格式异常，请重新加载。");
      return data as HanziData;
    } finally { clearTimeout(timeout); }
  })().catch(error => {
    cache.delete(char);
    throw error;
  });
  cache.set(char, pending);
  if (cache.size > 256) cache.delete(cache.keys().next().value!);
  return pending;
}
