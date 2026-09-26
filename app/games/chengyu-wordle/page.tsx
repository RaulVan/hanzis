import { pageMetadata } from "@/lib/seo";
import { PageHeading } from "@/components/layout/PageHeading";
import { ChengyuWordleLoader } from "@/components/games/chengyu-wordle/ChengyuWordleLoader";
import { LearningGuide } from "@/components/learning/LearningGuide";

export const metadata = pageMetadata(
  "/games/chengyu-wordle/",
  "每日成语 · 从字、声母、韵母和声调猜成语",
  "每天一组成语。最多猜 6 次，每次看四字的位置、声母、韵母和声调是否对得上。可以看释义或一个声母。分享只含日期和格子，不含答案。",
);

export default function ChengyuWordlePage() {
  return (
    <>
      <PageHeading title="一天一条成语。" description="猜四个字，分开看字、声母、韵母和声调。" />
      <ChengyuWordleLoader />
      <LearningGuide id="chengyu-wordle-guide" title="每日成语怎么玩" steps={[
        { title: "怎么猜", text: "输入一个四字成语。词库里没有的不算一次。每一次会按四个字分别告诉你：字对不对、声母对不对、韵母对不对、声调对不对。对是位置正确，有是这条成语里有但位置不对，无是没有。" },
        { title: "提示", text: "“看释义”只扣一次星，再点不会重复扣。“看一个声母”每次揭开下一个还没对上的声母，同一个位置再看不重复扣。释义和还能提示的声母都看过、却还没猜对时，可以点“显示答案”。这一局不算答对。每错 3 次也少一颗星。" },
        { title: "每天一题", text: "题目按你所在时区的日期固定，地址里的日期就是题目编号，不是答案。连续答对会记在本机。练习题不计入连续天数。释义和读音来自未经人工审校的成语资料，每条只用其中一种读音。" },
      ]} links={[{ href: "/dictionary/", label: "查字典" }, { href: "/pinyin/initials/", label: "看声母" }, { href: "/games/chengyu-chain/", label: "成语接龙" }]} />
    </>
  );
}
