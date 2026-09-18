import { pageMetadata } from "@/lib/seo";
import { PinyinLearning } from "@/components/pinyin/PinyinLearning";

export const metadata = pageMetadata(
  "/pinyin/initials/",
  "23 个声母表 · 拼音发音与例字",
  "学习汉语拼音 23 个声母的呼读音，听录音、跟读例字，并把例字生成可打印的汉字练习字帖。",
);
export default function InitialsPage() { return <PinyinLearning key="initials" kind="initials" />; }
