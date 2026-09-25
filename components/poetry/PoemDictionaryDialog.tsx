"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DictionaryDetail } from "@/components/dictionary/DictionaryDetail";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function PoemDictionaryDialog({ character, trigger, onClose }: { character: string; trigger: HTMLElement | null; onClose: () => void }) {
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="flex max-h-[min(80dvh,760px)] flex-col gap-0 overflow-hidden rounded-2xl bg-card p-0 sm:max-w-xl" onCloseAutoFocus={event => { event.preventDefault(); if (trigger?.isConnected) trigger.focus({ preventScroll: true }); }}>
      <DialogHeader className="shrink-0 border-b border-border px-5 py-5 pr-14 text-left sm:px-6"><DialogTitle>“{character}”的字典</DialogTitle><DialogDescription>查看读音与释义，关闭后继续读诗。</DialogDescription></DialogHeader>
      <div className="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6"><DictionaryDetail key={character} term={character} preview /></div>
      <DialogFooter className="shrink-0 flex-row items-center justify-end gap-3 border-t border-border bg-muted/50 px-5 py-4 sm:px-6">
        <DialogClose asChild><Button variant="outline">继续读诗</Button></DialogClose>
        <Button asChild><Link href={`/dictionary/?q=${encodeURIComponent(character)}`}>显示详细<ArrowUpRight aria-hidden="true" /></Link></Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
