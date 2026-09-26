import { pageMetadata } from "@/lib/seo";
import { PageHeading } from "@/components/layout/PageHeading";
import { FeihuaGame } from "@/components/games/feihua/FeihuaGame";
import { LearningGuide } from "@/components/learning/LearningGuide";

export const metadata = pageMetadata(
  "/games/feihua/",
  "飞花令 · 填空、主题与对句",
  "飞花令有三种玩法：按关键字填空、按春天或月夜等主题填空，以及自己写一句五言或七言。词库里没有的句子会提示未收录，系统再给出下一句。",
);

export default function FeihuaPage() {
  return (
    <>
      <PageHeading title="一个字，串起一串诗。" description="填空、按主题出句，或者自己接一句。" />
      <FeihuaGame />
      <LearningGuide id="feihua-guide" title="飞花令怎么玩" steps={[
        { title: "三种玩法", text: "填空：每句都含有你选的字，挖掉的字从四个候选里选。主题：按春天、月夜、山水等出句，主题字留在句中。对句：自己写五个或七个字。词库里有的会接上，没有的提示未收录，然后系统再给一句。" },
        { title: "入门和进阶", text: "入门的诗句来自小学古诗词，填空每句挖掉一个字；进阶来自唐诗三百首、千家诗和初中古诗词，填空每句挖掉两个字。选错的字会被划掉，可以接着选。空输入和格式不对的对句不记失误。" },
        { title: "读完整首诗", text: "每句答完都会显示篇名和作者，点“读全诗”可以看原文，还能在诗词页开启拼音、朗读或生成字帖。每种玩法的最好成绩只保存在当前浏览器。" },
      ]} links={[{ href: "/poetry/", label: "阅读古诗词" }, { href: "/games/hanzi-match/", label: "汉字词语消除" }, { href: "/games/pinyin-quiz/", label: "拼音快答" }]} />
    </>
  );
}
