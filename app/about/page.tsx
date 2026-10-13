import { ContentFeedback } from "@/components/learning/ContentFeedback";
import { UiText } from "@/components/i18n/UiText";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { PageHeading } from "@/components/layout/PageHeading";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";

export const metadata = pageMetadata(
  "/about/",
  "关于与帮助",
  "了解汉字网的字帖生成、拼音学习、笔顺查询、古诗词与中文字典使用方法，查看数据来源与第三方许可。",
);

const helpItems = [
  { href: "/", title: "字帖生成", text: "输入汉字后选择字格、描红、拼音与纸张；可下载 PDF、当前页图片，或打印全部页面。" },
  { href: "/pinyin/", title: "拼音学习", text: "按声母、韵母、整体认读音节和声调学习，再用综合练习检查掌握情况。" },
  { href: "/stroke/", title: "汉字笔顺", text: "输入一个汉字，播放笔顺动画、逐笔观察并在画布中跟写。" },
  { href: "/poetry/", title: "古诗词", text: "搜索唐宋诗词、切换拼音、朗读和背诵，也可以将整首诗带入字帖。" },
  { href: "/dictionary/", title: "中文字典", text: "按汉字、词语、拼音、部首或笔画查询，再前往字帖和笔顺练习。" },
  { href: "/games/", title: "汉字小游戏", text: "词语消除、拼音快答、飞花令、古诗词排序、成语接龙和每日成语：每局几分钟，答完查看拼音、释义或出处，进度只保存在本机。" },
];

export default function AboutPage() {
  return <div className="mx-auto flex max-w-5xl flex-col gap-8">
    <PageHeading className="stacked-page-heading" title="关于汉字网" description="一组无需注册、打开就能使用的中文学习工具。" />
    <section aria-labelledby="help-title" className="space-y-4">
      <h2 id="help-title" className="section-title flex items-center gap-2"><HelpCircle aria-hidden="true" /><UiText text="从哪里开始"  /></h2>
      <div className="grid gap-4 sm:grid-cols-2">{helpItems.map(item => <Card key={item.href}>
        <CardHeader><h3 className="text-lg font-semibold leading-snug"><Link className="underline-offset-4 hover:underline" href={item.href}><UiText>{item.title}</UiText></Link></h3><CardDescription><UiText>{item.text}</UiText></CardDescription></CardHeader>
      </Card>)}</div>
    </section>

    <section id="sources" className="scroll-mt-24 space-y-3">
      <h2 className="section-title"><UiText text="版权与资料" /></h2>
      <p className="body-copy"><UiText text="字形、字典、诗词和学习资料的来源、版本及许可集中列于版权说明。" /></p>
      <Link href="/about/copyright/" className="inline-flex min-h-11 items-center text-primary underline underline-offset-4"><UiText text="版权说明" /></Link>
    </section>
    <section id="feedback" className="space-y-3">
      <h2 className="section-title"><UiText text="联系与反馈" /></h2>
      <p className="body-copy"><UiText text="发现读音、释义或功能问题，欢迎附上页面与具体内容联系我们。" /></p>
      <a href="mailto:f35j10@gmail.com" className="inline-flex min-h-11 items-center text-primary underline underline-offset-4">f35j10@gmail.com</a>
      <div><ContentFeedback contentId="about" /></div>
    </section>
  </div>;
}
