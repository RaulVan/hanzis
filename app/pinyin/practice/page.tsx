import type { Metadata } from "next";
import { PinyinPractice } from "@/components/pinyin/PinyinPractice";

export const metadata: Metadata = {
  title: "拼音综合练习",
  description: "用十道看字选拼音与听音辨调练习，巩固常见拼音、普通话四声和轻声。",
};

export default function PinyinPracticePage() {
  return <PinyinPractice />;
}
