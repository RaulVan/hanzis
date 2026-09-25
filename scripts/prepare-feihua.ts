import type { FeihuaData, FeihuaLine } from "../lib/feihuaTypes";

export const FEIHUA_KEYS = ["月", "花", "春", "风", "山", "水", "云", "雨", "秋", "夜", "江", "雪"] as const;
export const FEIHUA_TIERS = {
  basic: ["小学古诗词"],
  advanced: ["唐诗三百首", "千家诗", "初中古诗词"],
} as const;
/** Advanced anthologies are large; keep the earliest lines per key so the bundled bank stays small. */
export const ADVANCED_LINES_PER_KEY = 48;

interface SourceWork { id: string | number; title: string; author: string; dynasty: string; content: string }
interface SourceCollectionWork { collection: string; show_order: number; work_id: string | number }
export interface FeihuaSourceTables { works: SourceWork[]; collection_works: SourceCollectionWork[] }

/** 20th-century works appear in school anthologies but are neither classical nor clearly in the public domain. */
const MODERN_DYNASTIES = new Set(["近现代", "现代", "当代"]);
const isVerse = (text: string) => (text.length === 5 || text.length === 7) && /^\p{Script=Han}+$/u.test(text);

/** Deterministic: collections in the listed order, works by show order, lines in reading order. */
export function buildFeihuaData(tables: FeihuaSourceTables, source: FeihuaData["source"]): FeihuaData {
  const works = new Map(tables.works.map(work => [String(work.id), work]));
  const lines: FeihuaLine[] = [];
  const lineIds = new Map<string, number>();
  const tiers = {} as FeihuaData["tiers"];
  const usedWorks = new Set<string>();

  for (const [tier, collections] of Object.entries(FEIHUA_TIERS) as [keyof typeof FEIHUA_TIERS, readonly string[]][]) {
    const entries = tables.collection_works
      .filter(entry => collections.includes(entry.collection))
      .sort((a, b) => collections.indexOf(a.collection) - collections.indexOf(b.collection) || a.show_order - b.show_order);
    const tierLines: number[] = [];
    const tierWorks = new Set<string>();
    for (const entry of entries) {
      const workId = String(entry.work_id);
      const work = works.get(workId);
      // A work taught in primary school stays a beginner line even if an advanced anthology also includes it.
      if (!work || MODERN_DYNASTIES.has(work.dynasty) || usedWorks.has(workId) || tierWorks.has(workId)) continue;
      tierWorks.add(workId);
      for (const text of work.content.split(/[，。！？；：、\s]+/u)) {
        if (!isVerse(text) || lineIds.has(text)) continue;
        const id = lines.length;
        lineIds.set(text, id);
        lines.push({ id, text, workId, title: work.title, author: work.author, dynasty: work.dynasty });
        tierLines.push(id);
      }
    }
    tierWorks.forEach(workId => usedWorks.add(workId));
    const limit = tier === "advanced" ? ADVANCED_LINES_PER_KEY : Infinity;
    tiers[tier] = Object.fromEntries(FEIHUA_KEYS.map(key => [key, tierLines.filter(id => lines[id].text.includes(key)).slice(0, limit)]));
  }

  const kept = new Set(Object.values(tiers).flatMap(byKey => Object.values(byKey).flat()));
  const renumber = new Map([...kept].sort((a, b) => a - b).map((oldId, newId) => [oldId, newId]));
  return {
    format: 1,
    source,
    keys: [...FEIHUA_KEYS],
    lines: [...renumber].map(([oldId, id]) => ({ ...lines[oldId], id })),
    tiers: Object.fromEntries(Object.entries(tiers).map(([tier, byKey]) => [tier, Object.fromEntries(Object.entries(byKey).map(([key, ids]) => [key, ids.map(id => renumber.get(id)!)]))])) as FeihuaData["tiers"],
  };
}
