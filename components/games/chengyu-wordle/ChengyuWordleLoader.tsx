"use client";

import dynamic from "next/dynamic";

const ChengyuWordleGame = dynamic(
  () => import("@/components/games/chengyu-wordle/ChengyuWordleGame").then(module => module.ChengyuWordleGame),
  { ssr: false, loading: () => <p className="text-sm text-muted-foreground" role="status">正在准备今天的成语。</p> },
);

/** The daily puzzle depends on the browser's calendar date, so it mounts only on the client. */
export function ChengyuWordleLoader() {
  return <ChengyuWordleGame />;
}
