"use client";
import { UiText } from "@/components/i18n/UiText";
import { useTranslate } from "@/components/i18n/LanguageProvider";

import * as React from "react";
import { ChevronDown, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { InputPanel, GridSelector, DisplayOptions, ExportPanel } from "@/components/controls";
import { AdvancedSettings } from "@/components/controls/AdvancedSettings";
import type { WorksheetExportKind } from "@/components/controls/ExportPanel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { createWorksheetDocument } from "@/lib/worksheetLayout";
import { extractWorksheetCharacters, MAX_WORKSHEET_CHARACTERS, MAX_WORKSHEET_PAGES, WORKSHEET_STORAGE_KEY } from "@/lib/worksheetConfig";
import { useWorksheetStore } from "@/stores/worksheetStore";
import { WorksheetPreview } from "./WorksheetPreview";
import { WorksheetImportBanner } from "./WorksheetImportBanner";
import { useWorksheetData } from "./useWorksheetData";
import { WorksheetScenarioControls } from "./WorksheetScenarioControls";
import { worksheetScenarioConfig, type WorksheetScenarioId } from "@/data/worksheetScenarios";

export function WorksheetGenerator({ scenario }: { scenario?: WorksheetScenarioId }) {
  const t = useTranslate();
  const { config, hydrate, hasHydrated, storageError, isComposing, currentPage: savedPage,
    setCurrentPage, setCharacters, setLoading } = useWorksheetStore();
  const [busy, setBusy] = React.useState<WorksheetExportKind | null>(null);
  const [progress, setProgress] = React.useState("");
  const [exportError, setExportError] = React.useState<string | null>(null);
  const [lastExport, setLastExport] = React.useState<WorksheetExportKind>("pdf");
  const busyLock = React.useRef(false);
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const data = useWorksheetData(config, hasHydrated);
  const worksheet = React.useMemo(() => createWorksheetDocument(config, data.characters, data.strokes), [config, data.characters, data.strokes]);
  const currentPage = Math.min(savedPage, worksheet.pages.length - 1);
  const characterCount = extractWorksheetCharacters(config.characters).length;
  const tooLong = characterCount > MAX_WORKSHEET_CHARACTERS;
  const blocked = !data.ready || isComposing || tooLong || worksheet.exceedsPageLimit;

  React.useEffect(() => {
    let firstVisit = false;
    if (scenario && !useWorksheetStore.getState().hasHydrated) {
      try { firstVisit = localStorage.getItem(WORKSHEET_STORAGE_KEY) === null; } catch { /* Preserve in-memory state when storage is unavailable. */ }
    }
    hydrate();
    if (scenario && firstVisit) useWorksheetStore.getState().setConfig(worksheetScenarioConfig(scenario));
  }, [hydrate, scenario]);
  React.useEffect(() => {
    setCharacters(data.characters);
    setLoading(data.pending);
  }, [data.characters, data.pending, setCharacters, setLoading]);
  React.useEffect(() => { if (savedPage !== currentPage) setCurrentPage(currentPage); }, [savedPage, currentPage, setCurrentPage]);

  const exportDocument = async (kind: WorksheetExportKind) => {
    if (busyLock.current || blocked) return;
    busyLock.current = true;
    setBusy(kind);
    setLastExport(kind);
    setExportError(null);
    setProgress("正在加载纸面字体……");
    try {
      const { exportWorksheetPDF, exportWorksheetPNG, printWorksheet } = await import("@/lib/worksheetExport");
      const updateProgress = (completed: number, total: number) => setProgress(`已生成 ${completed} / ${total} 页`);
      if (kind === "pdf") await exportWorksheetPDF(worksheet, updateProgress);
      else if (kind === "png") await exportWorksheetPNG(worksheet, currentPage);
      else await printWorksheet(worksheet, updateProgress);
      toast.success(<UiText>{kind === "print" ? "打印窗口已打开，请核对纸张尺寸" : kind === "pdf" ? `已生成 ${worksheet.pages.length} 页 PDF` : `已导出第 ${currentPage + 1} 页 PNG`}</UiText>);
    } catch (error) {
      const message = error instanceof Error ? error.message : "导出失败，请重试。";
      setExportError(message);
      toast.error(<UiText>{message}</UiText>);
    } finally {
      busyLock.current = false;
      setBusy(null);
      setProgress("");
    }
  };
  const unavailable = data.usingFallback || data.missingStrokes.length > 0 ||
    (config.showPinyin && data.missingAnnotations.length > 0);
  const reason = isComposing ? "请先完成当前汉字输入" : data.pending ? "资料准备完成后即可导出" :
    !data.ready ? "请重新加载字库或使用基础字形" : tooLong ? `请将文字减少到 ${MAX_WORKSHEET_CHARACTERS} 字以内` :
    worksheet.exceedsPageLimit ? `当前为 ${worksheet.pages.length} 页，请减少到 ${MAX_WORKSHEET_PAGES} 页以内` : undefined;

  return (
    <div className="flex min-w-0 flex-col gap-5">
      {scenario ? <WorksheetScenarioControls key={scenario} scenario={scenario} disabled={Boolean(busy) || !hasHydrated || isComposing} /> : null}
      <React.Suspense fallback={null}><WorksheetImportBanner disabled={Boolean(busy)} /></React.Suspense>
      {storageError ? <Alert><AlertTitle><UiText text="本地保存提示" /></AlertTitle><AlertDescription><UiText>{storageError}</UiText></AlertDescription></Alert> : null}
      <div className="lg:hidden"><Button variant="outline" asChild><a href="#worksheet-preview-title"><UiText text="查看预览" /></a></Button></div>
      <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside aria-label={t("字帖设置")} className="no-print min-w-0">
          <Card className="gap-4 py-4">
            <CardHeader className="px-4"><CardTitle><UiText text="练习内容" /></CardTitle><CardDescription className="sr-only"><UiText text="每个汉字练习一行，设置自动保存在本机。" /></CardDescription></CardHeader>
            <CardContent className="px-4">
              <fieldset disabled={Boolean(busy) || !hasHydrated} inert={Boolean(busy) || !hasHydrated} className="flex min-w-0 flex-col gap-3">
                <legend className="sr-only"><UiText text="字帖编辑选项" /></legend>
                <InputPanel />
                <Separator />
                <GridSelector />
                <Separator />
                <DisplayOptions />
                <Separator />
                <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between"><UiText text="更多设置" /><ChevronDown data-icon="inline-end" /></Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4"><AdvancedSettings /></CollapsibleContent>
                </Collapsible>
              </fieldset>
            </CardContent>
            <CardFooter className="px-4">
              <ExportPanel onExportPDF={() => void exportDocument("pdf")} onExportImage={() => void exportDocument("png")}
                onPrint={() => void exportDocument("print")} disabled={blocked} busy={busy} currentPage={currentPage} progress={progress} reason={reason} />
              {exportError ? <Alert variant="destructive"><AlertTitle><UiText text="字帖未能导出" /></AlertTitle><AlertDescription>
                <p><UiText>{exportError}</UiText></p><Button variant="outline" disabled={blocked || Boolean(busy)} onClick={() => void exportDocument(lastExport)}><RefreshCw data-icon="inline-start" /><UiText text="重试" /></Button>
              </AlertDescription></Alert> : null}
            </CardFooter>
          </Card>
        </aside>
        <div className="flex min-w-0 flex-col gap-4">
          {unavailable && data.ready ? <Alert><AlertTitle><UiText>{data.usingFallback ? "正在使用基础字形" : "部分学习资料暂缺"}</UiText></AlertTitle><AlertDescription>
            {data.usingFallback ? <p><UiText text="字库未能加载，已保留字形和字格；本次导出不含拼音、部首或笔顺资料。" /></p> : <>
              {data.missingStrokes.length ? <p><UiText text="以下汉字暂缺笔顺，字形仍可练习：{0}。" values={[data.missingStrokes.join("、")]} /></p> : null}
              {config.showPinyin && data.missingAnnotations.length ? <p><UiText text="以下汉字暂缺拼音，已保留原字：{0}。" values={[data.missingAnnotations.join("、")]} /></p> : null}
            </>}
            <Button variant="outline" size="sm" disabled={Boolean(busy)} onClick={data.retry}><RefreshCw data-icon="inline-start" /><UiText text="重新加载资料" /></Button>
          </AlertDescription></Alert> : null}
          {worksheet.exceedsPageLimit ? <Alert variant="destructive"><AlertTitle><UiText text="页数超出导出上限" /></AlertTitle><AlertDescription>
            <UiText text="当前排版需要 {0} 页。单次最多导出 {1} 页，请增加每行格数、关闭插空行或减少文字。内容未被删除。" values={[worksheet.pages.length, MAX_WORKSHEET_PAGES]} /></AlertDescription></Alert> : null}
          <WorksheetPreview document={worksheet} currentPage={currentPage} onPageChange={setCurrentPage} pending={data.pending}
            ready={data.ready} error={data.message} onRetry={data.retry} onUseBasicCharacters={data.useBasicCharacters} disabled={Boolean(busy)} />
        </div>
      </div>
    </div>
  );
}
