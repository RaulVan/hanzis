import { pageMetadata } from "@/lib/seo";
import { PageHeading } from "@/components/layout/PageHeading";
import { HanziMatchGame } from "@/components/games/hanzi-match/HanziMatchGame";
import { LearningGuide } from "@/components/learning/LearningGuide";

export const metadata = pageMetadata(
  "/games/hanzi-match/",
  "汉字词语消除 · 按顺序点字组词的识字小游戏",
  "在 16 张字卡中找出 8 个常用二字词，按先后顺序点选即可消除。入门、进阶、挑战共 15 关，通关后查看拼音、释义和例句，进度只保存在本机。",
);

export default function HanziMatchPage() {
  return (
    <>
      <PageHeading title="两个字，拼成一个词。" description="在字卡里找出本关的词语，先点第一个字，再点第二个字。" />
      <HanziMatchGame />
      <LearningGuide id="hanzi-match-guide" title="汉字词语消除怎么玩" steps={[
        { title: "按顺序点两个字", text: "每关 16 张字卡里藏着 8 个二字词语。先点词语的第一个字，再点第二个字，组成本关词语就会消除；顺序反了或组成其他词，会告诉你原因。" },
        { title: "从入门到挑战", text: "入门关字卡标注拼音，适合刚开始识字；进阶关不显示拼音；挑战关的词语首尾相连、正反都能成词，还有同一个字不同读音，需要看清每个组合。" },
        { title: "通关后再学一遍", text: "结果页列出本关词语的拼音、意思和例句，可直接打开字典。用过提示或点反顺序的词会进入待复习清单，进度只保存在当前浏览器，不需要注册。" },
      ]} links={[{ href: "/dictionary/", label: "查询词语释义" }, { href: "/pinyin/practice/", label: "拼音在线练习" }, { href: "/stroke/", label: "练习汉字笔顺" }]} />
    </>
  );
}
