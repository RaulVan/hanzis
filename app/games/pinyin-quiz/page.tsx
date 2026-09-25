import { pageMetadata } from "@/lib/seo";
import { PageHeading } from "@/components/layout/PageHeading";
import { PinyinQuizGame } from "@/components/games/pinyin-quiz/PinyinQuizGame";
import { LearningGuide } from "@/components/learning/LearningGuide";

export const metadata = pageMetadata(
  "/games/pinyin-quiz/",
  "拼音快答 · 看字写拼音的限时练习小游戏",
  "看到汉字或词语就输入拼音，可选不标调或标声调，90 秒、180 秒或不限时 20 题。答错会提示声调、声母或拼写问题，结果页回看跳过和答错的字，成绩只保存在本机。",
);

export default function PinyinQuizPage() {
  return (
    <>
      <PageHeading title="看见一个字，写出它的音。" description="输入拼音，按回车提交，比一比这一轮能答对几题。" />
      <PinyinQuizGame />
      <LearningGuide id="pinyin-quiz-guide" title="拼音快答怎么玩" steps={[
        { title: "选题型和声调", text: "单字题考查常用字的读音，词语题要写出两个音节。刚开始可以选“不标调”，只检查字母；熟练后改为“标声调”，用数字写在音节后，如 hao3，也可以直接输入带调号的拼音。" },
        { title: "答错会告诉你原因", text: "声调写错、只有声母对、整体拼写不对，都会分别提示，可以马上再试；想不出来就跳过，页面会显示正确读音。ü 可以输入 v，在 j、q、x、y 后面写 u 也算对。" },
        { title: "限时或慢慢练", text: "90 秒和 180 秒适合挑战速度；不需要计时时选“不限时 20 题”。一轮结束后列出跳过和答错过的字词，可以直接打开字典，最好成绩只保存在当前浏览器。" },
      ]} links={[{ href: "/pinyin/", label: "系统学习拼音" }, { href: "/pinyin/tones/", label: "认识四个声调" }, { href: "/games/hanzi-match/", label: "汉字词语消除" }]} />
    </>
  );
}
