"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { DictionaryKind, DictionaryQuery } from "@/lib/dictionaryData";
import { validateDictionaryQuery } from "@/lib/dictionaryData";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const radicals = ["一", "丨", "丶", "丿", "乙", "人", "亻", "儿", "八", "冂", "冖", "刀", "刂", "力", "勹", "匕", "十", "卜", "又", "口", "囗", "土", "士", "夂", "夕", "大", "女", "子", "宀", "寸", "小", "山", "工", "巾", "干", "广", "廴", "廾", "弓", "彐", "彳", "心", "忄", "戈", "户", "手", "扌", "攵", "文", "斤", "方", "日", "月", "木", "欠", "止", "歹", "殳", "比", "毛", "氏", "气", "水", "氵", "火", "灬", "爪", "父", "片", "牙", "牛", "犬", "犭", "王", "玉", "瓜", "瓦", "甘", "生", "田", "疒", "白", "皮", "目", "矛", "矢", "石", "示", "礻", "禾", "穴", "立", "竹", "米", "糸", "纟", "缶", "羊", "羽", "老", "耳", "聿", "肉", "臣", "自", "至", "舌", "舟", "色", "艹", "虫", "血", "行", "衣", "衤", "西", "见", "角", "言", "讠", "贝", "赤", "走", "足", "身", "车", "辛", "辰", "辶", "邑", "酉", "里", "金", "钅", "长", "门", "阝", "隶", "隹", "雨", "青", "非", "面", "革", "韦", "音", "页", "风", "飞", "食", "饣", "首", "香", "马", "骨", "高", "髟", "鬼", "鱼", "鸟", "鹿", "麦", "麻", "黄", "黍", "黑", "黹", "黾", "鼎", "鼓", "鼠", "鼻", "齐", "齿", "龙", "龟", "龠"];

export function DictionarySearchForm({ initial, onSearch }: { initial: DictionaryQuery; onSearch: (query: DictionaryQuery) => void }) {
  const [query, setQuery] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(Boolean(initial.radical || initial.strokes));
  function submit(event: React.FormEvent) { event.preventDefault(); const next = { ...query, q: query.q.trim() }; const problem = validateDictionaryQuery(next); setError(problem); if (!problem) onSearch(next); }

  return <form onSubmit={submit} className="study-panel flex flex-col gap-5 p-5 sm:p-6" aria-label="字典检索">
    <FieldGroup><Field><FieldLabel htmlFor="dictionary-query">汉字、词语或拼音</FieldLabel><div className="flex gap-2"><InputGroup><InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon><InputGroupInput id="dictionary-query" type="search" value={query.q} onChange={event => { setQuery({ ...query, q: event.target.value }); setError(null); }} maxLength={48} placeholder="例如：学、学习、xue" aria-invalid={Boolean(error)} aria-describedby="dictionary-query-help" /></InputGroup><Button type="submit">查询</Button></div><FieldDescription id="dictionary-query-help">支持简体、繁体和单音节拼音。拼音检索显示各声调的汉字。</FieldDescription>{error && <p className="text-sm text-destructive" role="alert">{error}</p>}</Field></FieldGroup>
    <Collapsible open={expanded} onOpenChange={setExpanded} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><ToggleGroup type="single" variant="outline" value={query.kind} aria-label="检索范围" onValueChange={value => { if (value) setQuery({ ...query, kind: value as DictionaryKind, radical: "", strokes: null }); }}><ToggleGroupItem value="all">全部</ToggleGroupItem><ToggleGroupItem value="character">汉字</ToggleGroupItem><ToggleGroupItem value="word">词语</ToggleGroupItem><ToggleGroupItem value="idiom">成语</ToggleGroupItem></ToggleGroup>
        <CollapsibleTrigger asChild><Button type="button" variant="ghost"><SlidersHorizontal aria-hidden="true" />部首与笔画</Button></CollapsibleTrigger>
      </div>
      <CollapsibleContent><div className="grid gap-4 rounded-lg bg-muted p-4 sm:grid-cols-2"><Field><FieldLabel htmlFor="dictionary-radical">部首</FieldLabel><Select value={query.radical || "all"} onValueChange={value => setQuery({ ...query, kind: "character", radical: value === "all" ? "" : value })}><SelectTrigger id="dictionary-radical" className="w-full bg-card"><SelectValue placeholder="全部部首" /></SelectTrigger><SelectContent><SelectItem value="all">全部部首</SelectItem>{radicals.map(radical => <SelectItem key={radical} value={radical}>{radical}</SelectItem>)}</SelectContent></Select></Field><Field><FieldLabel htmlFor="dictionary-strokes">总笔画数</FieldLabel><Select value={query.strokes?.toString() || "all"} onValueChange={value => setQuery({ ...query, kind: "character", strokes: value === "all" ? null : Number(value) })}><SelectTrigger id="dictionary-strokes" className="w-full bg-card"><SelectValue placeholder="全部笔画" /></SelectTrigger><SelectContent><SelectItem value="all">全部笔画</SelectItem>{Array.from({ length: 36 }, (_, index) => index + 1).map(count => <SelectItem key={count} value={String(count)}>{count} 画</SelectItem>)}</SelectContent></Select></Field><p className="text-xs text-muted-foreground sm:col-span-2">部首与笔画筛选仅适用于汉字。清空搜索框后，可以按这些条件查字。</p></div></CollapsibleContent>
    </Collapsible>
    <div className="flex flex-wrap items-center gap-1 text-sm"><span className="mr-1 text-muted-foreground">试着查</span>{["学", "汉字", "春天", "画蛇添足", "xue"].map(term => <Button key={term} type="button" variant="ghost" size="sm" className="min-w-11" onClick={() => onSearch({ q: term, kind: "all", radical: "", strokes: null })}>{term}</Button>)}</div>
  </form>;
}
