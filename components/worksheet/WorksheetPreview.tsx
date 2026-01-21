"use client";

import * as React from "react";
import { CharacterGrid } from "@/components/grid";
import { useWorksheetStore } from "@/stores/worksheetStore";
import { calculateColumnsPerRow, filterChineseCharacters } from "@/lib/utils";
import { loadCnchar, getCharacterInfo } from "@/lib/cncharHelper";
import type { CharacterInfo } from "@/types";

// A4 dimensions in mm
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

// Convert mm to pixels (at 96 DPI, 1mm = 3.78px)
const MM_TO_PX = 3.78;

type StrokeData = {
  strokes: string[];
};

const strokeDataCache = new Map<string, Promise<StrokeData | null>>();

async function loadStrokeData(char: string): Promise<StrokeData | null> {
  if (strokeDataCache.has(char)) {
    return strokeDataCache.get(char) ?? null;
  }

  const promise: Promise<StrokeData | null> = import("hanzi-writer")
    .then((mod) => mod.default || mod)
    .then((HanziWriter) => HanziWriter.loadCharacterData(char))
    .then((data: unknown) => {
      if (data && typeof data === "object" && "strokes" in data && Array.isArray((data as { strokes: string[] }).strokes)) {
        return { strokes: (data as { strokes: string[] }).strokes };
      }
      return null;
    })
    .catch(() => null);

  strokeDataCache.set(char, promise);
  return promise;
}

