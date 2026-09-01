import type { CharacterInfo, WorksheetConfig } from "../types";
import { extractWorksheetCharacters, MAX_WORKSHEET_CHARACTERS, MAX_WORKSHEET_PAGES, MM_TO_PX, sanitizeWorksheetConfig } from "./worksheetConfig";

export type WorksheetStrokeMap = Record<string, readonly string[]>;

export interface WorksheetRow {
  character: CharacterInfo | null;
  sourceIndex: number | null;
  empty: boolean;
  height: number;
  strokeHeight: number;
}

export interface WorksheetDocument {
  config: WorksheetConfig;
  characters: CharacterInfo[];
  strokes: WorksheetStrokeMap;
  widthMm: number;
  heightMm: number;
  width: number;
  height: number;
  contentWidth: number;
  contentHeight: number;
  contentTop: number;
  cellSize: number;
  pinyinHeight: number;
  infoHeight: number;
  strokeSize: number;
  strokeColumns: number;
  rowGap: number;
  pages: WorksheetRow[][];
  exceedsPageLimit: boolean;
  exceedsCharacterLimit: boolean;
}

export function worksheetPageSize(config: Pick<WorksheetConfig, "pageSize" | "orientation">) {
  const sizes = { A4: [210, 297], A3: [297, 420], Letter: [215.9, 279.4] } as const;
  const [short, long] = sizes[config.pageSize];
  return config.orientation === "landscape" ? { widthMm: long, heightMm: short } : { widthMm: short, heightMm: long };
}

/** One physical layout feeds the preview, PNG, PDF and printing. No DOM measurements affect pagination. */
export function createWorksheetDocument(
  input: WorksheetConfig,
  characters: CharacterInfo[],
  strokes: WorksheetStrokeMap = {},
): WorksheetDocument {
  const config = sanitizeWorksheetConfig(input);
  const { widthMm, heightMm } = worksheetPageSize(config);
  const width = widthMm * MM_TO_PX;
  const height = heightMm * MM_TO_PX;
  const contentWidth = width - config.pageMargin * 2;
  const contentTop = config.pageMargin + 82;
  const contentHeight = height - contentTop - config.pageMargin - 24;
  const cellSize = contentWidth / config.columnsPerRow;
  const pinyinHeight = config.showPinyin ? Math.max(16, cellSize * 0.28) : 0;
  const infoHeight = config.showRadical || config.showStrokeCount ? 18 : 0;
  const strokeSize = Math.max(16, Math.min(30, cellSize * 0.4));
  const strokeColumns = Math.max(1, Math.floor(contentWidth / (strokeSize + 4)));
  const rowGap = config.rowGap * MM_TO_PX;
  const includeStrokes = config.showStrokeOrder || config.displayMode === "stroke-order";
  const limitedCharacters = characters.slice(0, MAX_WORKSHEET_CHARACTERS);
  const makeRow = (character: CharacterInfo | null, sourceIndex: number | null, empty = false): WorksheetRow => {
    const paths = character && !empty ? strokes[character.char] : undefined;
    const strokeHeight = includeStrokes && character && !empty
      ? paths?.length ? Math.ceil(paths.length / strokeColumns) * (strokeSize + 4) + 4 : 20
      : 0;
    return { character, sourceIndex, empty, strokeHeight, height: cellSize + pinyinHeight + infoHeight + strokeHeight };
  };
  const rows = limitedCharacters.flatMap((character, index) => {
    const row = makeRow(character, index);
    return config.insertEmptyRow ? [row, makeRow(null, null, true)] : [row];
  });
  const pages: WorksheetRow[][] = [[]];
  let usedHeight = 0;
  for (const row of rows) {
    let page = pages[pages.length - 1];
    const gap = page.length > 0 ? rowGap : 0;
    const atRowLimit = config.rowsPerPage > 0 && page.length >= config.rowsPerPage;
    if (page.length > 0 && (usedHeight + gap + row.height > contentHeight + 0.01 || atRowLimit)) {
      page = [];
      pages.push(page);
      usedHeight = 0;
    }
    usedHeight += (page.length ? rowGap : 0) + row.height;
    page.push(row);
  }
  // Fill the last page with useful empty practice rows, including the zero-character case.
  const lastPage = pages[pages.length - 1];
  const emptyRow = makeRow(null, null, true);
  while ((config.rowsPerPage === 0 || lastPage.length < config.rowsPerPage) &&
    usedHeight + (lastPage.length ? rowGap : 0) + emptyRow.height <= contentHeight + 0.01) {
    usedHeight += (lastPage.length ? rowGap : 0) + emptyRow.height;
    lastPage.push({ ...emptyRow });
  }
  return {
    config, characters: limitedCharacters, strokes, widthMm, heightMm, width, height,
    contentWidth, contentHeight, contentTop, cellSize, pinyinHeight, infoHeight,
    strokeSize, strokeColumns, rowGap, pages,
    exceedsPageLimit: pages.length > MAX_WORKSHEET_PAGES,
    exceedsCharacterLimit: characters.length > MAX_WORKSHEET_CHARACTERS || extractWorksheetCharacters(config.characters).length > MAX_WORKSHEET_CHARACTERS,
  };
}

export function worksheetCellColor(config: WorksheetConfig, column: number): string | null {
  if (config.displayMode === "empty") return null;
  if (config.highlightFirst && column === 0) return config.characterColor;
  const firstTraceColumn = config.highlightFirst ? 1 : 0;
  if (!config.traceEnabled || column >= config.columnsPerRow - config.emptyCount) return null;
  if (config.insertEmptyColumn && (column - firstTraceColumn) % 2 === 1) return null;
  return column >= firstTraceColumn && column < firstTraceColumn + config.traceCount ? config.traceColor : null;
}
