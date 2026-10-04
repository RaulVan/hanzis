import { PinyinPageHeader } from "@/components/pinyin/PinyinPageHeader";
import { pageMetadata } from "@/lib/seo";
import { PinyinPractice } from "@/components/pinyin/PinyinPractice";

const heading = {
  path: "/pinyin/practice/",
  title: "拼音在线练习 · 看字选拼音与听音辨调",
  description: "每轮十道拼音练习题，结合看字选拼音与听音辨调，即时查看答案反馈，巩固普通话四声、轻声和常见汉字读音。",
};
export const metadata = pageMetadata(heading.path, heading.title, heading.description);

export default function PinyinPracticePage() {
  return <><PinyinPageHeader {...heading} /><PinyinPractice /></>;
}
