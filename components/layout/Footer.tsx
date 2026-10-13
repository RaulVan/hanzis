"use client";
import { UiText } from "@/components/i18n/UiText";
import { useTranslate } from "@/components/i18n/LanguageProvider";

import Link from "next/link";

export function Footer() {
  const t = useTranslate();
  return (
    <footer className="site-footer no-print">
      <div className="site-container flex flex-wrap items-center justify-between gap-4">
        <p><UiText text="认真写字，慢慢成长。" /></p>
        <nav aria-label={t("网站信息")} className="flex flex-wrap gap-6">
          <Link href="/about/"><UiText text="关于与帮助" /></Link>
          <Link href="/privacy/"><UiText text="隐私说明" /></Link>
        </nav>
      </div>
    </footer>
  );
}
