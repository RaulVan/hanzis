"use client";
import { UiText } from "@/components/i18n/UiText";
import { useTranslate } from "@/components/i18n/LanguageProvider";

import Link from "next/link";

/** Prerendered help remains readable before the interactive tool hydrates. */
export function LearningGuide({ id, title, steps, links }: {
  id: string;
  title: string;
  steps: { title: string; text: string }[];
  links: { href: string; label: string }[];
}) {
  const t = useTranslate();
  return <section aria-labelledby={id} className="mt-12 space-y-5 border-t border-border pt-8">
    <h2 id={id} className="section-title"><UiText>{title}</UiText></h2>
    <div className="grid gap-6 md:grid-cols-3">{steps.map(step => <div key={step.title} className="space-y-2">
      <h3 className="font-semibold"><UiText>{step.title}</UiText></h3>
      <p className="body-copy"><UiText>{step.text}</UiText></p>
    </div>)}</div>
    <nav aria-label={t("{0}相关学习工具", [title])} className="flex flex-wrap gap-x-6 gap-y-2">
      {links.map(link => <Link key={link.href} href={link.href} className="inline-flex min-h-11 items-center text-sm text-primary underline underline-offset-4"><UiText>{link.label}</UiText></Link>)}
    </nav>
  </section>;
}
