"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useWorksheetStore } from "@/stores/worksheetStore";
import { cn } from "@/lib/utils";

type ColorSelectorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  basePresets: string[];
};

const extendedPresets: string[][] = [
  ["#e5e7eb", "#cbd5e1", "#94a3b8", "#64748b", "#475569", "#111827"],
  ["#fecaca", "#fca5a5", "#f87171", "#ef4444", "#dc2626", "#991b1b"],
  ["#fed7aa", "#fdba74", "#fb923c", "#f97316", "#ea580c", "#9a3412"],
  ["#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#16a34a", "#166534"],
  ["#ddd6fe", "#c4b5fd", "#a78bfa", "#8b5cf6", "#7c3aed", "#5b21b6"],
];

function ColorButton({
  color,
  active,
  onClick,
}: {
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "w-8 h-8 rounded-md border border-gray-200 transition",
        active ? "ring-2 ring-rose-500" : "hover:border-rose-300"
      )}
      style={{ backgroundColor: color }}
      onClick={onClick}
    />
  );
}

function ColorSelector({ label, value, onChange, basePresets }: ColorSelectorProps) {
  const [showMore, setShowMore] = React.useState(false);
  const customInputRef = React.useRef<HTMLInputElement | null>(null);
  const fixedPresets = basePresets.slice(0, 3);
  const [moreColor, setMoreColor] = React.useState(() => {
    return fixedPresets.includes(value) ? extendedPresets[0][0] : value;
  });

  React.useEffect(() => {
    if (!fixedPresets.includes(value)) {
      setMoreColor(value);
    }
  }, [value, fixedPresets]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Label className="w-20 shrink-0">{label}</Label>
        <div className="flex items-center gap-2">
          {fixedPresets.map((preset) => (
            <ColorButton
              key={preset}
              color={preset}
              active={preset.toLowerCase() === value.toLowerCase()}
              onClick={() => onChange(preset)}
            />
          ))}
          <ColorButton
            color={moreColor}
            active={!fixedPresets.includes(value)}
            onClick={() => setShowMore((prev) => !prev)}
          />
        </div>
      </div>

      {showMore && (
        <div className="space-y-2">
          {extendedPresets.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex flex-wrap gap-2">
              {row.map((preset) => (
                <ColorButton
                  key={preset}
                  color={preset}
                  active={preset.toLowerCase() === value.toLowerCase()}
                  onClick={() => {
                    setMoreColor(preset);
                    onChange(preset);
                    setShowMore(false);
                  }}
                />
              ))}
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              ref={customInputRef}
              type="color"
              value={value}
              onChange={(event) => {
                setMoreColor(event.target.value);
                onChange(event.target.value);
                setShowMore(false);
              }}
              className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
            />
            <input
              type="text"
              value={value}
              onChange={(event) => {
                setMoreColor(event.target.value);
                onChange(event.target.value);
                setShowMore(false);
              }}
              className="h-8 px-2 rounded border border-gray-200 text-xs w-24"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function ColorSettings() {
  const {
    config,
    setTraceColor,
    setGridColor,
    setPinyinColor,
    setStrokeOrderColor,
    setCharacterColor,
  } = useWorksheetStore();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">颜色设置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ColorSelector
          label="描字颜色"
          value={config.traceColor}
          onChange={setTraceColor}
          basePresets={["#d1d5db", "#111111", "#fca5a5"]}
        />
        <ColorSelector
          label="首字颜色"
          value={config.characterColor}
          onChange={setCharacterColor}
          basePresets={["#111111", "#6b7280", "#374151"]}
        />
        <ColorSelector
          label="字格线条"
          value={config.gridColor}
          onChange={setGridColor}
          basePresets={["#ef4444", "#111111", "#6b7280"]}
        />
        <ColorSelector
          label="拼音颜色"
          value={config.pinyinColor}
          onChange={setPinyinColor}
          basePresets={["#d1d5db", "#111111", "#fca5a5"]}
        />
        <ColorSelector
          label="笔画顺序"
          value={config.strokeOrderColor}
          onChange={setStrokeOrderColor}
          basePresets={["#d1d5db", "#111111", "#fca5a5"]}
        />
      </CardContent>
    </Card>
  );
}
