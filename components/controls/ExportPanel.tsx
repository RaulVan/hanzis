"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

interface ExportPanelProps {
  onExportPDF: () => void;
  onExportImage: () => void;
  onPrint: () => void;
  disabled?: boolean;
}

export function ExportPanel({
  onExportPDF,
  onExportImage,
  onPrint,
  disabled = false,
}: ExportPanelProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="flex-1"
        onClick={onExportPDF}
        disabled={disabled}
      >
        <Download className="w-4 h-4 mr-2" />
        导出
      </Button>
      <Button
        className="flex-1"
        onClick={onPrint}
        disabled={disabled}
      >
        <Printer className="w-4 h-4 mr-2" />
        打印
      </Button>
    </div>
  );
}
