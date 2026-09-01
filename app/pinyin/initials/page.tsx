import type { Metadata } from "next";
import { PinyinLearning } from "@/components/pinyin/PinyinLearning";

export const metadata: Metadata = { title: "声母表 · 拼音学习", description: "学习 23 个声母的呼读音，听本地录音、读例字并生成练习字帖。" };
export default function InitialsPage() { return <PinyinLearning key="initials" kind="initials" />; }
