import { pageMetadata } from "@/lib/seo";
import { PageHeading } from "@/components/layout/PageHeading";
import { FeihuaGame } from "@/components/games/feihua/FeihuaGame";
import { LearningGuide } from "@/components/learning/LearningGuide";

export const metadata = pageMetadata(
  "/games/feihua/",
  "飞花令 · 含同一个字的古诗词填空游戏",
  "选月、花、春、风等一个字，补全 8 句含有这个字的古诗名句。入门取自小学古诗词，进阶取自唐诗三百首、千家诗和初中古诗词；答完查看出处并阅读整首诗。",
);

export default function FeihuaPage() {
  return (
    <>
      <PageHeading title="一个字，串起一串诗。" description="选一个字，把含有它的诗句补完整。" />
      <FeihuaGame />
      <LearningGuide id="feihua-guide" title="飞花令怎么玩" steps={[
        { title: "什么是飞花令", text: "飞花令原是古人行酒令时的诗词游戏：先定一个字，大家轮流说出含有这个字的诗句。这里改成补字：每句诗都含有你选的字，挖掉的字从四个候选里选出来。" },
        { title: "入门和进阶", text: "入门的诗句来自小学古诗词，每句挖掉一个字；进阶来自唐诗三百首、千家诗和初中古诗词，每句挖掉两个字。选错的字会被划掉，可以接着选。" },
        { title: "读完整首诗", text: "每句答完都会显示篇名和作者，点“读全诗”可以看原文，还能在诗词页开启拼音、朗读或生成字帖。每个字的最好成绩只保存在当前浏览器。" },
      ]} links={[{ href: "/poetry/", label: "阅读古诗词" }, { href: "/games/hanzi-match/", label: "汉字词语消除" }, { href: "/games/pinyin-quiz/", label: "拼音快答" }]} />
    </>
  );
}
