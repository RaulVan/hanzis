import { PinyinPageHeader } from "@/components/pinyin/PinyinPageHeader";
import { pageMetadata } from "@/lib/seo";
import { PinyinLearning } from "@/components/pinyin/PinyinLearning";

const heading = {
  path: "/pinyin/syllables/",
  title: "16 个整体认读音节 · 拼音表与发音",
  description: "学习汉语拼音 16 个整体认读音节，结合录音和例字直接认读，记住音节的完整读音。",
};
export const metadata = pageMetadata(heading.path, heading.title, heading.description);
export default function SyllablesPage() { return <><PinyinPageHeader {...heading} /><PinyinLearning key="syllables" kind="syllables" /></>; }
