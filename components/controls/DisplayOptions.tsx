"use client";

import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { useWorksheetStore } from "@/stores/worksheetStore";
import { SettingSwitch } from "./SettingSwitch";

export function DisplayOptions() {
  const { config, setConfig, setShowPinyin, setShowStrokeOrder } = useWorksheetStore();
  return (
    <FieldSet className="gap-0">
      <FieldLegend className="sr-only">标注与练习</FieldLegend>
      <FieldGroup className="gap-0">
        <SettingSwitch id="worksheet-pinyin" label="拼音标注" checked={config.showPinyin} onCheckedChange={setShowPinyin} />
        <SettingSwitch id="worksheet-strokes" label="笔顺分解" checked={config.showStrokeOrder || config.displayMode === "stroke-order"}
          onCheckedChange={(showStrokeOrder) => {
            setShowStrokeOrder(showStrokeOrder);
            if (!showStrokeOrder && config.displayMode === "stroke-order") setConfig({ displayMode: "solid" });
          }} />
        <SettingSwitch id="worksheet-tracing" label="描红练习" checked={config.traceEnabled && config.traceCount > 0}
          onCheckedChange={(traceEnabled) => setConfig({ traceEnabled,
            traceCount: traceEnabled && config.traceCount === 0 ? config.columnsPerRow - (config.highlightFirst ? 1 : 0) : config.traceCount,
          })} />
      </FieldGroup>
    </FieldSet>
  );
}
