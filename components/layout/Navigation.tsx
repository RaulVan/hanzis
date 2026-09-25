"use client";

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
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => href === "/" ? pathname === "/" : `${pathname.replace(/\/$/, "")}/`.startsWith(href);

  return (
    <header className="site-header no-print">
      <div className="site-container">
        <div className="header-row">
          <Link href="/" aria-label="汉字网首页" className="wordmark" onClick={() => setOpen(false)}>
            <span>汉字网</span><span lang="en">Hanzis</span>
          </Link>
          <nav aria-label="主导航" className="desktop-navigation">
            {navItems.map(({ href, label }) => (
              <Link key={href} href={href} className={cn("navigation-link", isActive(href) && "is-active")} aria-current={isActive(href) ? "page" : undefined}>{label}</Link>
            ))}
          </nav>
          <div className="mobile-menu-trigger">
            <Button variant="ghost" size="icon" aria-label={open ? "关闭导航" : "打开导航"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {open && (
          <nav id="mobile-navigation" aria-label="移动端主导航" className="mobile-navigation">
            {navItems.map(({ href, label }) => (
              <Link key={href} href={href} className={cn("navigation-link", isActive(href) && "is-active")} aria-current={isActive(href) ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
