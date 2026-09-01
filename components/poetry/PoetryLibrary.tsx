"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronRight, BookOpen } from "lucide-react";
import { poems } from "@/data/poems";
import { usePoetryFavorites } from "@/lib/poetryFavorites";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { PoemReader } from "./PoemReader";

export function PoetryLibrary({ heading }: { heading: ReactNode }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const { favorites } = usePoetryFavorites();
  const params = useSearchParams();
  const router = useRouter();
  const filtered = useMemo(() => poems.filter(poem => (filter === "all" || (filter === "saved" ? favorites.includes(poem.slug) : poem.dynasty === filter)) && `${poem.title}${poem.author}${poem.theme}${poem.lines.map(line => line.text).join("")}`.includes(query.trim())), [filter, favorites, query]);
  const selected = filtered.find(poem => poem.slug === params.get("poem")) ?? filtered[0];

  return <div className="flex flex-col gap-5">
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)] lg:items-end">
      <div>{heading}<p className="text-sm text-muted-foreground" role="status">精选 {poems.length} 首 · 当前 {filtered.length} 首 · 收藏仅保存在本机</p></div>
      <div className="flex w-full flex-col gap-3"><Label htmlFor="poetry-search">搜索诗词</Label><InputGroup><InputGroupInput id="poetry-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="诗名、诗人、诗句或主题" type="search" maxLength={60} /><InputGroupAddon align="inline-end"><Search aria-hidden="true" /></InputGroupAddon></InputGroup><ToggleGroup type="single" value={filter} onValueChange={value => { if (value) setFilter(value); }} variant="outline" spacing={0} className="w-full" aria-label="诗词分类"><ToggleGroupItem className="flex-1" value="all">全部</ToggleGroupItem><ToggleGroupItem className="flex-1" value="唐">唐诗</ToggleGroupItem><ToggleGroupItem className="flex-1" value="宋">宋诗词</ToggleGroupItem><ToggleGroupItem className="flex-1" value="saved">收藏 {favorites.length || ""}</ToggleGroupItem></ToggleGroup></div>
    </div>
    {selected ? <div className="grid items-start gap-4 lg:grid-cols-[minmax(270px,0.9fr)_minmax(0,1.9fr)]">
      <nav aria-label="诗词目录" className="study-panel max-h-72 overflow-y-auto lg:sticky lg:top-24 lg:max-h-[780px]">{filtered.map(poem => <button key={poem.slug} type="button" aria-current={poem.slug === selected.slug ? "true" : undefined} onClick={() => router.replace(`/poetry/?poem=${poem.slug}`, { scroll: false })} className={cn("relative flex w-full items-center gap-3 border-b border-border px-5 py-5 text-left transition-colors last:border-b-0 hover:bg-muted sm:px-6", poem.slug === selected.slug && "bg-accent before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-primary")}><div className="min-w-0 flex-1"><h2 className="mb-2 font-serif text-xl font-semibold">{poem.title}<span className="ml-3 whitespace-nowrap font-sans text-sm font-normal text-muted-foreground">{poem.dynasty} · {poem.author}</span></h2><p className="line-clamp-2 text-sm leading-7 text-muted-foreground">{poem.lines.slice(0, 2).map(line => line.text).join("")}<br />{poem.lines.slice(2, 4).map(line => line.text).join("")}</p></div><ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /></button>)}</nav>
      <PoemReader key={selected.slug} poem={selected} />
    </div> : <Empty className="study-panel min-h-80"><EmptyHeader><EmptyMedia variant="icon"><BookOpen aria-hidden="true" /></EmptyMedia><EmptyTitle>{filter === "saved" && !query ? "还没有收藏诗词" : "没有找到这首诗"}</EmptyTitle><EmptyDescription>{filter === "saved" && !query ? "打开一首喜欢的诗，点“收藏”，下次就能在这里找到。" : "试试诗人姓名、诗句中的几个字，或清除筛选。"}</EmptyDescription></EmptyHeader><Button variant="outline" onClick={() => { setQuery(""); setFilter("all"); }}>查看全部诗词</Button></Empty>}
  </div>;
}
