"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const allowedPaths = new Set(["/", "/pinyin", "/pinyin/initials", "/pinyin/finals", "/pinyin/syllables", "/pinyin/tones", "/stroke", "/poetry", "/dictionary"]);

export function AdsterraBanner() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const path = pathname === "/" ? "/" : pathname.replace(/\/$/, "");

  if (!allowedPaths.has(path) || dismissed) return null;

  return <aside aria-label="广告支持" className="no-print mx-auto my-5 w-full max-w-[1420px] text-center">
    {!enabled ? <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
      <span>可选择显示一条广告支持本站，第三方可能使用 Cookie。</span>
      <Link href="/privacy/" className="underline underline-offset-4">隐私说明</Link>
      <button type="button" className="min-h-11 px-2 underline underline-offset-4" onClick={() => setEnabled(true)}>允许广告</button>
      <button type="button" className="min-h-11 px-2" onClick={() => setDismissed(true)}>不显示</button>
    </div> : <div className="flex flex-col items-center gap-1">
      <div className="flex w-[320px] max-w-full items-center justify-between text-xs text-muted-foreground">
        <span>广告 · Adsterra</span>
        <button type="button" className="min-h-11 px-2" onClick={() => { setEnabled(false); setDismissed(true); }}>关闭广告</button>
      </div>
      <iframe title="Adsterra 横幅广告" src="/ads/banner.html" width="320" height="50"
        sandbox="allow-scripts allow-popups" referrerPolicy="no-referrer"
        className="block h-[50px] w-[320px] max-w-full border-0" />
    </div>}
  </aside>;
}
