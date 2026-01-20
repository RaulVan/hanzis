"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useWorksheetStore } from "@/stores/worksheetStore";
import { gridOptions, type GridType } from "@/types";
import { cn } from "@/lib/utils";

// Grid type preview icons
function GridPreview({ type, selected }: { type: GridType; selected: boolean }) {
  const size = 40;
  const center = size / 2;

  return (
    <svg
      width={size}
      height={size}
      className={cn(
        "border-2 rounded transition-colors",
        selected ? "border-rose-500" : "border-gray-200"
      )}
    >
      {/* Border */}
      <rect
        x={1}
        y={1}
        width={size - 2}
        height={size - 2}
        fill="white"
        stroke="#999"
        strokeWidth={1}
      />

      {/* Grid lines based on type */}
      {(type === "tian" || type === "mi") && (
        <>
          <line
            x1={center}
            y1={2}
            x2={center}
            y2={size - 2}
            stroke="#ccc"
            strokeWidth={1}
          />
          <line
            x1={2}
            y1={center}
            x2={size - 2}
            y2={center}
            stroke="#ccc"
            strokeWidth={1}
          />
        </>
      )}

      {type === "mi" && (
        <>
          <line
            x1={2}
            y1={2}
            x2={size - 2}
            y2={size - 2}
            stroke="#ccc"
            strokeWidth={1}
            strokeDasharray="2,2"
          />
          <line
            x1={size - 2}
            y1={2}
            x2={2}
            y2={size - 2}
            stroke="#ccc"
            strokeWidth={1}
            strokeDasharray="2,2"
          />
        </>
      )}

      {type === "huigong" && (
        <rect
          x={size * 0.25}
          y={size * 0.25}
          width={size * 0.5}
          height={size * 0.5}
          fill="none"
          stroke="#ccc"
          strokeWidth={1}
        />
      )}
    </svg>
  );
}

export function GridSelector() {
  const { config, setGridType, setGridSize, setRowGap } =
    useWorksheetStore();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">方格设置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grid type selection */}
        <div className="space-y-2">
          <Label>方格类型</Label>
          <div className="grid grid-cols-4 gap-2">
            {gridOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => setGridType(option.type)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-md border transition-colors",
                  config.gridType === option.type
                    ? "border-rose-500 bg-rose-50"
                    : "border-gray-200 hover:border-rose-300"
                )}
              >
                <GridPreview
                  type={option.type}
                  selected={config.gridType === option.type}
                />
                <span className="text-xs">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid size (in mm) */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>方格大小</Label>
            <span className="text-xs text-gray-500">
              {config.gridSize}mm
            </span>
          </div>
          <Slider
            value={[config.gridSize]}
            onValueChange={([value]) => setGridSize(value)}
            min={8}
            max={20}
            step={0.5}
          />
        </div>

        {/* Row gap */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>行间距</Label>
            <span className="text-xs text-gray-500">
              {config.rowGap}mm
            </span>
          </div>
          <Slider
            value={[config.rowGap]}
            onValueChange={([value]) => setRowGap(value)}
            min={0}
            max={5}
            step={0.5}
          />
        </div>
      </CardContent>
    </Card>
  );
}
