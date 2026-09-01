import type { WorksheetConfig } from "../types";
import { worksheetCellColor, type WorksheetDocument, type WorksheetRow } from "./worksheetLayout";

export const WORKSHEET_FONTS = {
  kai: 'KaiTi, STKaiti, "Noto Serif SC", Songti SC, SimSun, serif',
  serif: '"Noto Serif SC", Songti SC, SimSun, serif',
  sans: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
} as const;

type Paint = { color: string; opacity?: number };
export type WorksheetDrawingOperation =
  | ({ kind: "line"; x1: number; y1: number; x2: number; y2: number; width: number; dash?: number[] } & Paint)
  | ({ kind: "rect"; x: number; y: number; width: number; height: number; lineWidth: number; fill?: boolean } & Paint)
  | ({ kind: "text"; x: number; y: number; text: string; size: number; font: string; align?: "left" | "center" | "right"; outline?: boolean; maxWidth?: number } & Paint)
  | ({ kind: "path"; path: string; x: number; y: number; size: number } & Paint);

function gridOperations(config: WorksheetConfig, x: number, y: number, size: number): WorksheetDrawingOperation[] {
  const color = config.gridColor;
  const width = config.gridLineWidth;
  const line = (x1: number, y1: number, x2: number, y2: number): WorksheetDrawingOperation =>
    ({ kind: "line", x1, y1, x2, y2, color, width, dash: [3, 3] });
  const operations: WorksheetDrawingOperation[] = [
    { kind: "rect", x, y, width: size, height: size, color, lineWidth: width },
  ];
  if (config.gridType === "tian" || config.gridType === "mi") {
    operations.push(line(x + size / 2, y, x + size / 2, y + size));
    operations.push(line(x, y + size / 2, x + size, y + size / 2));
  }
  if (config.gridType === "mi") {
    operations.push(line(x, y, x + size, y + size));
    operations.push(line(x + size, y, x, y + size));
  }
  if (config.gridType === "huigong") {
    operations.push({ kind: "rect", x: x + size / 4, y: y + size / 4, width: size / 2, height: size / 2, color, lineWidth: width });
  }
  return operations;
}

