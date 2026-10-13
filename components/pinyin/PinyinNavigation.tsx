"use client";
import { UiText } from "@/components/i18n/UiText";
import { useTranslate } from "@/components/i18n/LanguageProvider";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const pinyinNavigation = [
  { href: "/pinyin/", label: "学习概览" },
  { href: "/pinyin/initials/", label: "声母" },
  { href: "/pinyin/finals/", label: "韵母" },
  { href: "/pinyin/syllables/", label: "整体认读" },
  { href: "/pinyin/tones/", label: "声调" },
  { href: "/pinyin/practice/", label: "综合练习" },
];

export function PinyinNavigation() {
  const t = useTranslate();
  const pathname = usePathname().replace(/\/$/, "");
  return <nav className="sub-navigation" aria-label={t("拼音学习分类")}>
    {pinyinNavigation.map((item) => {
      const active = pathname === item.href.replace(/\/$/, "");
      return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
        className={cn("navigation-link", active && "is-active")}><UiText>{item.label}</UiText></Link>;
    })}
  </nav>;
}
