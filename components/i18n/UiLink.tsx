"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTranslate } from "./LanguageProvider";

export function UiLink({ label, ...props }: { href: string; label: string; className?: string; children: ReactNode }) {
  const t = useTranslate();
  return <Link {...props} aria-label={t(label)} />;
}
