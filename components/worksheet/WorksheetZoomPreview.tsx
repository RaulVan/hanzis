"use client";

import { useRef, useState } from "react";
import { Expand, Minus, Plus } from "lucide-react";
import { UiText } from "@/components/i18n/UiText";
import { useTranslate } from "@/components/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { WorksheetDocument } from "@/lib/worksheetLayout";
import { WorksheetPageSVG } from "./WorksheetPageSVG";

export function WorksheetZoomPreview({ document, currentPage, onPageChange, disabled }: {
  document: WorksheetDocument;
  currentPage: number;
  onPageChange: (page: number) => void;
  disabled: boolean;
}) {
  const t = useTranslate();
  const [zoom, setZoom] = useState(100);
  const [fit, setFit] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);
  function adjustZoom(delta: number) {
    const current = fit && viewport.current ? (viewport.current.clientWidth - 24) / document.width * 100 : zoom;
    setZoom(Math.max(25, Math.min(200, Math.round(current + delta))));
    setFit(false);
  }
  return <Dialog onOpenChange={open => { if (open) { setZoom(100); setFit(false); } }}>
    <DialogTrigger asChild><Button variant="outline" size="sm" disabled={disabled}><Expand aria-hidden="true" /><UiText text="放大预览" /></Button></DialogTrigger>
    <DialogContent className="h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden p-4 sm:max-w-[1200px] sm:p-6">
      <DialogHeader className="pr-10 text-left">
        <DialogTitle><UiText text="字帖大图预览" /></DialogTitle>
        <DialogDescription><UiText text="放大检查拼音、描红和笔顺；可横向、纵向滚动，导出尺寸不变。" /></DialogDescription>
      </DialogHeader>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="icon" aria-label={t("缩小预览")} disabled={!fit && zoom <= 25} onClick={() => adjustZoom(-25)}><Minus aria-hidden="true" /></Button>
        <span className="min-w-12 text-center text-sm tabular-nums" role="status"><UiText>{fit ? "适应宽度" : `${zoom}%`}</UiText></span>
        <Button variant="outline" size="icon" aria-label={t("放大预览比例")} disabled={!fit && zoom >= 200} onClick={() => adjustZoom(25)}><Plus aria-hidden="true" /></Button>
        <Button variant="outline" aria-pressed={fit} onClick={() => setFit(true)}><UiText text="适应宽度" /></Button>
        {document.pages.length > 1 && <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" disabled={disabled || currentPage === 0} onClick={() => onPageChange(currentPage - 1)}><UiText text="上一页" /></Button>
          <span className="text-sm"><UiText text="第 {0} / {1} 页" values={[currentPage + 1, document.pages.length]} /></span>
          <Button variant="outline" disabled={disabled || currentPage === document.pages.length - 1} onClick={() => onPageChange(currentPage + 1)}><UiText text="下一页" /></Button>
        </div>}
      </div>
      <div ref={viewport} role="region" aria-label={t("可滚动的字帖大图")} tabIndex={0} className="min-h-0 min-w-0 overflow-auto rounded-lg bg-muted p-3">
        <div className="mx-auto bg-white" style={{ width: fit ? "100%" : document.width * zoom / 100 }}><WorksheetPageSVG document={document} pageIndex={currentPage} /></div>
      </div>
    </DialogContent>
  </Dialog>;
}
