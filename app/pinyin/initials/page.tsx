import { PinyinPageHeader } from "@/components/pinyin/PinyinPageHeader";
import { pageMetadata } from "@/lib/seo";
import { PinyinLearning } from "@/components/pinyin/PinyinLearning";

const heading = {
  path: "/pinyin/initials/",
  title: "23 个声母表 · 拼音发音与例字",
  description: "学习汉语拼音 23 个声母的呼读音，听录音、跟读例字，并把例字生成可打印的汉字练习字帖。",
};
export const metadata = pageMetadata(heading.path, heading.title, heading.description);
export default function InitialsPage() { return <><PinyinPageHeader {...heading} /><PinyinLearning key="initials" kind="initials" /></>; }
