"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, CircleAlert, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { WorksheetDocument } from "@/lib/worksheetLayout";
import { WorksheetPageSVG } from "./WorksheetPageSVG";

interface WorksheetPreviewProps {
  document: WorksheetDocument;
  currentPage: number;
  onPageChange: (page: number) => void;
  pending: boolean;
  ready: boolean;
  error: string | null;
  onRetry: () => void;
  onUseBasicCharacters: () => void;
  disabled?: boolean;
}

export function WorksheetPreview({ document, currentPage, onPageChange, pending, ready,
  error, onRetry, onUseBasicCharacters, disabled }: WorksheetPreviewProps) {
  const container = React.useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = React.useState(0);
  React.useEffect(() => {
    const element = container.current;
    if (!element) return;
    const measure = () => setAvailableWidth(element.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const scale = Math.round(Math.min(1, availableWidth / document.width) * 100);
  return (
    <section aria-labelledby="worksheet-preview-title" className="worksheet-stage w-full min-w-0 rounded-xl border border-border bg-muted p-4 sm:p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 id="worksheet-preview-title" className="font-serif text-xl font-medium">字帖预览</h2>
        <div className="flex items-center gap-3 text-sm tabular-nums text-muted-foreground" aria-live="polite">
          <Badge variant="outline">{document.config.pageSize}</Badge>
          <span>{pending ? "排版中" : `共 ${document.pages.length} 页`}</span>
          <span data-preview-scale={scale}>{scale ? `${scale}%` : "适应宽度"}</span>
        </div>
      </div>
      <div ref={container} className="min-w-0" id="worksheet-preview" aria-busy={pending}>
        <div className="mx-auto w-full" style={{ maxWidth: document.width }}>
          {pending ? (
            <div className="relative">
              <Skeleton className="w-full" style={{ aspectRatio: `${document.widthMm} / ${document.heightMm}` }} />
              <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground" role="status">正在准备字帖资料……</p>
            </div>
          ) : error && !ready ? (
            <Empty className="min-h-96">
              <EmptyHeader>
                <EmptyMedia variant="icon"><CircleAlert /></EmptyMedia>
                <EmptyTitle>字库暂时无法加载</EmptyTitle>
                <EmptyDescription>{error}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={onRetry}><RefreshCw data-icon="inline-start" />重新加载</Button>
                <Button variant="outline" onClick={onUseBasicCharacters}>继续使用基础字形</Button>
                <p className="text-xs text-muted-foreground">基础字形不含拼音、部首或笔顺资料，原文与字格会完整保留。</p>
              </EmptyContent>
            </Empty>
          ) : <WorksheetPageSVG document={document} pageIndex={currentPage} />}
        </div>
      </div>
      <div className="mt-5 flex flex-col items-center gap-3">
        {document.pages.length > 1 && ready ? (
          <nav aria-label="字帖分页" className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" size="sm" disabled={disabled || currentPage === 0} onClick={() => onPageChange(currentPage - 1)}><ChevronLeft data-icon="inline-start" />上一页</Button>
            <span className="text-sm tabular-nums" aria-live="polite">第 {currentPage + 1} / {document.pages.length} 页</span>
            <Button variant="outline" size="sm" disabled={disabled || currentPage >= document.pages.length - 1} onClick={() => onPageChange(currentPage + 1)}>下一页<ChevronRight data-icon="inline-end" /></Button>
          </nav>
        ) : null}
        <p className="text-center text-xs text-muted-foreground">{document.characters.length === 0 && ready ? "空白练习纸可直接导出。" : ""}预览适应屏幕宽度，导出保留真实纸张尺寸。</p>
      </div>
    </section>
  );
}
