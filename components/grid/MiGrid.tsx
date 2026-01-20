"use client";

import * as React from "react";
import { CharacterGrid } from "./GridBase";
import { cn } from "@/lib/utils";

interface MiGridProps {
  size?: number;
  lineColor?: string;
  lineWidth?: number;
  borderColor?: string;
  borderWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

// Mi (rice) character grid - grid with cross and diagonal lines
export function MiGrid({
  size = 80,
  lineColor = "#cccccc",
  lineWidth = 1,
  borderColor = "#999999",
  borderWidth = 2,
  className,
  children,
}: MiGridProps) {
  return (
    <CharacterGrid
      type="mi"
      size={size}
      lineColor={lineColor}
      lineWidth={lineWidth}
      borderColor={borderColor}
      borderWidth={borderWidth}
      className={cn("mi-grid", className)}
    >
      {children}
    </CharacterGrid>
  );
}
