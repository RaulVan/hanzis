import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeading } from "@/components/layout/PageHeading";
import { DictionaryExplorer } from "@/components/dictionary/DictionaryExplorer";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "中文字典", description: "按汉字、词语、拼音、部首或笔画查询读音与释义，把认识的字带进字帖和笔顺练习。", alternates: { canonical: "/dictionary/" } };
export default function DictionaryPage() { return <><PageHeading title="查一个字，懂一层意思。" description="从读音到释义，把每一次好奇，变成新的认识。" /><Suspense fallback={<Skeleton className="h-[600px] w-full" aria-label="正在加载字典" />}><DictionaryExplorer /></Suspense></>; }
