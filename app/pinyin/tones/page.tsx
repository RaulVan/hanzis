import type { Metadata } from "next";
import { ToneLearning } from "@/components/pinyin/ToneLearning";

export const metadata: Metadata = {
  title: "声调学习",
  description: "用真实调值曲线和本地发音学习普通话四声，并认识不标调号的轻声。",
};

export default function TonesPage() {
  return <ToneLearning />;
}
