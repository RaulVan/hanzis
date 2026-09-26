import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { PageHeading } from "@/components/layout/PageHeading";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = pageMetadata(
  "/games/",
  "汉字小游戏 · 识字、拼音、诗词与成语",
  "六款无需注册的汉字学习小游戏：汉字词语消除、拼音快答、飞花令、古诗词排序、成语接龙和每日成语。每局几分钟，答完查看拼音、释义或出处，进度只保存在本机。",
);

const games = [
  { href: "/games/hanzi-match/", title: "汉字词语消除", skill: "识字 · 组词", time: "每关约 2 分钟", text: "16 张字卡里藏着 8 个二字词语，按先后顺序点出两个字就能消除。入门、进阶、挑战共 15 关。" },
  { href: "/games/pinyin-quiz/", title: "拼音快答", skill: "拼音 · 声调", time: "90 秒、180 秒或不限时", text: "看到汉字或词语就输入拼音，可以只拼字母，也可以标出声调。答错会提示是声调、声母还是拼写的问题。" },
  { href: "/games/feihua/", title: "飞花令", skill: "古诗词 · 记诵", time: "每轮 8 句", text: "填空、主题或对句。选一个字或一个主题，补全古诗名句；也可以自己写一句，词库里没有的会提示未收录。" },
  { href: "/games/poem-sort/", title: "古诗词排序", skill: "古诗词 · 顺序", time: "一首诗一句", text: "把打乱的诗句按顺序点回去。入门是五言，进阶是七言，排完查看作者、拼音、译文和注释。" },
  { href: "/games/chengyu-chain/", title: "成语接龙", skill: "成语 · 接龙", time: "每条 5 环", text: "看上一个成语的末字，从四个成语里接上下一个。接错会说明差在哪个字，每一环可以提示一次。" },
  { href: "/games/chengyu-wordle/", title: "每日成语", skill: "成语 · 声韵", time: "每天 1 题", text: "猜一个四字成语，最多 6 次。每个字分开看位置、声母、韵母和声调。分享只含日期和格子。" },
];

export default function GamesPage() {
  return (
    <>
      <PageHeading title="玩一局，记住几个字。" description="短短几分钟的汉字、拼音和诗词小游戏，无需注册，没有广告。" />
      <ul aria-label="小游戏列表" className="grid gap-4 md:grid-cols-3">
        {games.map(game => (
          <li key={game.href}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle><Link href={game.href} className="underline-offset-4 hover:underline">{game.title}</Link></CardTitle>
                <CardDescription>{game.skill} · {game.time}</CardDescription>
                <p className="body-copy pt-2 text-sm">{game.text}</p>
              </CardHeader>
              <CardFooter className="mt-auto">
                <Link href={game.href} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary" aria-label={`开始玩${game.title}`}>
                  开始玩<ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </CardFooter>
            </Card>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-muted-foreground">成绩和进度只保存在当前浏览器，换设备或清除浏览数据后会重新开始。</p>
    </>
  );
}
