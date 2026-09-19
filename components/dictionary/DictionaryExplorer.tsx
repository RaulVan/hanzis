"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookSearch, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import manifest from "@/data/asset-manifest.json";
import { type DictionaryKind, type DictionaryQuery, searchDictionary } from "@/lib/dictionaryData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { DictionarySearchForm } from "./DictionarySearchForm";
import { DictionaryDetail } from "./DictionaryDetail";

const pageSize = 16;
const kinds = new Set<DictionaryKind>(["all", "character", "word", "idiom"]);

function DictionaryResults({ query, onSearch }: { query: DictionaryQuery; onSearch: (query: DictionaryQuery) => void }) {
  const [unavailableSources, setUnavailableSources] = useState<string[]>([]);
  const [terms, setTerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState("");
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  useEffect(() => { let active = true; searchDictionary(query).then(results => { if (active) { setTerms(results.terms); setUnavailableSources(results.unavailableSources); setPage(0); setSelected(results.terms[0] || ""); setLoading(false); setError(null); } }).catch(problem => { if (active) { setError(problem instanceof Error && problem.name !== "AbortError" ? problem.message : "词典加载超时，请检查网络后重试。"); setLoading(false); } }); return () => { active = false; }; }, [query, revision]);
  const pages = Math.ceil(terms.length / pageSize);
  function changePage(next: number) { setPage(next); setSelected(terms[next * pageSize]); }

  return <div className="flex flex-col gap-6"><DictionarySearchForm initial={query} onSearch={onSearch} />
    <p className="text-sm leading-7 text-muted-foreground" role="status">{loading ? "正在查询本地词库…" : `找到 ${terms.length.toLocaleString("zh-CN")} 条结果`}{!loading && !error && query.kind === "idiom" && " · 成语索引中的个别条目可能尚无释义"}</p>
    {unavailableSources.length > 0 && !loading && !error && <Alert><AlertDescription>{unavailableSources.join("、")}索引暂不可用，当前结果可能不完整。<Button variant="outline" onClick={() => { setLoading(true); setRevision(value => value + 1); }}>重试缺失来源</Button></AlertDescription></Alert>}
    {error ? <Alert variant="destructive"><AlertDescription>{error}<Button variant="outline" onClick={() => { setLoading(true); setError(null); setRevision(value => value + 1); }}>重新查询</Button></AlertDescription></Alert> : loading ? <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]"><Skeleton className="h-80" /><Skeleton className="h-[540px]" /></div> : terms.length ? <div className="grid items-start gap-4 lg:grid-cols-[280px_minmax(0,1fr)]"><div className="study-panel overflow-hidden"><nav aria-label="查询结果" className="grid max-h-60 grid-cols-2 overflow-y-auto lg:max-h-none lg:grid-cols-1">{terms.slice(page * pageSize, (page + 1) * pageSize).map(term => <button type="button" key={term} onClick={() => setSelected(term)} aria-pressed={selected === term} className={cn("flex min-h-12 items-center justify-between gap-2 border-b border-border px-5 py-3 text-left transition-colors hover:bg-muted", selected === term && "bg-accent font-semibold text-accent-foreground")}><span className="break-all">{term}</span><ChevronRight className="size-4 shrink-0" aria-hidden="true" /></button>)}</nav>{pages > 1 && <div className="flex flex-wrap items-center justify-between gap-1 p-3"><Button variant="ghost" size="icon" aria-label="上一页结果" disabled={page === 0} onClick={() => changePage(page - 1)}><ChevronLeft aria-hidden="true" /></Button><span className="text-xs text-muted-foreground">{page + 1} / {pages} 页</span><Button variant="ghost" size="icon" aria-label="下一页结果" disabled={page + 1 === pages} onClick={() => changePage(page + 1)}><ChevronRight aria-hidden="true" /></Button></div>}</div><DictionaryDetail key={selected} term={selected} /></div> : <Empty className="study-panel min-h-72"><EmptyHeader><EmptyMedia variant="icon"><BookSearch aria-hidden="true" /></EmptyMedia><EmptyTitle>没有找到匹配的字词</EmptyTitle><EmptyDescription>试着缩短词语、使用单音节拼音，或放宽部首与笔画条件。</EmptyDescription></EmptyHeader><Button variant="outline" onClick={() => onSearch({ q: "学", kind: "all", radical: "", strokes: null })}>从“学”字开始</Button></Empty>}
    <p className="text-xs leading-6 text-muted-foreground">基础字形 {manifest.hanzi.toLocaleString("zh-CN")} 个 · 简编本 {manifest.moeEntries.toLocaleString("zh-CN")} 条资料（含多音条目） · 修订本 {manifest.revisedEntries.toLocaleString("zh-CN")} 条 · 第三方整理 {manifest.xinhuaEntries.toLocaleString("zh-CN")} 条记录 · 开放词库 {manifest.dictionary.toLocaleString("zh-CN")} 条。<Link href="/about/#sources" className="ml-2 underline underline-offset-4">查看数据来源与范围</Link></p>
  </div>;
}

export function DictionaryExplorer() {
  const params = useSearchParams();
  const router = useRouter();
  const key = params.toString();
  const query = useMemo<DictionaryQuery>(() => {
    const values = new URLSearchParams(key);
    const kind = values.get("kind") as DictionaryKind | null;
    const strokes = Number(values.get("strokes"));
    return { q: (values.get("q") ?? "学").slice(0, 100), kind: kind && kinds.has(kind) ? kind : "all", radical: values.get("radical")?.slice(0, 2) ?? "", strokes: Number.isInteger(strokes) && strokes >= 1 && strokes <= 36 ? strokes : null };
  }, [key]);
  function onSearch(next: DictionaryQuery) { const values = new URLSearchParams({ q: next.q }); if (next.kind !== "all") values.set("kind", next.kind); if (next.radical) values.set("radical", next.radical); if (next.strokes) values.set("strokes", String(next.strokes)); router.replace(`/dictionary/?${values}`, { scroll: false }); }
  return <DictionaryResults key={key} query={query} onSearch={onSearch} />;
}
