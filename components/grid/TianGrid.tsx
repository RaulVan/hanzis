"use client";

import * as React from "react";
import { CharacterGrid } from "./GridBase";
import { cn } from "@/lib/utils";

interface TianGridProps {
  size?: number;
  lineColor?: string;
  lineWidth?: number;
  borderColor?: string;
  borderWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

// Tian (field) character grid - standard grid with cross lines
export function TianGrid({
  size = 80,
  lineColor = "#cccccc",
  lineWidth = 1,
  borderColor = "#999999",
  borderWidth = 2,
  className,
  children,
}: TianGridProps) {
  return (
    <CharacterGrid
      type="tian"
      size={size}
      lineColor={lineColor}
      lineWidth={lineWidth}
      borderColor={borderColor}
      borderWidth={borderWidth}
      className={cn("tian-grid", className)}
    >
      {children}
    </CharacterGrid>
  );
}
