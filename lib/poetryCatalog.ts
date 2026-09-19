import { poems, type Poem } from "@/data/poems";
import type { HaitangWork, PoetrySummary } from "@/lib/haitangTypes";

export const curatedSummaries: PoetrySummary[] = poems.map(poem => ({ slug: poem.slug, title: poem.title, author: poem.author, dynasty: poem.dynasty, kind: poem.theme, excerpt: poem.lines.map(line => line.text).join(""), collectionIds: [] }));
export function haitangId(slug: string): number | null {
  const match = /^haitang-([1-9]\d{0,9})$/.exec(slug);
  return match ? Number(match[1]) : null;
}
export function poetryText(value: string | null | undefined): string { return (value ?? "").replace(/\r\n?/g, "\n"); }
export function haitangPoem(work: HaitangWork): Poem {
  return { slug: `haitang-${work.id}`, title: work.title, author: work.author, dynasty: work.dynasty,
    theme: work.kind_cn, lines: poetryText(work.content).split("\n").map(text => ({ text, pinyin: [] })),
    translation: poetryText(work.translation), notes: [], haitang: work };
}
export interface PoetryFilter { query: string; source: string; dynasty: string; collection: string; favorites: readonly string[] }
export function filterPoetry(works: PoetrySummary[], filter: PoetryFilter): PoetrySummary[] {
  const query = filter.query.trim();
  return works.filter(work =>
    (filter.source === "all" || (filter.source === "saved" ? filter.favorites.includes(work.slug) : (filter.source === "haitang") === (haitangId(work.slug) !== null))) &&
    (filter.dynasty === "all" || filter.dynasty === work.dynasty) &&
    (filter.collection === "all" || work.collectionIds.includes(Number(filter.collection))) &&
    `${work.title}${work.author}${work.dynasty}${work.kind}${work.excerpt}`.includes(query));
}
