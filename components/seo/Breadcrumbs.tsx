"use client";
import { UiText } from "@/components/i18n/UiText";
import { useTranslate } from "@/components/i18n/LanguageProvider";

import Link from "next/link";
import { SITE_URL } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";

export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  const t = useTranslate();
  return <>
    <StructuredData data={{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem", position: index + 1, name: item.name,
        item: new URL(item.href, SITE_URL).href,
      })),
    }} />
    <nav aria-label={t("面包屑")} className="mb-4 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
      {items.map((item, index) => <span key={item.href} className="inline-flex items-center gap-x-2">
        {index > 0 && <span aria-hidden="true">/</span>}
        {index === items.length - 1
          ? <span aria-current="page"><UiText>{item.name}</UiText></span>
          : <Link href={item.href} className="inline-flex min-h-11 items-center hover:underline"><UiText>{item.name}</UiText></Link>}
      </span>)}
    </nav>
  </>;
}
