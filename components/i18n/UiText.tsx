"use client";

import type { ReactNode } from "react";
import { translate } from "@/lib/i18n";
import { useLanguage } from "./LanguageProvider";

/** A small client boundary keeps static pages server rendered and adds no markup. */
export function UiText({ children, text, values }: { children?: ReactNode; text?: string; values?: readonly (string | number | boolean | null | undefined)[] }) {
  const { language } = useLanguage();
  if (text !== undefined) return translate(text, language, values?.map(value => typeof value === "boolean" ? "" : String(value ?? "")));
  return typeof children === "string" ? translate(children, language) : children;
}
