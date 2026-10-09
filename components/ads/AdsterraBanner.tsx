"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

const learningSections = ["/pinyin", "/stroke", "/poetry", "/dictionary", "/games"];

export function AdsterraBanner() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);
  const path = pathname === "/" ? "/" : pathname.replace(/\/$/, "");

  const isLearningPage = path === "/" || learningSections.some(section => path === section || path.startsWith(`${section}/`));
  if (!isLearningPage || dismissed) return null;

  return <aside aria-label="广告支持" className="no-print mx-auto my-5 w-full max-w-[1420px] text-center">
    <div className="flex flex-col items-center gap-1">
      <div className="flex w-[320px] max-w-full items-center justify-between text-xs text-muted-foreground">
        <span>广告 · Adsterra</span>
        <button type="button" className="min-h-11 px-2" onClick={() => setDismissed(true)}>关闭广告</button>
      </div>
      <iframe title="Adsterra 横幅广告" src="/ads/banner" width="320" height="50"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" referrerPolicy="strict-origin-when-cross-origin"
        className="block h-[50px] w-[320px] max-w-full border-0" />
    </div>
  </aside>;
}
