"use client";

import * as React from "react";

interface StrokeFanningProps {
  char: string;
  size?: number;
}

interface StrokeData {
  strokes: string[];
}

// Cache for stroke data
const strokeDataCache = new Map<string, Promise<StrokeData | null>>();

async function loadStrokeData(char: string): Promise<StrokeData | null> {
  if (strokeDataCache.has(char)) {
    return strokeDataCache.get(char) ?? null;
  }

  const promise: Promise<StrokeData | null> = import("hanzi-writer")
    .then((mod) => mod.default || mod)
    .then((HanziWriter) => HanziWriter.loadCharacterData(char))
    .then((data: unknown) => {
      if (
        data &&
        typeof data === "object" &&
        "strokes" in data &&
        Array.isArray((data as { strokes: string[] }).strokes)
      ) {
        return { strokes: (data as { strokes: string[] }).strokes };
      }
      return null;
    })
    .catch(() => null);

  strokeDataCache.set(char, promise);
  return promise;
}

export function StrokeFanning({ char, size = 60 }: StrokeFanningProps) {
  const [strokes, setStrokes] = React.useState<string[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(true);
    setStrokes(null);

    loadStrokeData(char).then((data) => {
      setStrokes(data?.strokes ?? null);
      setIsLoading(false);
    });
  }, [char]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-20 text-gray-400">
        加载中...
      </div>
    );
  }

  if (!strokes || strokes.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-gray-400">
        暂无笔画数据
      </div>
    );
  }

  // Calculate transform for 1024x1024 coordinate system
  const transform = `translate(0, ${size}) scale(${size / 1024}, ${-size / 1024})`;

  return (
    <div className="flex flex-wrap gap-2">
      {strokes.map((_, index) => {
        const portion = strokes.slice(0, index + 1);
        return (
          <div key={index} className="relative">
            {/* Stroke number */}
            <span className="absolute -top-2 -left-1 text-xs text-gray-400 font-medium">
              {index + 1}
            </span>
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="border border-gray-200 rounded bg-white"
            >
              {/* Grid lines */}
              <line
                x1={size / 2}
                y1={0}
                x2={size / 2}
                y2={size}
                stroke="#eee"
                strokeWidth={1}
              />
              <line
                x1={0}
                y1={size / 2}
                x2={size}
                y2={size / 2}
                stroke="#eee"
                strokeWidth={1}
              />
              {/* Character strokes */}
              <g transform={transform}>
                {portion.map((path, pathIndex) => (
                  <path
                    key={pathIndex}
                    d={path}
                    fill={pathIndex === index ? "#ef4444" : "#333"}
                  />
                ))}
              </g>
            </svg>
          </div>
        );
      })}
    </div>
  );
}
