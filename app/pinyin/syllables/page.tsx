import type { Metadata } from "next";
import { PinyinLearning } from "@/components/pinyin/PinyinLearning";

export const metadata: Metadata = { title: "整体认读音节 · 拼音学习", description: "学习 16 个整体认读音节，结合例字记住完整读音。" };
export default function SyllablesPage() { return <PinyinLearning key="syllables" kind="syllables" />; }
