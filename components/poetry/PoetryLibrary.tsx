"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronRight, BookOpen, ChevronLeft } from "lucide-react";
import { poems } from "@/data/poems";
import manifest from "@/data/haitang-manifest.json";
import { getHaitangCatalog } from "@/lib/haitangData";
import type { HaitangCatalog } from "@/lib/haitangTypes";
import { curatedSummaries, filterPoetry, haitangId } from "@/lib/poetryCatalog";
import { usePoetryFavorites } from "@/lib/poetryFavorites";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PoetrySelection } from "./PoetrySelection";

const pageSize = 24;
export function PoetryLibrary({ heading }: { heading: ReactNode }) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [dynasty, setDynasty] = useState("all");
  const [collection, setCollection] = useState("all");
  const [catalog, setCatalog] = useState<HaitangCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const { favorites } = usePoetryFavorites();
  const params = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    let active = true;
    getHaitangCatalog().then(value => { if (active) setCatalog(value); }).catch(() => { if (active) setError("海棠诗词索引暂时无法读取，仍可阅读本站精选。"); });
    return () => { active = false; };
  }, [revision]);
  const all = useMemo(() => [...curatedSummaries, ...(catalog?.works ?? [])], [catalog]);
  const filtered = useMemo(() => filterPoetry(all, { query, source, dynasty, collection, favorites }), [all, query, source, dynasty, collection, favorites]);
  const requested = params.get("poem");
  const missing = Boolean(requested && catalog && !all.some(poem => poem.slug === requested));
  const awaitingRequested = Boolean(requested && haitangId(requested) !== null && !catalog);
  const selected = missing || awaitingRequested ? undefined : filtered.find(poem => poem.slug === requested) ?? filtered[0];
  const page = selected ? Math.floor(filtered.indexOf(selected) / pageSize) : 0;
  const pageCount = Math.ceil(filtered.length / pageSize);
  const select = (slug: string) => router.replace(`/poetry/?poem=${encodeURIComponent(slug)}`, { scroll: false });
  function reset() { setQuery(""); setSource("all"); setDynasty("all"); setCollection("all"); router.replace("/poetry/", { scroll: false }); }

  return <div className="flex flex-col gap-5">
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)] lg:items-end">
      <div>{heading}<p className="text-sm leading-7 text-muted-foreground" role="status">校对精选 {poems.length} 首 · 海棠资料 {manifest.counts.works.toLocaleString("zh-CN")} 篇 · 当前 {filtered.length.toLocaleString("zh-CN")} 篇</p><p className="text-xs leading-6 text-muted-foreground">同名作品按来源保留，收藏仅保存在本机。</p></div>
      <div className="flex w-full flex-col gap-3">
        <Label htmlFor="poetry-search">搜索诗词</Label><InputGroup><InputGroupInput id="poetry-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="诗名、诗人或开篇诗句" type="search" maxLength={60} /><InputGroupAddon align="inline-end"><Search aria-hidden="true" /></InputGroupAddon></InputGroup>
        <ToggleGroup type="single" value={source} onValueChange={value => { if (value) { setSource(value); setCollection("all"); } }} variant="outline" spacing={0} className="w-full" aria-label="诗词来源">
          <ToggleGroupItem className="flex-1" value="all">全部</ToggleGroupItem><ToggleGroupItem className="flex-1" value="curated">校对精选</ToggleGroupItem><ToggleGroupItem className="flex-1" value="haitang">海棠资料</ToggleGroupItem><ToggleGroupItem className="flex-1" value="saved">收藏 {favorites.length || ""}</ToggleGroupItem>
        </ToggleGroup>
        <div className="grid grid-cols-2 gap-3">
          <div className="min-w-0 space-y-2"><Label htmlFor="poetry-dynasty">朝代</Label><Select value={dynasty} onValueChange={setDynasty}><SelectTrigger id="poetry-dynasty" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">全部朝代</SelectItem>{(catalog?.dynasties ?? ["唐", "宋"]).map(name => <SelectItem value={name} key={name}>{name}</SelectItem>)}</SelectContent></Select></div>
          <div className="min-w-0 space-y-2"><Label htmlFor="poetry-collection">选集与主题</Label><Select value={collection} onValueChange={value => { setCollection(value); if (value !== "all") setSource("haitang"); }} disabled={!catalog}><SelectTrigger id="poetry-collection" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">全部选集</SelectItem>{catalog?.collections.map(item => <SelectItem value={String(item.id)} key={item.id}>{item.name}（{item.count}）</SelectItem>)}</SelectContent></Select></div>
        </div>
        <p className="text-xs leading-6 text-muted-foreground">海棠检索覆盖标题、作者和开篇 120 字；原文按需加载。只有本站精选提供已校对拼音。</p>
      </div>
    </div>
    {!catalog && !error && <p className="text-sm text-muted-foreground" role="status">正在加载海棠诗词索引，可先阅读校对精选…</p>}
    {error && <Alert><AlertDescription>{error}<Button variant="outline" onClick={() => { setError(null); setRevision(value => value + 1); }}>重试诗词索引</Button></AlertDescription></Alert>}
    {missing && <Alert><AlertDescription>未找到链接中的作品，可能已在来源更新时移除。<Button variant="outline" onClick={reset}>返回诗词目录</Button></AlertDescription></Alert>}
    {filtered.length ? <div className="grid items-start gap-4 lg:grid-cols-[minmax(270px,0.9fr)_minmax(0,1.9fr)]">
      <div className="study-panel overflow-hidden lg:sticky lg:top-24">
        <nav aria-label="诗词目录" className="max-h-72 overflow-y-auto lg:max-h-[680px]">{filtered.slice(page * pageSize, (page + 1) * pageSize).map(poem => <button key={poem.slug} type="button" aria-current={poem.slug === selected?.slug ? "true" : undefined} onClick={() => select(poem.slug)} className={cn("relative flex w-full items-center gap-3 border-b border-border px-5 py-5 text-left transition-colors last:border-b-0 hover:bg-muted sm:px-6", poem.slug === selected?.slug && "bg-accent before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-primary")}>
          <div className="min-w-0 flex-1"><h2 className="mb-2 break-words font-serif text-xl font-semibold">{poem.title}</h2><p className="text-sm leading-7 text-muted-foreground">{poem.dynasty} · {poem.author} · {haitangId(poem.slug) ? "海棠" : "精选"}</p><p className="line-clamp-2 break-words text-sm leading-7 text-muted-foreground">{poem.excerpt}</p></div><ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>)}</nav>
        {pageCount > 1 && <div className="flex items-center justify-between border-t border-border p-3"><Button variant="ghost" size="icon" aria-label="上一页诗词" disabled={page === 0} onClick={() => select(filtered[(page - 1) * pageSize].slug)}><ChevronLeft /></Button><span className="text-xs text-muted-foreground">{page + 1} / {pageCount} 页</span><Button variant="ghost" size="icon" aria-label="下一页诗词" disabled={page + 1 >= pageCount} onClick={() => select(filtered[(page + 1) * pageSize].slug)}><ChevronRight /></Button></div>}
      </div>
      {selected && <PoetrySelection key={selected.slug} slug={selected.slug} />}
    </div> : <Empty className="study-panel min-h-80"><EmptyHeader><EmptyMedia variant="icon"><BookOpen aria-hidden="true" /></EmptyMedia><EmptyTitle>{source === "saved" && !query ? "还没有匹配的收藏" : "没有找到这首诗"}</EmptyTitle><EmptyDescription>试试诗人姓名、开篇诗句，或清除朝代和选集筛选。资料加载失败时，当前结果可能不完整。</EmptyDescription></EmptyHeader><Button variant="outline" onClick={reset}>查看全部诗词</Button></Empty>}
  </div>;
}
