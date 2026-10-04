import Link from "next/link";
import { SITE_URL } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";

export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  return <>
    <StructuredData data={{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem", position: index + 1, name: item.name,
        item: new URL(item.href, SITE_URL).href,
      })),
    }} />
    <nav aria-label="面包屑" className="mb-4 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
      {items.map((item, index) => <span key={item.href} className="inline-flex items-center gap-x-2">
        {index > 0 && <span aria-hidden="true">/</span>}
        {index === items.length - 1
          ? <span aria-current="page">{item.name}</span>
          : <Link href={item.href} className="inline-flex min-h-11 items-center hover:underline">{item.name}</Link>}
      </span>)}
    </nav>
  </>;
}
