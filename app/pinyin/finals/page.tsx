import type { Metadata } from "next";
import { PinyinLearning } from "@/components/pinyin/PinyinLearning";

export const metadata: Metadata = { title: "韵母表 · 拼音学习", description: "学习 24 个韵母，按类别查找，听录音并跟读例字。" };
export default function FinalsPage() { return <PinyinLearning key="finals" kind="finals" />; }
