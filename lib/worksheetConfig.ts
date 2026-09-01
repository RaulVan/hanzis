import { defaultWorksheetConfig, type WorksheetConfig } from "../types";

export const WORKSHEET_STORAGE_KEY = "hanzis-worksheet-settings";
export const WORKSHEET_STORAGE_VERSION = 2;
export const MAX_WORKSHEET_CHARACTERS = 200;
export const MAX_WORKSHEET_PAGES = 40;
export const MAX_WORKSHEET_INPUT_LENGTH = 10000;
export const MM_TO_PX = 96 / 25.4;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function numberInRange(value: unknown, fallback: number, min: number, max: number, integer = false) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  const bounded = Math.min(max, Math.max(min, value));
  return integer ? Math.round(bounded) : Number(bounded.toFixed(4));
}

function choice<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return typeof value === "string" && options.includes(value as T) ? (value as T) : fallback;
}

export function isWorksheetColor(value: unknown): value is string {
  return typeof value === "string" && /^#[\da-f]{6}$/i.test(value);
}

/** Keep source punctuation and line breaks; only the generated document extracts Han characters. */
export function extractWorksheetCharacters(text: string): string[] {
  return Array.from(text).filter((character) => /\p{Script=Han}/u.test(character));
}

export function sanitizeWorksheetConfig(value: unknown): WorksheetConfig {
  const source = isRecord(value) ? value : {};
  const config = { ...defaultWorksheetConfig };
  for (const key of Object.keys(config) as (keyof WorksheetConfig)[]) {
    if (typeof config[key] === "boolean" && typeof source[key] === "boolean") {
      Object.assign(config, { [key]: source[key] });
    }
  }
  config.title = typeof source.title === "string" ? Array.from(source.title).slice(0, 40).join("") : config.title;
  config.characters = typeof source.characters === "string"
    ? Array.from(source.characters).slice(0, MAX_WORKSHEET_INPUT_LENGTH).join("") : config.characters;
  config.gridType = choice(source.gridType, ["tian", "mi", "huigong", "empty"], config.gridType);
  config.displayMode = choice(source.displayMode, ["solid", "outline", "stroke-order", "empty"], config.displayMode);
  config.pinyinPosition = choice(source.pinyinPosition, ["top", "bottom"], config.pinyinPosition);
  config.orientation = choice(source.orientation, ["portrait", "landscape"], config.orientation);
  config.pageSize = choice(source.pageSize, ["A4", "A3", "Letter"], config.pageSize);
  config.fontFamily = choice(source.fontFamily, ["kai", "serif", "sans"], config.fontFamily);
  const ranges = {
    gridSize: [5, 40, false], gridLineWidth: [0.2, 2, false],
    characterOpacity: [0.1, 1, false], repeatCount: [8, 20, true],
    columnsPerRow: [8, 20, true], rowsPerPage: [0, 40, true],
    rowGap: [0, 8, false], pageMargin: [16, 96, false],
    traceCount: [0, 20, true], emptyCount: [0, 19, true],
  } as const;
  for (const key of Object.keys(ranges) as (keyof typeof ranges)[]) {
    const [min, max, integer] = ranges[key];
    config[key] = numberInRange(source[key], config[key], min, max, integer);
  }
  for (const key of ["gridColor", "characterColor", "pinyinColor", "traceColor", "strokeOrderColor"] as const) {
    if (isWorksheetColor(source[key])) config[key] = source[key];
  }
  if (typeof source.traceEnabled !== "boolean" && typeof source.traceCount === "number") {
    config.traceEnabled = source.traceCount > 0;
  }
  return config;
}

export interface RestoredWorksheetSettings {
  config: WorksheetConfig;
  needsBackup: boolean;
}

export function restoreWorksheetSettings(raw: string): RestoredWorksheetSettings {
  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed) || !isRecord(parsed.state) || !isRecord(parsed.state.config)) {
    throw new Error("Saved worksheet settings have an unsupported structure.");
  }
  if (typeof parsed.version === "number" && parsed.version > WORKSHEET_STORAGE_VERSION) {
    throw new Error("Saved worksheet settings use a newer version.");
  }
  const source = parsed.state.config;
  const config = sanitizeWorksheetConfig(source);
  return {
    config,
    needsBackup: parsed.version !== WORKSHEET_STORAGE_VERSION ||
      Object.keys(config).some((key) => config[key as keyof WorksheetConfig] !== source[key]),
  };
}

export function serializeWorksheetSettings(config: WorksheetConfig): string {
  return JSON.stringify({ state: { config }, version: WORKSHEET_STORAGE_VERSION });
}
