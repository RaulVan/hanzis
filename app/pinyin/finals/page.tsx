import { PinyinPageHeader } from "@/components/pinyin/PinyinPageHeader";
import { pageMetadata } from "@/lib/seo";
import { PinyinLearning } from "@/components/pinyin/PinyinLearning";

const heading = {
  path: "/pinyin/finals/",
  title: "24 个韵母表 · 单韵母、复韵母与鼻韵母",
  description: "分类学习汉语拼音 24 个韵母，认识单韵母、复韵母与鼻韵母，听发音录音、跟读例字并练习书写。",
};
export const metadata = pageMetadata(heading.path, heading.title, heading.description);
export default function FinalsPage() { return <><PinyinPageHeader {...heading} /><PinyinLearning key="finals" kind="finals" /></>; }
