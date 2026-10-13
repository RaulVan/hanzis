import { UiText } from "@/components/i18n/UiText";
import haitang from "@/data/haitang-manifest.json";
import sources from "@/data/dictionary-sources.json";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { BookOpen, FileText, ShieldCheck, Volume2 } from "lucide-react";
import { PageHeading } from "@/components/layout/PageHeading";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export const metadata = pageMetadata("/about/copyright/", "版权说明", "查看汉字网字形、字典、诗词、拼音与学习资料的数据来源、版本范围及完整第三方许可说明。");

export default function CopyrightPage() {
  return <div className="mx-auto flex max-w-5xl flex-col gap-8">
    <PageHeading className="stacked-page-heading" title="版权说明" description="数据来源、版本范围与使用许可。" />
    <Link href="/about/" className="text-sm text-primary underline underline-offset-4"><UiText text="返回关于与帮助" /></Link>
    <section id="sources" aria-labelledby="sources-title" className="scroll-mt-24 space-y-4">
      <h2 id="sources-title" className="section-title flex items-center gap-2"><BookOpen aria-hidden="true" /><UiText text="数据来源与范围"  /></h2>
      <Card><CardContent className="space-y-5 pt-1 text-sm leading-7 text-muted-foreground">
        <div><h3 className="font-semibold text-foreground"><UiText text="汉字字形与笔顺"  /></h3><p><UiText text="9,574 个本地字形文件来自"  /><a href="https://github.com/chanind/hanzi-writer-data" rel="noreferrer" className="underline underline-offset-4">hanzi-writer-data</a><UiText text="。底层字形资料按文鼎公众授权条款提供，发布包保留完整许可和来源说明。"  /></p></div>
        <div><h3 className="font-semibold text-foreground"><UiText text="字词释义"  /></h3><p><UiText text="开放词库包含 278,369 条释义索引，来源快照取自"  /><a href="https://github.com/theajack/cnchar" rel="noreferrer" className="underline underline-offset-4">cnchar-data</a><UiText text="，按 MIT License 使用并重新分片。部分词条可能缺少释义，页面会如实提示。"  /></p></div>
        <div><h3 className="font-semibold text-foreground"><UiText text="教育部《国语辞典简编本》"  /></h3><p><UiText text="本地保留版本 2014_20260626 的 45,130 条原始繁体条目及全部字段；网站的简体检索映射和学习提示与原始资料分开呈现。来源为"  /><a href="https://dict.concised.moe.edu.tw/" rel="noreferrer" className="underline underline-offset-4"><UiText text="教育部《国语辞典简编本》"  /></a><UiText text="，依 CC BY-ND 3.0 TW 及官方公众授权说明使用。"  /></p></div>
        <div><h3 className="font-semibold text-foreground"><UiText text="教育部《重編國語辭典修訂本》"  /></h3><p><UiText text="通过"  /><a href="https://github.com/g0v/moedict-data/tree/a6dc997417507eb510fc29822bc514de2c92728c" className="underline underline-offset-4">g0v/moedict-data</a> <UiText text=" 收录{0} 条资料，保留繁体原文、异读、例句与引文。上游标示为中華民國110年11月臺灣學術網路第六版，依 CC BY-ND 3.0 TW 使用。moedict-process 为相关处理工具，不另算一个来源。" values={[sources[0].entries.toLocaleString("zh-CN")]} /></p></div>
        <div><h3 className="font-semibold text-foreground"><UiText text="第三方整理字典 · chinese-xinhua"  /></h3><p><UiText text="来自"  /><a href="https://github.com/pwxcoo/chinese-xinhua/tree/fe6d6c2e8baa82187f4c96bbe042e43f96c05666" className="underline underline-offset-4">pwxcoo/chinese-xinhua</a><UiText text="：{0} 条汉字、{1} 条词语与 {2} 条成语记录，包含同字异读与重复词头。这是网络收集整理资料，非官方《新华字典》版本；仓库附 MIT License，原始内容权利归属未逐条核验。各来源分别显示，便于对照。" values={[sources[1].entries.toLocaleString("zh-CN"), sources[2].entries.toLocaleString("zh-CN"), sources[3].entries.toLocaleString("zh-CN")]} /></p></div>
        <div><h3 className="font-semibold text-foreground"><UiText text="诗词与注音"  /></h3><p><UiText text="本站提供 30 首含拼音的校对诗词，以及 {0} 篇作品（含诗、词、文、曲、赋）。扩展作品的拼音由 pinyin-pro 自动生成，并优先采用已有校对诗句；部分多音字待校对，未识别的字不注音。译文或注解可能缺失；注音标本调，实际朗读可能变调。诗词来源：" values={[haitang.counts.works.toLocaleString("zh-CN")]} /><a href="https://github.com/chinese-poetry/chinese-poetry" className="underline underline-offset-4">chinese-poetry/chinese-poetry</a>。</p></div>
        <div><h3 className="font-semibold text-foreground"><UiText text="汉字词语消除题库"  /></h3><p><UiText text="15 关共 120 个常用二字词及其释义、例句由汉字网编写，读音与 pinyin-pro 交叉校验，轻声等差异逐条人工确认；释义与例句尚未完成人工审校，发现问题欢迎反馈。拼音快答复用这批词语，以及其中只有一个读音、且不读轻声的 132 个单字。"  /></p></div>
        <div><h3 className="font-semibold text-foreground"><UiText text="飞花令诗句"  /></h3><p><UiText text="从本站诗词资料中的“小学古诗词”“唐诗三百首”“千家诗”“初中古诗词”篇目抽取五言、七言整句，不含近现代作品；入门 12 个关键字全部收录，进阶每字取前 48 句。题库由脚本从已校验的资料快照生成，可重复构建。"  /></p></div>
        <div><h3 className="font-semibold text-foreground"><UiText text="古诗词排序"  /></h3><p><UiText text="用本站 30 首校对诗词里的五言、七言整句。一句不是五个或七个字的作品不进入这一局，例如《如梦令》。拼音、译文和注释沿用校对页。"  /></p></div>
        <div><h3 className="font-semibold text-foreground"><UiText text="成语接龙"  /></h3><p><UiText text="6 条链、每条 6 个四字成语，由汉字网编写。末字接下一个成语的首字。释义和例句尚未完成人工审校。"  /></p></div>
        <div><h3 className="font-semibold text-foreground"><UiText text="每日成语"  /></h3><p><UiText text="可猜成语和每日答案来自 chinese-xinhua 成语快照，按 MIT License 使用。答案约 366 条，释义较短且不包含成语本身，便于当作提示。读音按本站 23 个声母拆开，y、w 算拼写字母。资料未经人工审校，每条只用快照里的一种读音。题目编号是日期，分享文字不含答案。"  /></p></div>
      </CardContent></Card>
    </section>

    <section id="learning-sources" aria-labelledby="learning-sources-title" className="scroll-mt-24 space-y-4">
      <h2 id="learning-sources-title" className="section-title"><UiText text="首批学习活动与参考资料" /></h2>
      <Card><CardContent className="space-y-4 pt-1 text-sm leading-7 text-muted-foreground">
        <p><UiText text="五首诗的学习问题、背诵线索、书写任务及两个拼音难点单元由本站整理。以下资料用于事实核对，未转载其长篇赏析；参考资料不表示原机构为本站背书。" /></p>
        <p><UiText text="2026-10-13，AI Agent 核对了新增文字、问题答案与参考资料的对应关系。人工教师审校和示例录音听辨尚未完成；这不代表全站题库已审校。原文保留本站现有版本。" /></p>
        <ul className="list-disc space-y-2 pl-5">
          {[["静夜思", "10"], ["春晓", "08"], ["咏鹅", "05"], ["登鹳雀楼", "07"], ["悯农·其二", "13"]].map(([title, id]) => <li key={id}><a href={`https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/chi-edu/recommended-passages/KS1_${id}.pdf`} className="underline underline-offset-4"><UiText text="香港教育局建议篇章资料" /> · 《{title}》 PDF</a></li>)}
          <li><a href="https://dict.concised.moe.edu.tw/dictView.jsp?ID=2121&la=0&powerMode=0" className="underline underline-offset-4"><UiText text="教育部简编本：不觉的语境与读音" /></a></li>
          <li><a href="https://www.moe.gov.cn/s78/A18/A18_ztzl/jnhypyfa/201805/t20180517_336341.html" className="underline underline-offset-4"><UiText text="教育部：汉语拼音的教学特色" /></a></li>
          <li><a href="https://www.edu.cn/pu_tong_hua_483/20060323/t20060323_19443.shtml" className="underline underline-offset-4"><UiText text="中国教育和科研计算机网：普通话语音" /></a></li>
          <li><a href="https://jwc.hnfnu.edu.cn/info/1055/3129.htm" className="underline underline-offset-4"><UiText text="湖南第一师范学院：怎么使用汉语拼音方案" /></a></li>
        </ul>
        <p><UiText text="版本提示：教育局《悯农》资料采用“盘中飧”，本站沿用“盘中餐”；《登鹳鹊楼》与本站标题“登鹳雀楼”的字形也不同。相关资料用于核对诗意，不据此宣称原文版本完全一致。" /></p>
      </CardContent></Card>
    </section>

    <section aria-labelledby="audio-title" className="space-y-4">
      <h2 id="audio-title" className="section-title flex items-center gap-2"><Volume2 aria-hidden="true" /><UiText text="录音与系统语音"  /></h2>
      <Card><CardHeader><h3 className="text-lg font-semibold leading-snug"><UiText text="本地拼音录音"  /></h3><CardDescription><UiText text="站内包含 1,678 个 MP3 文件。轻声或缺少录音的示例会明确使用设备的系统中文语音。"  /></CardDescription></CardHeader></Card>
    </section>

    <section aria-labelledby="license-title" className="space-y-4">
      <h2 id="license-title" className="section-title flex items-center gap-2"><ShieldCheck aria-hidden="true" /><UiText text="许可与完整说明"  /></h2>
      <Card><CardContent className="flex flex-wrap gap-3 pt-1">
        <Link href="/licenses/NOTICE.txt" className="inline-flex min-h-11 items-center gap-2 rounded-md border px-4 py-2 hover:bg-muted"><FileText aria-hidden="true" className="size-4" /><UiText text="第三方资料说明"  /></Link>
        <Link href="/licenses/MOE-Concised-Usage.pdf" className="inline-flex min-h-11 items-center gap-2 rounded-md border px-4 py-2 hover:bg-muted"><FileText aria-hidden="true" className="size-4" /><UiText text="简编本使用说明"  /></Link>
        <Link href="/licenses/MOE-Revised-Usage.txt" className="inline-flex min-h-11 items-center gap-2 rounded-md border px-4 py-2 hover:bg-muted"><FileText aria-hidden="true" className="size-4" /><UiText text="修订本使用说明"  /></Link>
        <a href="https://creativecommons.org/licenses/by-nd/3.0/tw/" className="inline-flex min-h-11 items-center rounded-md border px-4 py-2 hover:bg-muted">CC BY-ND 3.0 TW</a>
        <Link href="/licenses/chinese-xinhua-MIT.txt" className="inline-flex min-h-11 items-center rounded-md border px-4 py-2 hover:bg-muted">chinese-xinhua · MIT License</Link>
        <Link href="/licenses/chinese-xinhua-README.txt" className="inline-flex min-h-11 items-center rounded-md border px-4 py-2 hover:bg-muted"><UiText text="查看上游说明与版权声明" /></Link>
        <Link href="/licenses/ARPHICPL.TXT" className="inline-flex min-h-11 items-center gap-2 rounded-md border px-4 py-2 hover:bg-muted"><FileText aria-hidden="true" className="size-4" /><UiText text="字形资料许可"  /></Link>
      </CardContent></Card>
    </section>
  </div>;
}
