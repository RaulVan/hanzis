"use client";

import { useState } from "react";
import Link from "next/link";
import { UiText } from "@/components/i18n/UiText";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { worksheetPoems, worksheetScenarioConfig, type WorksheetScenarioId } from "@/data/worksheetScenarios";
import { useWorksheetStore } from "@/stores/worksheetStore";
import type { WorksheetConfig } from "@/types";

export function WorksheetScenarioControls({ scenario, disabled }: { scenario: WorksheetScenarioId; disabled: boolean }) {
  const [poemSlug, setPoemSlug] = useState(worksheetPoems[0].slug);
  const [previous, setPrevious] = useState<{ config: WorksheetConfig; page: number } | null>(null);
  const [applied, setApplied] = useState(false);
  const apply = () => {
    const state = useWorksheetStore.getState();
    setPrevious({ config: { ...state.config }, page: state.currentPage });
    state.setConfig(worksheetScenarioConfig(scenario, poemSlug));
    state.setCurrentPage(0);
    setApplied(true);
  };
  return <Alert className="no-print">
    <AlertTitle><UiText text="场景预设" /></AlertTitle>
    <AlertDescription className="space-y-3">
      <p><UiText text="首次使用会加载本页预设；已有内容与设置保持不变。应用预设将替换文字、标题和排版设置，可以撤销。" /></p>
      {scenario === "poetry" ? <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="worksheet-poem"><UiText text="选择练习古诗" /></label>
        <select id="worksheet-poem" value={poemSlug} disabled={disabled} onChange={event => setPoemSlug(event.target.value)} className="min-h-11 max-w-full rounded-md border border-input bg-background px-3 text-foreground">
          {worksheetPoems.map(poem => <option key={poem.slug} value={poem.slug}>{poem.title} · {poem.author}</option>)}
        </select>
        <Link href={`/poetry/${poemSlug}/`} className="inline-flex min-h-11 items-center text-primary underline underline-offset-4"><UiText text="阅读所选古诗" /></Link>
      </div> : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={disabled} onClick={apply}><UiText text="应用场景预设" /></Button>
        {previous ? <Button variant="outline" disabled={disabled} onClick={() => {
          const state = useWorksheetStore.getState();
          state.setConfig(previous.config); state.setCurrentPage(previous.page); setPrevious(null); setApplied(false);
        }}><UiText text="撤销预设" /></Button> : null}
        {applied ? <span role="status"><UiText text="已应用，可继续编辑下方设置。" /></span> : null}
      </div>
    </AlertDescription>
  </Alert>;
}
