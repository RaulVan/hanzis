// Grid types
export type GridType = "tian" | "mi" | "huigong" | "empty";

// Display modes for characters
export type DisplayMode = "solid" | "outline" | "stroke-order" | "empty";

// Page sizes for PDF export
export type PageSize = "A4" | "A3" | "Letter";

// Page orientation
export type Orientation = "portrait" | "landscape";

// Pinyin position
export type PinyinPosition = "top" | "bottom";

// Worksheet configuration
export interface WorksheetConfig {
  // Basic settings
  title: string;
  characters: string;

  // Grid settings
  gridType: GridType;
  gridSize: number; // in mm for print
  gridColor: string;
  gridLineWidth: number;

  // Content settings
  showPinyin: boolean;
  pinyinPosition: PinyinPosition;
  showTone: boolean;
  showStrokeCount: boolean;
  showRadical: boolean;
  showStrokeOrder: boolean;

  // Display settings
  displayMode: DisplayMode;
  characterOpacity: number;
  repeatCount: number; // total cells per row (including first solid char)

  // Style settings
  fontFamily: string;
  characterColor: string;
  pinyinColor: string;
  traceColor: string; // color for traced characters (light red)
  strokeOrderColor: string;

  // Layout settings
  columnsPerRow: number;
  rowsPerPage: number;
  pageSize: PageSize;
  orientation: Orientation;
  rowGap: number; // gap between rows in mm
  pageMargin: number; // page margin in mm

  // New features
  highlightFirst: boolean; // first char is solid black
  traceCount: number; // number of traced (light) characters
  emptyCount: number; // number of empty cells for practice
  insertEmptyRow: boolean; // insert empty row after each char
  insertEmptyColumn: boolean; // reserved for future
}

// Character information from cnchar
export interface CharacterInfo {
  char: string;
  pinyin: string;
  pinyinWithTone: string;
  tone: number;
  strokeCount: number;
  radical: string;
  radicalStrokeCount: number;
  struct: string;
  strokeOrder: string[];
  strokeNames: string[];
}

// Default worksheet configuration
export const defaultWorksheetConfig: WorksheetConfig = {
  title: "",
  characters: "",

  gridType: "tian",
  gridSize: 10, // 10mm per cell
  gridColor: "#af0000",
  gridLineWidth: 1,

  showPinyin: false,
  pinyinPosition: "top",
  showTone: true,
  showStrokeCount: false,
  showRadical: false,
  showStrokeOrder: false,

  displayMode: "solid",
  characterOpacity: 1,
  repeatCount: 14, // total cells per row

  fontFamily: "kai",
  characterColor: "#6b7280",
  pinyinColor: "#d1d5db",
  traceColor: "#d1d5db",
  strokeOrderColor: "#d1d5db",

  columnsPerRow: 14, // matches repeatCount
  rowsPerPage: 10,
  pageSize: "A4",
  orientation: "portrait",
  rowGap: 2, // 2mm gap between rows
  pageMargin: 36, // 36px margins (all sides)

  highlightFirst: true,
  traceCount: 13, // traced characters after first solid
  emptyCount: 0, // empty cells for practice
  insertEmptyRow: false,
  insertEmptyColumn: false,
};

// Grid option for selector
export interface GridOption {
  type: GridType;
  label: string;
  description: string;
}

export const gridOptions: GridOption[] = [
  { type: "tian", label: "田字格", description: "标准田字格，十字分割" },
  { type: "mi", label: "米字格", description: "米字格，含对角线" },
  { type: "huigong", label: "回宫格", description: "回宫格，嵌套框" },
  { type: "empty", label: "空白格", description: "仅边框，无内部线条" },
];
