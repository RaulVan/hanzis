import { pageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import { PageHeading } from "@/components/layout/PageHeading";
import { DictionaryExplorer } from "@/components/dictionary/DictionaryExplorer";
import { Skeleton } from "@/components/ui/skeleton";
import { LearningGuide } from "@/components/learning/LearningGuide";

export const metadata = pageMetadata(
  "/dictionary/",
  "在线中文字典 · 汉字拼音、部首、笔画与释义查询",
  "按汉字、词语、拼音、部首或笔画查询读音与释义，查看字词解释，将认识的汉字带入字帖生成和笔顺练习。",
);
export default function DictionaryPage() {
  return <>
    <PageHeading title="查一个字，懂一层意思。" description="从读音到释义，把每一次好奇，变成新的认识。" />
    <Suspense fallback={<Skeleton className="h-[600px] w-full" aria-label="正在加载字典" />}><DictionaryExplorer /></Suspense>
    <LearningGuide id="dictionary-guide" title="在线中文字典查询方法" steps={[
      { title: "按汉字或词语查找", text: "输入想了解的汉字、词语或成语，查看读音与释义。遇到不熟悉的字，可以继续打开笔顺动画，或将它加入书写字帖。" },
      { title: "按拼音、部首或笔画查询", text: "知道读音时可使用拼音查找；不确定读音时，可按部首或笔画筛选候选汉字，再结合字形辨认。" },
      { title: "理解资料的适用范围", text: "字词释义来自开放词库及教育部《国语辞典简编本》。部分词条可能没有释义，页面会明确提示；原始资料与网站学习提示分开呈现。" },
    ]} links={[{ href: "/pinyin/", label: "学习拼音与发音" }, { href: "/stroke/", label: "查看汉字笔顺" }, { href: "/about/#sources", label: "查看字典数据来源" }]} />
  </>;
}
