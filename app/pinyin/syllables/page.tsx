import { pageMetadata } from "@/lib/seo";
import { PinyinLearning } from "@/components/pinyin/PinyinLearning";

export const metadata = pageMetadata(
  "/pinyin/syllables/",
  "16 个整体认读音节 · 拼音表与发音",
  "学习汉语拼音 16 个整体认读音节，结合录音和例字直接认读，记住音节的完整读音。",
);
export default function SyllablesPage() { return <PinyinLearning key="syllables" kind="syllables" />; }
