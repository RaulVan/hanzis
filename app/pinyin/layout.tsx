import type { ReactNode } from "react";
import { PageHeading } from "@/components/layout/PageHeading";
import { PinyinNavigation } from "@/components/pinyin/PinyinNavigation";

export default function PinyinLayout({ children }: { children: ReactNode }) {
  return <>
    <PageHeading title="读准每个音，认识每个字。" description="从声母、韵母到四声，循序渐进学拼音。" />
    <PinyinNavigation />
    {children}
  </>;
}
