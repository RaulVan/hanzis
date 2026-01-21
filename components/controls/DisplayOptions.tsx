"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useWorksheetStore } from "@/stores/worksheetStore";
import { calculateColumnsPerRow, cn } from "@/lib/utils";

interface CheckOptionProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function CheckOption({ label, checked, onChange }: CheckOptionProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors w-full justify-start",
        checked
          ? "border-rose-500 bg-rose-50"
          : "border-gray-200 hover:border-rose-300"
      )}
    >
      <div
        className={cn(
          "w-4 h-4 rounded border flex items-center justify-center text-xs",
          checked
            ? "border-rose-500 bg-rose-500 text-white"
            : "border-gray-400"
        )}
      >
        {checked && "✓"}
      </div>
      {label}
    </button>
  );
}

export function DisplayOptions() {
  const {
    config,
    setShowPinyin,
    setShowTone,
    setShowStrokeCount,
    setShowRadical,
    setShowStrokeOrder,
    setHighlightFirst,
    setInsertEmptyRow,
    setTraceCount,
  } = useWorksheetStore();

  const columnsPerRow = calculateColumnsPerRow({
    gridSizeMm: config.gridSize,
    pageMarginPx: config.pageMargin,
  });
  const maxTraceCount = Math.max(0, columnsPerRow);
  const traceCountValue = Math.min(config.traceCount, maxTraceCount);
  const hasInitializedRef = React.useRef(false);

  React.useEffect(() => {
    if (!hasInitializedRef.current) {
      setTraceCount(maxTraceCount);
      hasInitializedRef.current = true;
      return;
    }

    if (config.traceCount > maxTraceCount) {
      setTraceCount(maxTraceCount);
    }
  }, [config.traceCount, maxTraceCount, setTraceCount]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">显示选项</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle options */}
        <div className="space-y-2">
          <CheckOption
            label="显示笔顺"
            checked={config.showStrokeOrder}
            onChange={setShowStrokeOrder}
          />
          <CheckOption
            label="显示拼音"
            checked={config.showPinyin}
            onChange={setShowPinyin}
          />
          <CheckOption
            label="首字高亮"
            checked={config.highlightFirst}
            onChange={setHighlightFirst}
          />
          <CheckOption
            label="插入空行"
            checked={config.insertEmptyRow}
            onChange={setInsertEmptyRow}
          />
        </div>

        {/* Trace count slider */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>描红数量</Label>
            <span className="text-xs text-gray-500">
              {config.traceCount}
            </span>
          </div>
          <Slider
            value={[traceCountValue]}
            onValueChange={([value]) => setTraceCount(value)}
            min={0}
            max={maxTraceCount}
            step={1}
          />
        </div>

        
      </CardContent>
    </Card>
  );
}