function StrokeOrderFanning({
  char,
  size,
  color,
}: {
  char: string;
  size: number;
  color: string;
}) {
  const [strokes, setStrokes] = React.useState<string[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    loadStrokeData(char).then((data) => {
      if (cancelled) return;
      setStrokes(data?.strokes ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [char]);

  if (!strokes || strokes.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {strokes.map((_, index) => {
        const portion = strokes.slice(0, index + 1);
        const transform = `translate(0, ${size}) scale(${size / 1024}, ${-size / 1024})`;
        return (
          <svg
            key={index}
            width={size}
            height={size}
            className="shrink-0"
            viewBox={`0 0 ${size} ${size}`}
          >
            <g transform={transform}>
              {portion.map((path, pathIndex) => (
                <path key={pathIndex} d={path} fill={color} />
              ))}
            </g>
          </svg>
        );
      })}
    </div>
  );
}

export function WorksheetPreview() {
  const { config, characters, setCharacters, setLoading, setCurrentPage } = useWorksheetStore();
  const [isInitialized, setIsInitialized] = React.useState(false);
  const previewRef = React.useRef<HTMLDivElement>(null);

  // Initialize cnchar on mount
  React.useEffect(() => {
    loadCnchar().then(() => {
      setIsInitialized(true);
    });
  }, []);

  // Process characters when input changes
  React.useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const filteredText = filterChineseCharacters(config.characters);
    if (!filteredText) {
      setCharacters([]);
      setCurrentPage(0);
      return;
    }

    setLoading(true);

    // Keep original order and count, cache repeated lookups
    const cache = new Map<string, CharacterInfo>();
    const charInfos: CharacterInfo[] = filteredText.split("").map((char) => {
      const cached = cache.get(char);
      if (cached) return cached;
      const info = getCharacterInfo(char);
      cache.set(char, info);
      return info;
    });

    setCharacters(charInfos);
    setCurrentPage(0);
    setLoading(false);
  }, [config.characters, isInitialized, setCharacters, setLoading, setCurrentPage]);

  // Calculate layout dimensions
  const gridSizePx = config.gridSize * MM_TO_PX;
  const rowGapPx = config.rowGap * MM_TO_PX;
  const pageMarginPx = config.pageMargin;
  
  // Calculate content area dimensions
  const contentHeight = A4_HEIGHT_MM * MM_TO_PX - pageMarginPx * 2;
  // 根据页面宽度与格子大小动态计算每行格子数
  const columnsPerRow = calculateColumnsPerRow({
    gridSizeMm: config.gridSize,
    pageMarginPx,
    pageWidthMm: A4_WIDTH_MM,
    mmToPx: MM_TO_PX,
  });
  const contentWidthPx = A4_WIDTH_MM * MM_TO_PX - pageMarginPx * 2;
  const cellSizePx = contentWidthPx / columnsPerRow;
  const effectiveTraceCount = Math.min(config.traceCount, Math.max(0, columnsPerRow));
  
  // Calculate how many rows fit per page (considering row gap)
  // Add extra buffer (2px per section) to account for borders
  const strokeLineHeight = config.showStrokeOrder ? Math.round(cellSizePx * 0.4) + 2 : 0;
  const pinyinLineHeight = config.showPinyin ? Math.round(cellSizePx * 0.35) + 2 : 0;
  const rowHeight = cellSizePx + rowGapPx + strokeLineHeight + pinyinLineHeight + 2; // extra buffer for row border
  const rowsPerPage = Math.max(1, Math.floor(contentHeight / rowHeight));
  
  // Calculate total rows needed
  const hasCharacters = characters.length > 0;
  const rowsPerChar = config.insertEmptyRow ? 2 : 1;
  const totalCharRows = hasCharacters ? characters.length * rowsPerChar : 0;
  
  // If no characters, show one full page of empty grids
  const totalRows = hasCharacters ? totalCharRows : rowsPerPage;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

  // Get rows for current page
  const getPageRows = (pageIndex: number) => {
    const startRow = pageIndex * rowsPerPage;
    const endRow = Math.min(startRow + rowsPerPage, totalRows);
    const rows: { char: CharacterInfo | null; isEmpty: boolean }[] = [];
    
    if (hasCharacters) {
      for (let i = startRow; i < endRow; i++) {
        if (config.insertEmptyRow) {
          const charIndex = Math.floor(i / 2);
          const isEmptyRow = i % 2 === 1;
          if (charIndex < characters.length) {
            rows.push({
              char: isEmptyRow ? characters[charIndex] : characters[charIndex],
              isEmpty: isEmptyRow,
            });
          }
        } else {
          if (i < characters.length) {
            rows.push({ char: characters[i], isEmpty: false });
          }
        }
      }
    }
    
    // Fill remaining with empty rows (for practice or when no characters)
    while (rows.length < rowsPerPage) {
      rows.push({ char: null, isEmpty: true });
    }
    
    return rows;
  };

  const getPinyinText = (rowChar: CharacterInfo | null) => {
    if (!rowChar) return "";
    return config.showTone ? rowChar.pinyinWithTone : rowChar.pinyin;
  };

  // Wait for cnchar to load
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-gray-400">
        <div className="text-center">
          <p>正在加载...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="worksheet-preview" ref={previewRef}>
      {Array.from({ length: totalPages }).map((_, pageIndex) => {
        const rows = getPageRows(pageIndex);
        return (
          <div
            key={pageIndex}
            className="worksheet-container bg-white shadow-lg mx-auto print:shadow-none page-break-before overflow-hidden"
            style={{
              width: A4_WIDTH_MM * MM_TO_PX,
              height: A4_HEIGHT_MM * MM_TO_PX,
              padding: pageMarginPx,
              boxSizing: "border-box",
            }}
          >
            <div className="space-y-0">
              {rows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex flex-col"
                  style={{
                    marginBottom: rowGapPx,
                    border: `1px solid ${config.gridColor}`,
                    width: contentWidthPx,
                    boxSizing: "border-box",
                  }}
                >
                  {/* Stroke order line */}
                  {config.showStrokeOrder && (
                    <div
                      className="flex items-center"
                      style={{
                        height: strokeLineHeight,
                        borderBottom: `1px solid ${config.gridColor}`,
                        paddingLeft: Math.max(4, gridSizePx * 0.1),
                        width: contentWidthPx,
                        boxSizing: "border-box",
                      }}
                    >
                      {row.char && !row.isEmpty ? (
                        <StrokeOrderFanning
                          char={row.char.char}
                          size={Math.max(12, strokeLineHeight - 2)}
                          color={config.strokeOrderColor}
                        />
                      ) : null}
                    </div>
                  )}

                  {/* Pinyin line */}
                  {config.showPinyin && (
                    <div
                      className="relative flex"
                      style={{
                        height: pinyinLineHeight,
                        width: contentWidthPx,
                        boxSizing: "border-box",
                      }}
                    >
                      {/* Four-line grid: top/bottom + two inner lines */}
                      <div
                        className="absolute inset-x-0"
                        style={{
                          top: 0,
                          borderTop: `1px dashed ${config.gridColor}`,
                        }}
                      />
                      <div
                        className="absolute inset-x-0"
                        style={{
                          bottom: 0,
                          borderBottom: `1px dashed ${config.gridColor}`,
                        }}
                      />
                      <div
                        className="absolute inset-x-0"
                        style={{
                          top: `${(pinyinLineHeight / 3).toFixed(2)}px`,
                          borderTop: `1px dashed ${config.gridColor}`,
                        }}
                      />
                      <div
                        className="absolute inset-x-0"
                        style={{
                          top: `${((pinyinLineHeight * 2) / 3).toFixed(2)}px`,
                          borderTop: `1px dashed ${config.gridColor}`,
                        }}
                      />
                      {Array.from({ length: columnsPerRow }).map((_, colIndex) => (
                        <div
                          key={colIndex}
                          className="relative shrink-0"
                          style={{
                            width: cellSizePx,
                            height: pinyinLineHeight,
                          }}
                        >
                          {row.char && !row.isEmpty ? (
                            <svg
                              width={cellSizePx}
                              height={pinyinLineHeight}
                              viewBox={`0 0 ${cellSizePx} ${pinyinLineHeight}`}
                              className="absolute inset-0"
                            >
                              <text
                                x="50%"
                                y="50%"
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill={config.pinyinColor}
                                fontSize={Math.max(10, cellSizePx * 0.22)}
                                fontFamily="Noto Sans SC, Noto Sans, system-ui, sans-serif"
                              >
                                {getPinyinText(row.char)}
                              </text>
                            </svg>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Grid line */}
                  <div className="flex" style={{ width: contentWidthPx }}>
                    {Array.from({ length: columnsPerRow }).map((_, colIndex) => {
                      const isFirstCell = colIndex === 0;
                      const isTraceCell = config.highlightFirst
                        ? colIndex > 0 && colIndex <= effectiveTraceCount
                        : colIndex >= 0 && colIndex < effectiveTraceCount;
                      const isEmpty = row.isEmpty || !row.char;

                      let displayChar = "";
                      let charColor = "transparent";

                      if (row.char && !isEmpty) {
                        displayChar = row.char.char;
                        if (isFirstCell && config.highlightFirst) {
                          charColor = config.characterColor;
                        } else if (isTraceCell) {
                          charColor = config.traceColor;
                        } else if (isFirstCell && !config.highlightFirst) {
                          charColor = config.traceColor;
                        }
                      }

                      return (
                        <div
                          key={colIndex}
                          className="relative shrink-0"
                          style={{
                            width: cellSizePx,
                            height: cellSizePx,
                          }}
                        >
                          <CharacterGrid
                            type={config.gridType}
                            size={cellSizePx}
                            lineColor={config.gridColor}
                            borderColor={config.gridColor}
                            lineWidth={config.gridLineWidth}
                            borderWidth={config.gridLineWidth}
                          >
                            {displayChar && (
                              <svg
                                width={cellSizePx}
                                height={cellSizePx}
                                viewBox={`0 0 ${cellSizePx} ${cellSizePx}`}
                                className="absolute inset-0"
                              >
                                <text
                                  x="50%"
                                  y="50%"
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                  fill={charColor}
                                  fontSize={cellSizePx * 0.8}
                                  fontFamily="KaiTi, STKaiti, serif"
                                >
                                  {displayChar}
                                </text>
                              </svg>
                            )}
                          </CharacterGrid>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
