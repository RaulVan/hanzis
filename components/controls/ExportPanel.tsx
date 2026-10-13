"use client";
import { UiText } from "@/components/i18n/UiText";

import { Download, ImageDown, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export type WorksheetExportKind = "pdf" | "png" | "print";

interface ExportPanelProps {
  onExportPDF: () => void;
  onExportImage: () => void;
  onPrint: () => void;
  disabled?: boolean;
  busy?: WorksheetExportKind | null;
  progress?: string;
  currentPage?: number;
  reason?: string;
}

export function ExportPanel({ onExportPDF, onExportImage, onPrint, disabled = false,
  busy = null, progress = "", currentPage = 0, reason }: ExportPanelProps) {
  return (
    <div className="flex w-full flex-col gap-2" aria-busy={Boolean(busy)}>
      <Button size="lg" onClick={onExportPDF} disabled={disabled || Boolean(busy)}>
        {busy === "pdf" ? <Spinner data-icon="inline-start" /> : <Download data-icon="inline-start" />}
        <UiText>{busy === "pdf" ? "正在生成 PDF" : "导出 PDF"}</UiText>
      </Button>
      <Button variant="outline" size="lg" onClick={onPrint} disabled={disabled || Boolean(busy)}>
        {busy === "print" ? <Spinner data-icon="inline-start" /> : <Printer data-icon="inline-start" />}
        <UiText>{busy === "print" ? "正在准备打印" : "打印字帖"}</UiText>
      </Button>
      <Button variant="ghost" onClick={onExportImage} disabled={disabled || Boolean(busy)}>
        {busy === "png" ? <Spinner data-icon="inline-start" /> : <ImageDown data-icon="inline-start" />}
        <UiText>{busy === "png" ? "正在生成图片" : `导出第 ${currentPage + 1} 页 PNG`}</UiText>
      </Button>
      {busy || reason ? <p className="text-center text-xs text-muted-foreground" role="status"><UiText>{busy ? progress || "正在准备清晰字帖，请稍候……" : reason}</UiText></p> : null}
    </div>
  );
}
