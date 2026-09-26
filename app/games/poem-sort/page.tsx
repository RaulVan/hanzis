import { pageMetadata } from "@/lib/seo";
import { PageHeading } from "@/components/layout/PageHeading";
import { PoemSortGame } from "@/components/games/poem-sort/PoemSortGame";
import { LearningGuide } from "@/components/learning/LearningGuide";

export const metadata = pageMetadata(
  "/games/poem-sort/",
  "古诗词排序 · 把打乱的诗句按顺序点回去",
  "从本站校对过的古诗词里抽出五言和七言，把打乱的字按原句顺序点回去。排完查看作者、拼音、译文和注释，并阅读整首诗。进度只保存在本机。",
);

export default function PoemSortPage() {
  return (
    <>
      <PageHeading title="把诗句，按回去。" description="字块被打乱了，按原来的顺序点回去。" />
      <PoemSortGame />
      <LearningGuide id="poem-sort-guide" title="古诗词排序怎么玩" steps={[
        { title: "点选，不拖拽", text: "每一句的字被打散。按诗里的顺序逐个点进去。点错的字会留在原处，并说明还没轮到它，不会直接告诉你下一个字是什么。" },
        { title: "五言和七言", text: "入门的诗每一句都是五个字，进阶的诗每一句都是七个字。词牌句式长短不一的作品不收。重复的字点哪一个都可以，只要字对得上。" },
        { title: "提示和成绩", text: "“放入下一个字”会直接放对一个字，每放一次少一颗星；每点错 3 次也少一颗星。排完可以看到拼音、译文、注释，并打开这首诗的原文页。最好成绩只保存在当前浏览器。" },
      ]} links={[{ href: "/poetry/", label: "阅读古诗词" }, { href: "/games/feihua/", label: "飞花令" }, { href: "/games/chengyu-chain/", label: "成语接龙" }]} />
    </>
  );
}
