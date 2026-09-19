"use client";

import hanziManifest from "@/data/hanzi-manifest.json";
import { getCharacterInfo, getRadical, getStrokeCount, getTextPinyin, loadCnchar } from "@/lib/cncharHelper";
import { filterChineseCharacters, isChinese } from "@/lib/utils";
import type { CharacterInfo } from "@/types";

import type { DictionarySearchResult, RevisedEntry, XinhuaEntry } from "@/lib/dictionarySources";

export type DictionaryKind = "all" | "character" | "word" | "idiom";
export interface DictionaryQuery { q: string; kind: DictionaryKind; radical: string; strokes: number | null }
export type MoeEntry = Record<string, string> & { "字詞名": string; "字詞號": string; "漢語拼音": string; "釋義": string };
export interface DictionaryEntry { term: string; spelling: string[]; character: CharacterInfo | null; openDefinition: string; moe: MoeEntry[]; revised: RevisedEntry[]; xinhua: XinhuaEntry[]; unavailableSources: string[] }

const cache = new Map<string, Promise<unknown>>();
async function fetchData<T>(path: string): Promise<T> {
  if (cache.has(path)) return cache.get(path) as Promise<T>;
  const promise = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(path, { signal: controller.signal });
      if (!response.ok) throw new Error("词典数据暂时无法读取，请检查网络后重试。");
      return await response.json() as T;
    } catch (error) { cache.delete(path); throw error; }
    finally { clearTimeout(timeout); }
  })();
  cache.set(path, promise);
  if (cache.size > 48) cache.delete(cache.keys().next().value!);
  return promise;
}

export function dictionaryShard(word: string): string { return ((word.codePointAt(0) ?? 0) % 128).toString(16).padStart(2, "0"); }

const variantHeads: Record<string, string[]> = { "发": ["發", "髮"], "后": ["後", "后"], "干": ["乾", "幹", "干"], "里": ["里", "裡"], "台": ["臺", "台"], "面": ["面", "麵"], "复": ["復", "複"], "钟": ["鐘", "鍾"], "系": ["系", "係", "繫"], "只": ["只", "隻"], "征": ["征", "徵"] };

export function validateDictionaryQuery(query: DictionaryQuery): string | null {
  if (Array.from(query.q).length > 24) return "最多输入 24 个字，或一个拼音音节。";
  if (query.q && !/^[\p{Script=Han}a-züêāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ1-4\s]+$/iu.test(query.q)) return "请输入汉字、词语或拼音，不需要标点。";
  if (!query.q && !query.radical && !query.strokes) return "请输入要查询的字词，或选择部首、笔画。";
  return null;
}

export async function searchDictionary(query: DictionaryQuery): Promise<DictionarySearchResult> {
  const error = validateDictionaryQuery(query);
  if (error) throw new Error(error);
  const cnchar = await loadCnchar();
  if (!cnchar) throw new Error("汉字检索数据加载失败，请重试。");
  const text = query.q.trim();
  const pinyinQuery = text && !Array.from(text).some(isChinese);
  const characterOnly = query.kind === "character" || pinyinQuery || Boolean(query.radical || query.strokes);
  let characters: string[] = [];
  if (characterOnly || (query.kind === "all" && Array.from(text).length === 1)) {
    if (pinyinQuery) {
      const value = cnchar.spellToWord(text.toLowerCase().replaceAll(" ", ""), "array", "alltone");
      characters = Array.isArray(value) ? value : Array.from(value);
    } else characters = text ? [...new Set(Array.from(filterChineseCharacters(text)))] : hanziManifest.characters;
    characters = characters.filter(char => (!query.strokes || getStrokeCount(char) === query.strokes) && (!query.radical || getRadical(char).radical === query.radical));
    if (characterOnly) return { terms: [...new Set(characters)], unavailableSources: [] };
  }
  const traditional = cnchar.convert.simpleToTrad(text);
  const simplified = cnchar.convert.tradToSimple(text);
  const queries = [...new Set([text, traditional, simplified])];
  const sources = query.kind === "idiom" ? [
    { name: "开放成语索引", load: async () => (await import("cnchar-idiom")).default.dict.idiom },
    { name: "第三方成语索引", load: () => fetchData<string[]>("/dictionary/xinhua/idioms.json") },
  ] : [
    { name: "开放词库", load: () => fetchData<string[]>("/dictionary/index.json") },
    { name: "简编本", load: () => fetchData<string[]>("/dictionary/moe/index.json") },
    { name: "修订本", load: () => fetchData<string[]>("/dictionary/revised/index.json") },
    { name: "第三方整理", load: () => fetchData<string[]>("/dictionary/xinhua/index.json") },
  ];
  const indexes = await Promise.allSettled(sources.map(async source => {
    const index = await source.load();
    if (!Array.isArray(index) || index.some(term => typeof term !== "string")) throw new Error("词典索引格式错误");
    return index;
  }));
  if (indexes.every(result => result.status === "rejected")) throw new Error("词典索引加载失败，请重试。");
  const unavailableSources = sources.filter((_, index) => indexes[index].status === "rejected").map(source => source.name);
  const words = indexes.flatMap(result => result.status === "fulfilled" ? result.value.filter(term =>
    (query.kind !== "word" || Array.from(term).length > 1) && queries.some(value => term.includes(value))) : []);
  const unique = [...new Set([...characters, ...words])];
  // Exact matches first, then shorter related words; source order breaks ties.
  return { terms: unique.sort((a, b) => Number(b === text) - Number(a === text) || Array.from(a).length - Array.from(b).length), unavailableSources };
}

async function sourceEntries<T>(directory: string, heads: string[]): Promise<T[]> {
  const shards = [...new Set(heads.map(dictionaryShard))];
  const data = await Promise.all(shards.map(shard => fetchData<Record<string, T[]>>(`/dictionary/${directory}/${shard}.json`)));
  return heads.flatMap(head => data[shards.indexOf(dictionaryShard(head))][head] ?? []);
}

export async function getDictionaryEntry(term: string): Promise<DictionaryEntry> {
  const cnchar = await loadCnchar();
  if (!cnchar) throw new Error("汉字数据加载失败，请重试。");
  // Conversion only selects lookup keys; each source record remains unchanged.
  const heads = [...new Set([term, cnchar.convert.simpleToTrad(term), cnchar.convert.tradToSimple(term), ...(variantHeads[term] ?? [])])];
  const sources = ["开放词库", "简编本", "修订本", "第三方整理"];
  const [open, moe, revised, xinhua] = await Promise.allSettled([
    fetchData<Record<string, string>>(`/dictionary/${dictionaryShard(term)}.json`),
    sourceEntries<MoeEntry>("moe", heads),
    sourceEntries<RevisedEntry>("revised", heads),
    sourceEntries<XinhuaEntry>("xinhua", heads),
  ]);
  const results = [open, moe, revised, xinhua];
  if (results.every(result => result.status === "rejected")) throw new Error("词典数据加载失败，请重试。");
  return {
    term, spelling: getTextPinyin(term), character: Array.from(term).length === 1 ? getCharacterInfo(term) : null,
    openDefinition: open.status === "fulfilled" && typeof open.value[term] === "string" ? open.value[term] : "",
    moe: moe.status === "fulfilled" ? moe.value : [],
    revised: revised.status === "fulfilled" ? revised.value : [],
    xinhua: xinhua.status === "fulfilled" ? xinhua.value : [],
    unavailableSources: sources.filter((_, index) => results[index].status === "rejected"),
  };
}
