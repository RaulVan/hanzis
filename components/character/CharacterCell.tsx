"use client";

import * as React from "react";
import { CharacterGrid } from "@/components/grid";
import { cn } from "@/lib/utils";
import type { GridType, DisplayMode, PinyinPosition } from "@/types";

interface CharacterCellProps {
  char: string;
  pinyin?: string;
  gridType?: GridType;
  gridSize?: number;
  lineColor?: string;
  borderColor?: string;
  showPinyin?: boolean;
  pinyinPosition?: PinyinPosition;
  displayMode?: DisplayMode;
  characterColor?: string;
  pinyinColor?: string;
  characterOpacity?: number;
  strokeCount?: number;
  showStrokeCount?: boolean;
  radical?: string;
  showRadical?: boolean;
  className?: string;
}

export function CharacterCell({
  char,
  pinyin = "",
  gridType = "tian",
  gridSize = 80,
  lineColor = "#cccccc",
  borderColor = "#999999",
  showPinyin = true,
  pinyinPosition = "top",
  displayMode = "solid",
  characterColor = "#333333",
  pinyinColor = "#666666",
  characterOpacity = 1,
  strokeCount,
  showStrokeCount = false,
  radical,
  showRadical = false,
  className,
}: CharacterCellProps) {
  // Calculate pinyin area height
  const pinyinHeight = showPinyin ? 24 : 0;
  const infoHeight = (showStrokeCount || showRadical) ? 18 : 0;

  // Determine character style based on display mode
  const getCharacterStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      fontSize: gridSize * 0.75,
      lineHeight: 1,
      color: characterColor,
      fontFamily: "KaiTi, SimKai, STKaiti, serif",
    };

    switch (displayMode) {
      case "outline":
        return {
          ...baseStyle,
          opacity: 0.2,
        };
      case "empty":
        return {
          ...baseStyle,
          opacity: 0,
        };
      case "stroke-order":
      case "solid":
      default:
        return {
          ...baseStyle,
          opacity: characterOpacity,
        };
    }
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* Pinyin at top */}
      {showPinyin && pinyinPosition === "top" && (
        <div
          className="text-center font-sans"
          style={{
            height: pinyinHeight,
            fontSize: 14,
            color: pinyinColor,
            lineHeight: `${pinyinHeight}px`,
          }}
        >
          {pinyin}
        </div>
      )}

      {/* Character grid */}
      <CharacterGrid
        type={gridType}
        size={gridSize}
        lineColor={lineColor}
        borderColor={borderColor}
      >
        {/* Character */}
        <div
          className="absolute inset-0 flex items-center justify-center select-none"
          style={getCharacterStyle()}
        >
          {char}
        </div>
      </CharacterGrid>

      {/* Pinyin at bottom */}
      {showPinyin && pinyinPosition === "bottom" && (
        <div
          className="text-center font-sans"
          style={{
            height: pinyinHeight,
            fontSize: 14,
            color: pinyinColor,
            lineHeight: `${pinyinHeight}px`,
          }}
        >
          {pinyin}
        </div>
      )}

      {/* Info row (stroke count, radical) */}
      {(showStrokeCount || showRadical) && (
        <div
          className="flex justify-center gap-2 text-xs text-gray-500"
          style={{ height: infoHeight }}
        >
          {showStrokeCount && strokeCount !== undefined && (
            <span>{strokeCount}画</span>
          )}
          {showRadical && radical && (
            <span>部首: {radical}</span>
          )}
        </div>
      )}
    </div>
  );
}
