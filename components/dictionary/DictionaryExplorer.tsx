"use client";
import { UiText } from "@/components/i18n/UiText";
import { useTranslate } from "@/components/i18n/LanguageProvider";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookSearch, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import manifest from "@/data/asset-manifest.json";
import { type DictionaryKind, type DictionaryQuery, DictionaryInputError, searchDictionary } from "@/lib/dictionaryData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { DictionarySearchForm } from "./DictionarySearchForm";
import { DictionaryDetail } from "./DictionaryDetail";

const pageSize = 16;
const kinds = new Set<DictionaryKind>(["all", "character", "word", "idiom"]);

function DictionaryResults({ query, requested, onSelect, onSearch }: { query: DictionaryQuery; requested: string; onSelect: (term: string) => void; onSearch: (query: DictionaryQuery) => void }) {
  const t = useTranslate();
  const [unavailableSources, setUnavailableSources] = useState<string[]>([]);
  const [terms, setTerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    searchDictionary(query).then(results => {
      if (!active) return;
      setTerms(results.terms); setUnavailableSources(results.unavailableSources);
      setLoading(false); setError(null); setInputError(null);
    }).catch(problem => {
      if (!active) return;
      if (problem instanceof DictionaryInputError) setInputError(problem.message);
      else setError("词典加载失败，请检查网络后重试。");
      setLoading(false);
    });
    return () => { active = false; };
  }, [query, revision]);
  const selected = terms.includes(requested) ? requested : terms[0] ?? "";
  const page = Math.max(0, Math.floor(terms.indexOf(selected) / pageSize));
  const pages = Math.ceil(terms.length / pageSize);
  function changePage(next: number) { onSelect(terms[next * pageSize]); }


  return <div className="flex flex-col gap-6"><DictionarySearchForm initial={query} onSearch={onSearch} externalError={inputError} />
    {!inputError && <p className="text-sm leading-7 text-muted-foreground" role="status"><UiText>{loading ? "正在查询本地词库…" : `找到 ${terms.length.toLocaleString("zh-CN")} 条结果`}</UiText><UiText>{!loading && !error && query.kind === "idiom" && " · 成语索引中的个别条目可能尚无释义"}</UiText></p>}
    {unavailableSources.length > 0 && !loading && !error && <Alert><AlertDescription><UiText text="{0}索引暂不可用，当前结果可能不完整。" values={[unavailableSources.join("、")]} /><Button variant="outline" onClick={() => { setLoading(true); setRevision(value => value + 1); }}><UiText text="重试缺失来源" /></Button></AlertDescription></Alert>}
    {inputError ? null : error ? <Alert variant="destructive"><AlertDescription><UiText>{error}</UiText><Button variant="outline" onClick={() => { setLoading(true); setError(null); setRevision(value => value + 1); }}><UiText text="重新查询" /></Button></AlertDescription></Alert> : loading ? <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]"><Skeleton className="h-80" /><Skeleton className="h-[540px]" /></div> : terms.length ? <div className="grid items-start gap-4 lg:grid-cols-[280px_minmax(0,1fr)]"><div className="study-panel overflow-hidden"><nav aria-label={t("查询结果")} className="grid max-h-60 grid-cols-2 overflow-y-auto lg:max-h-none lg:grid-cols-1">{terms.slice(page * pageSize, (page + 1) * pageSize).map(term => <button type="button" key={term} onClick={() => onSelect(term)} aria-pressed={selected === term} className={cn("flex min-h-12 items-center justify-between gap-2 border-b border-border px-5 py-3 text-left transition-colors hover:bg-muted", selected === term && "bg-accent font-semibold text-accent-foreground")}><span className="break-all">{term}</span><ChevronRight className="size-4 shrink-0" aria-hidden="true" /></button>)}</nav>{pages > 1 && <div className="flex flex-wrap items-center justify-between gap-1 p-3"><Button variant="ghost" size="icon" aria-label={t("上一页结果")} disabled={page === 0} onClick={() => changePage(page - 1)}><ChevronLeft aria-hidden="true" /></Button><span className="text-xs text-muted-foreground"><UiText text="{0} / {1} 页" values={[page + 1, pages]} /></span><Button variant="ghost" size="icon" aria-label={t("下一页结果")} disabled={page + 1 === pages} onClick={() => changePage(page + 1)}><ChevronRight aria-hidden="true" /></Button></div>}</div><DictionaryDetail key={selected} term={selected} /></div> : <Empty className="study-panel min-h-72"><EmptyHeader><EmptyMedia variant="icon"><BookSearch aria-hidden="true" /></EmptyMedia><EmptyTitle><UiText text="没有找到匹配的字词" /></EmptyTitle><EmptyDescription><UiText text="试着缩短词语、使用单音节拼音，或放宽部首与笔画条件。" /></EmptyDescription></EmptyHeader><Button variant="outline" onClick={() => onSearch({ q: "学", kind: "all", radical: "", strokes: null })}><UiText text="从“学”字开始" /></Button></Empty>}
    <p className="text-xs leading-6 text-muted-foreground"><UiText text="基础字形 {0} 个 · 简编本 {1} 条资料（含多音条目） · 修订本 {2} 条 · 第三方整理 {3} 条记录 · 开放词库 {4} 条。" values={[manifest.hanzi.toLocaleString("zh-CN"), manifest.moeEntries.toLocaleString("zh-CN"), manifest.revisedEntries.toLocaleString("zh-CN"), manifest.xinhuaEntries.toLocaleString("zh-CN"), manifest.dictionary.toLocaleString("zh-CN")]} /><Link href="/about/copyright/#sources" className="ml-2 underline underline-offset-4"><UiText text="查看数据来源与范围" /></Link></p>
  </div>;
}

export function DictionaryExplorer() {
  const params = useSearchParams();
  const router = useRouter();
  const valuesWithoutSelection = new URLSearchParams(params.toString());
  valuesWithoutSelection.delete("entry");
  const key = valuesWithoutSelection.toString();
  const requested = (params.get("entry") ?? "").slice(0, 100);
  const query = useMemo<DictionaryQuery>(() => {
    const values = new URLSearchParams(key);
    const kind = values.get("kind") as DictionaryKind | null;
    const strokes = Number(values.get("strokes"));
    return { q: (values.get("q") ?? "学").slice(0, 100), kind: kind && kinds.has(kind) ? kind : "all", radical: values.get("radical")?.slice(0, 2) ?? "", strokes: Number.isInteger(strokes) && strokes >= 1 && strokes <= 36 ? strokes : null };
  }, [key]);
  function onSearch(next: DictionaryQuery) { const values = new URLSearchParams({ q: next.q }); if (next.kind !== "all") values.set("kind", next.kind); if (next.radical) values.set("radical", next.radical); if (next.strokes) values.set("strokes", String(next.strokes)); router.replace(`/dictionary/?${values}`, { scroll: false }); }
  function onSelect(term: string) {
    const values = new URLSearchParams(key);
    values.set("entry", term);
    window.history.pushState(null, "", `/dictionary/?${values}`);
  }
  return <DictionaryResults key={key} query={query} requested={requested} onSelect={onSelect} onSearch={onSearch} />;
}