function drawRow(document: WorksheetDocument, row: WorksheetRow, y: number): WorksheetDrawingOperation[] {
  const { config, cellSize, pinyinHeight, contentWidth, strokeSize, strokeColumns } = document;
  const operations: WorksheetDrawingOperation[] = [];
  const margin = config.pageMargin;
  const hasCharacter = row.character !== null && !row.empty && config.displayMode !== "empty";
  let cursorY = y;
  if (row.strokeHeight) {
    const paths = row.character ? document.strokes[row.character.char] : undefined;
    if (hasCharacter && paths?.length) {
      paths.forEach((_, index) => {
        const x = margin + (index % strokeColumns) * (strokeSize + 4);
        const stepY = cursorY + Math.floor(index / strokeColumns) * (strokeSize + 4);
        for (let strokeIndex = 0; strokeIndex <= index; strokeIndex += 1) {
          operations.push({ kind: "path", path: paths[strokeIndex], x, y: stepY, size: strokeSize, color: config.strokeOrderColor });
        }
      });
    } else if (hasCharacter) {
      operations.push({ kind: "text", text: "暂无笔顺数据", x: margin + 4, y: cursorY + 10, size: 11, font: WORKSHEET_FONTS.sans, color: config.strokeOrderColor });
    }
    cursorY += row.strokeHeight;
  }
  const gridY = cursorY + (config.pinyinPosition === "top" ? pinyinHeight : 0);
  const pinyinY = config.pinyinPosition === "top" ? cursorY : gridY + cellSize;
  for (let column = 0; column < config.columnsPerRow; column += 1) {
    const x = margin + column * cellSize;
    operations.push(...gridOperations(config, x, gridY, cellSize));
    const color = hasCharacter ? worksheetCellColor(config, column) : null;
    if (color && row.character) {
      operations.push({
        kind: "text", text: row.character.char, x: x + cellSize / 2, y: gridY + cellSize * 0.51,
        size: cellSize * 0.76, font: WORKSHEET_FONTS[config.fontFamily as keyof typeof WORKSHEET_FONTS],
        color, opacity: config.characterOpacity, align: "center", outline: config.displayMode === "outline",
      });
    }
    if (pinyinHeight && color && row.character) {
      const text = config.showTone ? row.character.pinyinWithTone : row.character.pinyin;
      if (text && !/\p{Script=Han}/u.test(text)) {
        operations.push({
          kind: "text", text, x: x + cellSize / 2, y: pinyinY + pinyinHeight / 2,
          size: Math.min(14, cellSize * 0.22), font: WORKSHEET_FONTS.sans,
          color: config.pinyinColor, align: "center", maxWidth: cellSize - 4,
        });
      }
    }
  }
  if (pinyinHeight) {
    [0, 1 / 3, 2 / 3, 1].forEach((ratio) => operations.push({
      kind: "line", x1: margin, y1: pinyinY + ratio * pinyinHeight,
      x2: margin + contentWidth, y2: pinyinY + ratio * pinyinHeight,
      color: config.gridColor, width: config.gridLineWidth * 0.6, opacity: 0.65,
      dash: ratio === 0 || ratio === 1 ? undefined : [3, 3],
    }));
  }
  if (document.infoHeight && hasCharacter && row.character) {
    const information: string[] = [];
    if (config.showRadical) information.push(`部首：${row.character.radical || "暂无"}`);
    if (config.showStrokeCount) information.push(`笔画：${row.character.strokeCount || "暂无"}`);
    operations.push({ kind: "text", text: information.join("    "), x: margin + 2,
      y: gridY + cellSize + (config.pinyinPosition === "bottom" ? pinyinHeight : 0) + 10,
      size: 11, font: WORKSHEET_FONTS.sans, color: config.characterColor });
  }
  return operations;
}

export function drawWorksheetPage(document: WorksheetDocument, pageIndex: number): WorksheetDrawingOperation[] {
  const { config, width, height } = document;
  const margin = config.pageMargin;
  const title = config.title.trim() || "汉字书写练习";
  const ink = "#292C26";
  const operations: WorksheetDrawingOperation[] = [
    { kind: "rect", x: 0, y: 0, width, height, color: "#FFFFFF", fill: true, lineWidth: 0 },
    { kind: "text", text: title, x: width / 2, y: margin + 18, size: Math.min(26, document.contentWidth / Math.max(12, Array.from(title).length)), font: WORKSHEET_FONTS.serif, color: ink, align: "center" },
    { kind: "text", text: "姓名：", x: margin + document.contentWidth * 0.2, y: margin + 55, size: 13, font: WORKSHEET_FONTS.sans, color: ink },
    { kind: "line", x1: margin + document.contentWidth * 0.2 + 42, y1: margin + 62, x2: margin + document.contentWidth * 0.2 + 136, y2: margin + 62, color: ink, width: 0.6 },
    { kind: "text", text: "日期：", x: margin + document.contentWidth * 0.64, y: margin + 55, size: 13, font: WORKSHEET_FONTS.sans, color: ink },
    { kind: "line", x1: margin + document.contentWidth * 0.64 + 42, y1: margin + 62, x2: margin + document.contentWidth * 0.64 + 136, y2: margin + 62, color: ink, width: 0.6 },
    { kind: "text", text: "汉字网 · 认真写字，慢慢成长。", x: margin, y: height - margin + 2, size: 10, font: WORKSHEET_FONTS.sans, color: "#62685E" },
    { kind: "text", text: `${pageIndex + 1} / ${document.pages.length}`, x: width - margin, y: height - margin + 2, size: 10, font: WORKSHEET_FONTS.sans, color: "#62685E", align: "right" },
  ];
  let y = document.contentTop;
  for (const row of document.pages[pageIndex] ?? []) {
    operations.push(...drawRow(document, row, y));
    y += row.height + document.rowGap;
  }
  return operations;
}
