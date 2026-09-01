"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { GridType } from "@/types";

interface GridBaseProps {
  size: number;
  lineColor?: string;
  lineWidth?: number;
  borderColor?: string;
  borderWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

// Base grid component with outer border only
export function GridBase({
  size,
  borderColor = "#999999",
  borderWidth = 2,
  className,
  children,
}: GridBaseProps) {
  return (
    <span
      className={cn("relative block bg-card", className)}
      style={{
        width: size,
        height: size,
        boxSizing: "border-box",
        border: `${borderWidth}px solid ${borderColor}`,
      }}
    >
      {children}
    </span>
  );
}

interface GridLinesProps {
  type: GridType;
  size: number;
  lineColor?: string;
  lineWidth?: number;
}

// Grid lines SVG component
export function GridLines({
  type,
  size,
  lineColor = "#cccccc",
  lineWidth = 1,
}: GridLinesProps) {
  const center = size / 2;

  if (type === "empty") {
    return null;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="pointer-events-none absolute inset-0 size-full"
      style={{ top: 0, left: 0 }}
    >
      {/* Tian grid: horizontal and vertical center lines */}
      {(type === "tian" || type === "mi") && (
        <>
          {/* Horizontal center line */}
          <line
            x1={0}
            y1={center}
            x2={size}
            y2={center}
            stroke={lineColor}
            strokeWidth={lineWidth}
            strokeDasharray="3,3"
          />
          {/* Vertical center line */}
          <line
            x1={center}
            y1={0}
            x2={center}
            y2={size}
            stroke={lineColor}
            strokeWidth={lineWidth}
            strokeDasharray="3,3"
          />
        </>
      )}

      {/* Mi grid: diagonal lines */}
      {type === "mi" && (
        <>
          {/* Diagonal: top-left to bottom-right */}
          <line
            x1={0}
            y1={0}
            x2={size}
            y2={size}
            stroke={lineColor}
            strokeWidth={lineWidth}
            strokeDasharray="4,4"
          />
          {/* Diagonal: top-right to bottom-left */}
          <line
            x1={size}
            y1={0}
            x2={0}
            y2={size}
            stroke={lineColor}
            strokeWidth={lineWidth}
            strokeDasharray="4,4"
          />
        </>
      )}

      {/* Huigong grid: inner rectangle */}
      {type === "huigong" && (
        <rect
          x={size * 0.25}
          y={size * 0.25}
          width={size * 0.5}
          height={size * 0.5}
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
        />
      )}
    </svg>
  );
}

interface CharacterGridProps {
  type: GridType;
  size: number;
  lineColor?: string;
  lineWidth?: number;
  borderColor?: string;
  borderWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

// Combined character grid component
export function CharacterGrid({
  type,
  size,
  lineColor = "#cccccc",
  lineWidth = 1,
  borderColor = "#999999",
  borderWidth = 2,
  className,
  children,
}: CharacterGridProps) {
  return (
    <GridBase
      size={size}
      lineColor={lineColor}
      lineWidth={lineWidth}
      borderColor={borderColor}
      borderWidth={borderWidth}
      className={className}
    >
      <GridLines
        type={type}
        size={size}
        lineColor={lineColor}
        lineWidth={lineWidth}
      />
      {children}
    </GridBase>
  );
}
