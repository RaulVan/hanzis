import { PageHeading } from "@/components/layout/PageHeading";
import { PinyinNavigation } from "@/components/pinyin/PinyinNavigation";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export function PinyinPageHeader({ title, description, path }: { title: string; description: string; path: string }) {
  const items = [{ name: "字帖生成", href: "/" }, { name: "汉语拼音学习", href: "/pinyin/" }];
  if (path !== "/pinyin/") items.push({ name: title, href: path });
  return <>
    <Breadcrumbs items={items} />
    <PageHeading title={title} description={description} />
    <PinyinNavigation />
  </>;
}
