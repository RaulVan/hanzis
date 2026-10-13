import Link from "next/link";
import { UiText } from "@/components/i18n/UiText";
import { Button } from "@/components/ui/button";
import { getPoem } from "@/data/poems";
import { poemLearning } from "@/data/poemLearning";

export function PoemLearningGuide({ slug }: { slug: string }) {
  const guide = poemLearning[slug];
  if (!guide) return null;
  return <section className="study-panel space-y-6 p-5 sm:p-8" aria-labelledby="poem-learning-title">
    <header className="space-y-2"><h2 id="poem-learning-title" className="section-title"><UiText text="读懂这首诗" /></h2><p className="body-copy"><UiText>{guide.focus}</UiText></p></header>
    <ul className="list-disc space-y-3 pl-5 text-sm leading-7">{guide.points.map(point => <li key={point}><UiText>{point}</UiText></li>)}</ul>
    <div className="space-y-2"><h3 className="font-medium"><UiText text="记住诗里的线索" /></h3><p className="body-copy"><UiText>{guide.memory}</UiText></p></div>
    <div className="space-y-2"><h3 className="font-medium"><UiText text="想一想，再看解释" /></h3><p className="body-copy"><UiText>{guide.question}</UiText></p><details className="rounded-lg border p-4"><summary className="cursor-pointer font-medium"><UiText text="查看答案与解释" /></summary><p className="mt-3 text-sm leading-7"><UiText>{guide.answer}</UiText></p></details></div>
    <div className="space-y-3"><h3 className="font-medium"><UiText text="写一写，用一用" /></h3><p className="body-copy"><UiText>{guide.writing}</UiText></p><Button asChild variant="outline"><Link href={`/?text=${encodeURIComponent(guide.characters)}&generate=poetry`}><UiText text="用选字生成字帖" /></Link></Button></div>
    <div className="space-y-3"><h3 className="font-medium"><UiText text="接着读" /></h3>{guide.related.map(item => {
      const poem = getPoem(item.slug);
      return poem ? <div key={item.slug} className="space-y-1"><Link href={`/poetry/${item.slug}/`} className="inline-flex min-h-11 items-center font-medium underline underline-offset-4">《{poem.title}》</Link><p className="text-sm leading-7 text-muted-foreground"><UiText>{item.reason}</UiText></p></div> : null;
    })}</div>
    <p className="text-xs leading-6 text-muted-foreground"><UiText text="学习活动为本站整理，沿用上方原文版本。资料与许可见关于页的版权说明。" /></p>
  </section>;
}
