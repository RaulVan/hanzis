import Link from "next/link";

/** Server-rendered help stays readable when the interactive tool needs JavaScript. */
export function LearningGuide({ id, title, steps, links }: {
  id: string;
  title: string;
  steps: { title: string; text: string }[];
  links: { href: string; label: string }[];
}) {
  return <section aria-labelledby={id} className="mt-12 space-y-5 border-t border-border pt-8">
    <h2 id={id} className="section-title">{title}</h2>
    <div className="grid gap-6 md:grid-cols-3">{steps.map(step => <div key={step.title} className="space-y-2">
      <h3 className="font-semibold">{step.title}</h3>
      <p className="body-copy">{step.text}</p>
    </div>)}</div>
    <nav aria-label={`${title}相关学习工具`} className="flex flex-wrap gap-x-6 gap-y-2">
      {links.map(link => <Link key={link.href} href={link.href} className="inline-flex min-h-11 items-center text-sm text-primary underline underline-offset-4">{link.label}</Link>)}
    </nav>
  </section>;
}
