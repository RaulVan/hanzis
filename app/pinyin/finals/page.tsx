import { pageMetadata } from "@/lib/seo";
import { PinyinLearning } from "@/components/pinyin/PinyinLearning";

export const metadata = pageMetadata(
  "/pinyin/finals/",
  "24 个韵母表 · 单韵母、复韵母与鼻韵母",
  "分类学习汉语拼音 24 个韵母，认识单韵母、复韵母与鼻韵母，听发音录音、跟读例字并练习书写。",
);
export default function FinalsPage() { return <PinyinLearning key="finals" kind="finals" />; }
