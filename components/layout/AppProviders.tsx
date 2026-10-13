"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { useLanguage, useTranslate } from "@/components/i18n/LanguageProvider";

export function AppProviders() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const originalTitle = useRef<{ path: string; text: string; output: string } | null>(null);
  const { language } = useLanguage();
  const t = useTranslate();

  useEffect(() => {
    const updateTitle = () => {
      const current = document.title;
      const previous = originalTitle.current;
      // Next may deliver async page metadata after the route has already rendered.
      if (previous && previous.path !== pathname && current === previous.output) return;
      if (!previous || previous.path !== pathname || current !== previous.output) {
        originalTitle.current = { path: pathname, text: current, output: current };
      }
      const title = originalTitle.current!;
      title.output = language === "zh" ? title.text : `${t(title.text.replace(/ \| 汉字网 Hanzis$/, ""))} | Hanzis`;
      if (current !== title.output) document.title = title.output;
    };
    updateTitle();
    const observer = new MutationObserver(updateTitle);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [pathname, language, t]);

  useEffect(() => {
    if (previousPath.current !== pathname) {
      document.getElementById("main-content")?.focus({ preventScroll: true });
      previousPath.current = pathname;
      window.speechSynthesis?.cancel();
    }
  }, [pathname]);

  return <Toaster theme="light" position="bottom-right" closeButton duration={4000} />;
}
