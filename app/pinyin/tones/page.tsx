import { PinyinPageHeader } from "@/components/pinyin/PinyinPageHeader";
import { pageMetadata } from "@/lib/seo";
import { ToneLearning } from "@/components/pinyin/ToneLearning";

const heading = {
  path: "/pinyin/tones/",
  title: "拼音声调学习 · 四声调值与轻声发音",
  description: "通过调值曲线和发音学习普通话一声、二声、三声、四声，对比同一音节的声调变化，认识不标调号的轻声。",
};
export const metadata = pageMetadata(heading.path, heading.title, heading.description);

export default function TonesPage() {
  return <><PinyinPageHeader {...heading} /><ToneLearning /></>;
}
