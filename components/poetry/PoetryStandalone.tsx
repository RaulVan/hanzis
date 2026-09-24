"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PoetrySelection } from "./PoetrySelection";

export function PoetryStandalone() {
  const slug = useSearchParams().get("poem");
  return <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
    <Button variant="ghost" asChild className="self-start"><Link href={slug ? `/poetry/?poem=${encodeURIComponent(slug)}` : "/poetry/"}><ArrowLeft aria-hidden="true" />返回诗词目录</Link></Button>
    {slug ? <PoetrySelection key={slug} slug={slug} standalone /> : <p>请从诗词目录选择一篇作品。</p>}
  </div>;
}
