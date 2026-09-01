import assert from "node:assert/strict";
import test from "node:test";
import { defaultWorksheetConfig } from "../types";
import {
  extractWorksheetCharacters, restoreWorksheetSettings, sanitizeWorksheetConfig,
  serializeWorksheetSettings, WORKSHEET_STORAGE_VERSION,
} from "../lib/worksheetConfig";

test("source text remains intact while supplementary Unicode Han characters are extracted", () => {
  const source = "春眠，不觉晓。\n𠮷𠀀 A😀 123";
  assert.equal(sanitizeWorksheetConfig({ characters: source }).characters, source);
  assert.deepEqual(extractWorksheetCharacters(source), ["春", "眠", "不", "觉", "晓", "𠮷", "𠀀"]);
});

test("a settings round trip retains user-selected zero tracing and fractional sliders", () => {
  const config = sanitizeWorksheetConfig({
    ...defaultWorksheetConfig, traceCount: 0, traceEnabled: false, rowGap: 2.5,
    gridLineWidth: 0.7, characterOpacity: 0.4, characters: "原文，保留。",
  });
  const restored = restoreWorksheetSettings(serializeWorksheetSettings(config));
  assert.deepEqual(restored.config, config);
  assert.equal(restored.needsBackup, false);
});

test("legacy settings request a backup and preserve valid previous values", () => {
  const legacy = { characters: "旧字帖", showPinyin: false, traceCount: 0,
    gridColor: "#112233", rowGap: 0.5, columnsPerRow: 14, pageMargin: 36 };
  const raw = JSON.stringify({ state: { config: legacy }, version: 0 });
  const restored = restoreWorksheetSettings(raw);
  assert.equal(restored.needsBackup, true);
  for (const [key, value] of Object.entries(legacy)) {
    assert.equal(restored.config[key as keyof typeof restored.config], value);
  }
  assert.equal(restored.config.traceEnabled, false);
  assert.deepEqual(JSON.parse(raw).state.config, legacy);
});

test("malformed input cannot produce unsafe numbers, enums or paint values", () => {
  const result = sanitizeWorksheetConfig({
    columnsPerRow: Infinity, rowGap: NaN, gridLineWidth: -8, pageMargin: 1e8,
    traceCount: -7, gridColor: "url(javascript:alert(1))", characterColor: "#fff",
    showPinyin: "false", gridType: "unknown", orientation: "diagonal",
  });
  assert.equal(result.columnsPerRow, defaultWorksheetConfig.columnsPerRow);
  assert.equal(result.rowGap, defaultWorksheetConfig.rowGap);
  assert.equal(result.gridLineWidth, 0.2);
  assert.equal(result.pageMargin, 96);
  assert.equal(result.traceCount, 0);
  assert.equal(result.gridColor, defaultWorksheetConfig.gridColor);
  assert.equal(result.showPinyin, true);
  assert.equal(result.gridType, "tian");
  assert.equal(result.orientation, "portrait");
});

test("corrupt and future-version storage is rejected instead of overwritten", () => {
  for (const raw of ["not-json", "null", "[]", '{"state":[]}', JSON.stringify({ version: WORKSHEET_STORAGE_VERSION + 1, state: { config: {} } })]) {
    assert.throws(() => restoreWorksheetSettings(raw));
  }
});
