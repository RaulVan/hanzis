"use client";

import { createElement, type HTMLAttributes } from "react";
import { useTranslate } from "./LanguageProvider";

/** Localizes accessible region names without making their server-rendered children client code. */
export function UiRegion({ as, label, ...props }: HTMLAttributes<HTMLElement> & { as: "div" | "nav" | "ul"; label: string }) {
  const t = useTranslate();
  return createElement(as, { ...props, "aria-label": t(label) });
}
