"use client";

import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useWorksheetStore } from "@/stores/worksheetStore";
import { MM_TO_PX } from "@/lib/worksheetConfig";
import type { DisplayMode, Orientation, PageSize, PinyinPosition } from "@/types";
import { SettingSwitch } from "./SettingSwitch";
import { ColorSettings } from "./ColorSettings";

export function AdvancedSettings() {
  const { config, setConfig, resetConfig } = useWorksheetStore();
  const maxTrace = Math.max(0, config.columnsPerRow - (config.highlightFirst ? 1 : 0) - config.emptyCount);
  const reset = () => {
    const previous = { ...config };
    resetConfig();
    toast("已恢复默认设置", { action: { label: "撤销", onClick: () => setConfig(previous) } });
  };
  return (
    <div className="flex flex-col gap-5">
      <FieldSet>
        <FieldLegend className="sr-only">详细排版设置</FieldLegend>
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="worksheet-title">纸面标题</FieldLabel>
            <Input id="worksheet-title" value={config.title} maxLength={40} placeholder="汉字书写练习"
              onChange={(event) => setConfig({ title: event.target.value })} />
          </Field>
          <SettingSwitch id="worksheet-first" label="首字示范" checked={config.highlightFirst}
            onCheckedChange={(highlightFirst) => setConfig({ highlightFirst })} />
          <Field>
            <div className="flex items-center justify-between gap-3">
              <FieldLabel id="worksheet-trace-label">每行描红数量</FieldLabel>
              <output className="text-sm tabular-nums">{Math.min(config.traceCount, maxTrace)} 个</output>
            </div>
            <Slider aria-labelledby="worksheet-trace-label" min={0} max={Math.max(1, maxTrace)} step={1}
              value={[Math.min(config.traceCount, maxTrace)]} disabled={maxTrace === 0}
              onValueChange={([traceCount]) => setConfig({ traceCount, traceEnabled: traceCount > 0 })} />
          </Field>
          <SettingSwitch id="worksheet-empty-row" label="每字后插入空行" checked={config.insertEmptyRow}
            onCheckedChange={(insertEmptyRow) => setConfig({ insertEmptyRow })} />
          <SettingSwitch id="worksheet-empty-column" label="描红间隔留空" checked={config.insertEmptyColumn}
            onCheckedChange={(insertEmptyColumn) => setConfig({ insertEmptyColumn })} />
          <Field>
            <FieldTitle id="worksheet-mode-label">字形样式</FieldTitle>
            <ToggleGroup type="single" variant="outline" size="sm" value={config.displayMode}
              onValueChange={(value) => { if (value) setConfig({ displayMode: value as DisplayMode }); }}
              aria-labelledby="worksheet-mode-label" className="grid w-full grid-cols-4">
              <ToggleGroupItem value="solid">实心</ToggleGroupItem>
              <ToggleGroupItem value="outline">空心</ToggleGroupItem>
              <ToggleGroupItem value="stroke-order">笔顺</ToggleGroupItem>
              <ToggleGroupItem value="empty">空格</ToggleGroupItem>
            </ToggleGroup>
          </Field>
          <Field>
            <FieldTitle id="worksheet-font-label">练字字体</FieldTitle>
            <ToggleGroup type="single" variant="outline" size="sm" value={config.fontFamily}
              onValueChange={(fontFamily) => { if (fontFamily) setConfig({ fontFamily }); }}
              aria-labelledby="worksheet-font-label" className="w-full">
              <ToggleGroupItem value="kai" className="flex-1">楷体</ToggleGroupItem>
              <ToggleGroupItem value="serif" className="flex-1">宋体</ToggleGroupItem>
              <ToggleGroupItem value="sans" className="flex-1">黑体</ToggleGroupItem>
            </ToggleGroup>
            <FieldDescription>楷体优先使用设备字体；设备未安装时使用本站宋体。</FieldDescription>
          </Field>
          <Field>
            <div className="flex items-center justify-between gap-3">
              <FieldLabel id="worksheet-opacity-label">字形浓度</FieldLabel>
              <output className="text-sm tabular-nums">{Math.round(config.characterOpacity * 100)}%</output>
            </div>
            <Slider aria-labelledby="worksheet-opacity-label" min={0.1} max={1} step={0.1}
              value={[config.characterOpacity]} onValueChange={([characterOpacity]) => setConfig({ characterOpacity })} />
          </Field>
        </FieldGroup>
      </FieldSet>
      <Separator />
      <FieldSet>
        <FieldLegend>汉字资料</FieldLegend>
        <FieldGroup className="gap-2">
          <SettingSwitch id="worksheet-tone" label="标注声调" checked={config.showTone} disabled={!config.showPinyin}
            onCheckedChange={(showTone) => setConfig({ showTone })} />
          <SettingSwitch id="worksheet-radical" label="显示部首" checked={config.showRadical}
            onCheckedChange={(showRadical) => setConfig({ showRadical })} />
          <SettingSwitch id="worksheet-stroke-count" label="显示笔画数" checked={config.showStrokeCount}
            onCheckedChange={(showStrokeCount) => setConfig({ showStrokeCount })} />
          <Field data-disabled={!config.showPinyin || undefined}>
            <FieldTitle id="worksheet-pinyin-position-label">拼音位置</FieldTitle>
            <ToggleGroup type="single" variant="outline" size="sm" value={config.pinyinPosition} disabled={!config.showPinyin}
              onValueChange={(value) => { if (value) setConfig({ pinyinPosition: value as PinyinPosition }); }}
              aria-labelledby="worksheet-pinyin-position-label" className="w-full">
              <ToggleGroupItem value="top" className="flex-1">汉字上方</ToggleGroupItem>
              <ToggleGroupItem value="bottom" className="flex-1">汉字下方</ToggleGroupItem>
            </ToggleGroup>
          </Field>
        </FieldGroup>
      </FieldSet>
      <Separator />
      <FieldSet>
        <FieldLegend>纸张与间距</FieldLegend>
        <FieldGroup className="gap-4">
          <Field>
            <FieldTitle id="worksheet-paper-label">纸张尺寸</FieldTitle>
            <ToggleGroup type="single" variant="outline" size="sm" value={config.pageSize}
              onValueChange={(value) => { if (value) setConfig({ pageSize: value as PageSize }); }}
              aria-labelledby="worksheet-paper-label" className="w-full">
              <ToggleGroupItem value="A4" className="flex-1">A4</ToggleGroupItem>
              <ToggleGroupItem value="A3" className="flex-1">A3</ToggleGroupItem>
              <ToggleGroupItem value="Letter" className="flex-1">Letter</ToggleGroupItem>
            </ToggleGroup>
          </Field>
          <Field>
            <FieldTitle id="worksheet-orientation-label">纸张方向</FieldTitle>
            <ToggleGroup type="single" variant="outline" size="sm" value={config.orientation}
              onValueChange={(value) => { if (value) setConfig({ orientation: value as Orientation }); }}
              aria-labelledby="worksheet-orientation-label" className="w-full">
              <ToggleGroupItem value="portrait" className="flex-1">纵向</ToggleGroupItem>
              <ToggleGroupItem value="landscape" className="flex-1">横向</ToggleGroupItem>
            </ToggleGroup>
          </Field>
          <Field>
            <div className="flex items-center justify-between gap-3">
              <FieldLabel id="worksheet-gap-label">行间距</FieldLabel>
              <output className="text-sm tabular-nums">{config.rowGap} mm</output>
            </div>
            <Slider aria-labelledby="worksheet-gap-label" min={0} max={8} step={0.5}
              value={[config.rowGap]} onValueChange={([rowGap]) => setConfig({ rowGap })} />
          </Field>
          <Field>
            <div className="flex items-center justify-between gap-3">
              <FieldLabel id="worksheet-margin-label">页边距</FieldLabel>
              <output className="text-sm tabular-nums">{(config.pageMargin / MM_TO_PX).toFixed(1)} mm</output>
            </div>
            <Slider aria-labelledby="worksheet-margin-label" min={5} max={25} step={0.5}
              value={[config.pageMargin / MM_TO_PX]} onValueChange={([margin]) => setConfig({ pageMargin: margin * MM_TO_PX })} />
          </Field>
          <Field>
            <div className="flex items-center justify-between gap-3">
              <FieldLabel id="worksheet-linewidth-label">字格线宽</FieldLabel>
              <output className="text-sm tabular-nums">{config.gridLineWidth} px</output>
            </div>
            <Slider aria-labelledby="worksheet-linewidth-label" min={0.2} max={2} step={0.1}
              value={[config.gridLineWidth]} onValueChange={([gridLineWidth]) => setConfig({ gridLineWidth })} />
          </Field>
          <Field>
            <FieldLabel htmlFor="worksheet-max-rows">每页最多行数</FieldLabel>
            <Input id="worksheet-max-rows" type="number" min={0} max={40} step={1} value={config.rowsPerPage}
              onChange={(event) => setConfig({ rowsPerPage: Number(event.target.value) })} aria-describedby="worksheet-max-rows-help" />
            <FieldDescription id="worksheet-max-rows-help">0 表示自动铺满；超出纸张高度时自动分页。</FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>
      <Separator />
      <ColorSettings />
      <Button type="button" variant="ghost" onClick={reset}><RotateCcw data-icon="inline-start" />恢复默认设置</Button>
    </div>
  );
}
