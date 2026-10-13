"use client";
import { UiText } from "@/components/i18n/UiText";
import { useLanguage, useTranslate } from "@/components/i18n/LanguageProvider";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "字帖生成" },
  { href: "/pinyin/", label: "拼音学习" },
  { href: "/stroke/", label: "汉字笔顺" },
  { href: "/poetry/", label: "古诗词" },
  { href: "/dictionary/", label: "中文字典" },
  { href: "/games/", label: "汉字游戏" },
];

export function Navigation() {
  const t = useTranslate();
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => href === "/" ? pathname === "/" : `${pathname.replace(/\/$/, "")}/`.startsWith(href);

  return (
    <header className="site-header no-print">
      <div className="site-container">
        <div className="header-row">
          <Link href="/" aria-label={t("汉字网首页")} className="wordmark" onClick={() => setOpen(false)}>
            {language === "zh" ? <><span lang="zh-CN">汉字网</span><span lang="en">Hanzis</span></> : <span lang="en">Hanzis</span>}
          </Link>
          <nav aria-label={t("主导航")} className="desktop-navigation">
            {navItems.map(({ href, label }) => (
              <Link key={href} href={href} className={cn("navigation-link", isActive(href) && "is-active")} aria-current={isActive(href) ? "page" : undefined}><UiText>{label}</UiText></Link>
            ))}
          </nav>
          <div className="header-actions">
            <div className="language-switch" role="group" aria-label={t("界面语言")}>
              <button type="button" lang="zh-CN" aria-label="中文" aria-pressed={language === "zh"} onClick={() => setLanguage("zh")}>zh</button>
              <span aria-hidden="true">/</span>
              <button type="button" lang="en" aria-label="English" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>en</button>
            </div>
            <div className="mobile-menu-trigger">
              <Button variant="ghost" size="icon" aria-label={t(open ? "关闭导航" : "打开导航")} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>
                {open ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </div>
        {open && (
          <nav id="mobile-navigation" aria-label={t("移动端主导航")} className="mobile-navigation">
            {navItems.map(({ href, label }) => (
              <Link key={href} href={href} className={cn("navigation-link", isActive(href) && "is-active")} aria-current={isActive(href) ? "page" : undefined} onClick={() => setOpen(false)}><UiText>{label}</UiText></Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
