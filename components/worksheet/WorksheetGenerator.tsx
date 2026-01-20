"use client";

import * as React from "react";
import { InputPanel, GridSelector, DisplayOptions, ExportPanel } from "@/components/controls";
import { WorksheetPreview } from "./WorksheetPreview";
import { useWorksheetStore } from "@/stores/worksheetStore";

export function WorksheetGenerator() {
  const { config } = useWorksheetStore();

  // Export to PDF
  const handleExportPDF = async () => {
    const previewElement = document.getElementById("worksheet-preview");
    if (!previewElement) return;

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      // Dynamic import for client-side only
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const pdf = new jsPDF({
        orientation: config.orientation,
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const pageElements = Array.from(
        previewElement.querySelectorAll(".worksheet-container")
      );
      const targets = pageElements.length > 0 ? pageElements : [previewElement];

      for (let index = 0; index < targets.length; index += 1) {
        const canvas = await html2canvas(targets[index] as HTMLElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });
        const imgData = canvas.toDataURL("image/png");

        if (index > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      }

      // Save PDF
      pdf.save(`字帖-${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error("Failed to export PDF:", error);
      alert("导出PDF失败，请重试");
    }
  };

  // Export to image
  const handleExportImage = async () => {
    const previewElement = document.getElementById("worksheet-preview");
    if (!previewElement) return;

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(previewElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      // Create download link
      const link = document.createElement("a");
      link.download = `字帖-${new Date().toLocaleDateString()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Failed to export image:", error);
      alert("导出图片失败，请重试");
    }
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  const hasCharacters = config.characters.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      {/* Preview Area - Left Side */}
      <main className="min-h-[600px] overflow-auto">
        <WorksheetPreview />
      </main>

      {/* Control Panel - Right Side */}
      <aside className="space-y-4 no-print order-first lg:order-last">
        {/* Export buttons at top */}
        <ExportPanel
          onExportPDF={handleExportPDF}
          onExportImage={handleExportImage}
          onPrint={handlePrint}
          disabled={!hasCharacters}
        />
        
        {/* Input */}
        <InputPanel />
        
        {/* Display options */}
        <DisplayOptions />
        
        {/* Grid settings */}
        <GridSelector />
      </aside>
    </div>
  );
}
