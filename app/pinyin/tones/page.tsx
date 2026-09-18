import { pageMetadata } from "@/lib/seo";
import { ToneLearning } from "@/components/pinyin/ToneLearning";

export const metadata = pageMetadata(
  "/pinyin/tones/",
  "拼音声调学习 · 四声调值与轻声发音",
  "通过调值曲线和发音学习普通话一声、二声、三声、四声，对比同一音节的声调变化，认识不标调号的轻声。",
);

export default function TonesPage() {
  return <ToneLearning />;
}
