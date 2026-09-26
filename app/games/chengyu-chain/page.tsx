import { pageMetadata } from "@/lib/seo";
import { PageHeading } from "@/components/layout/PageHeading";
import { ChengyuChainGame } from "@/components/games/chengyu-chain/ChengyuChainGame";
import { LearningGuide } from "@/components/learning/LearningGuide";

export const metadata = pageMetadata(
  "/games/chengyu-chain/",
  "成语接龙 · 用末字接下一个成语",
  "单人成语接龙：上一个成语的最后一个字，是下一个成语的第一个字。每环四个候选，接错会说明首字为什么对不上。释义和例句由汉字网编写，进度只保存在本机。",
);

export default function ChengyuChainPage() {
  return (
    <>
      <PageHeading title="末字接首字，连成一串。" description="看上一个成语的最后一个字，接出下一个成语。" />
      <ChengyuChainGame />
      <LearningGuide id="chengyu-chain-guide" title="成语接龙怎么玩" steps={[
        { title: "怎么接", text: "屏幕上的成语，最后一个字会标出来。从四个成语里选出以这个字开头的下一个。接错的选项会被划掉，并说明它的首字和这一环要接的字不一样。" },
        { title: "提示", text: "“标出这一环”会把正确的成语框出来，这一环只扣一次星。再点一次只是重复标出，不再扣星。每错 3 次也会少一颗星。" },
        { title: "看释义", text: "当前成语下面有一句释义。整条链接完后，可以回看每个成语的释义、例句，并到字典里对照。释义和例句尚未完成人工审校。最好成绩只保存在当前浏览器。" },
      ]} links={[{ href: "/dictionary/", label: "查字典" }, { href: "/games/hanzi-match/", label: "汉字词语消除" }, { href: "/games/poem-sort/", label: "古诗词排序" }]} />
    </>
  );
}
