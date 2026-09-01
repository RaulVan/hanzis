import assert from "node:assert/strict";
import test from "node:test";
import { defaultWorksheetConfig, type CharacterInfo } from "../types";
import { MAX_WORKSHEET_CHARACTERS, MM_TO_PX } from "../lib/worksheetConfig";
import { createWorksheetDocument, worksheetCellColor } from "../lib/worksheetLayout";
import { drawWorksheetPage } from "../lib/worksheetDrawing";

const character = (char = "春"): CharacterInfo => ({ char, pinyin: "chun", pinyinWithTone: "chūn", tone: 1,
  strokeCount: 9, radical: "日", radicalStrokeCount: 0, struct: "上下结构", strokeOrder: [], strokeNames: [] });

test("the initial poem has exactly twelve columns on one physical A4 page", () => {
  const data = Array.from("春眠不觉晓处处闻啼鸟").map(character);
  const document = createWorksheetDocument(defaultWorksheetConfig, data);
  assert.equal(document.pages.length, 1);
  assert.equal(document.width / MM_TO_PX, 210);
  assert.equal(document.height / MM_TO_PX, 297);
  assert.equal(document.config.columnsPerRow, 12);
  assert.equal(document.pages[0].filter((row) => row.character).length, 10);
});

test("all characters survive multi-page layout in order, with blank practice rows", () => {
  const data = Array.from({ length: 200 }, (_, index) => character(String.fromCodePoint(0x4e00 + index)));
  const document = createWorksheetDocument({ ...defaultWorksheetConfig, characters: data.map((item) => item.char).join(""), insertEmptyRow: true }, data);
  assert.ok(document.pages.length > 1);
  const rows = document.pages.flat();
  assert.deepEqual(rows.filter((row) => row.character).map((row) => row.sourceIndex), Array.from({ length: 200 }, (_, i) => i));
  assert.ok(rows.filter((row) => row.empty).length >= 200);
  for (const page of document.pages) {
    assert.ok(page.reduce((sum, row) => sum + row.height, 0) + (page.length - 1) * document.rowGap <= document.contentHeight + 0.01);
  }
});

test("blank text produces a useful empty sheet and explicit row counts are honored", () => {
  const blank = createWorksheetDocument({ ...defaultWorksheetConfig, characters: "" }, []);
  assert.equal(blank.pages.length, 1);
  assert.ok(blank.pages[0].length > 0);
  assert.ok(blank.pages[0].every((row) => row.empty));
  const bounded = createWorksheetDocument({ ...defaultWorksheetConfig, rowsPerPage: 3 }, Array.from({ length: 8 }, () => character()));
  assert.deepEqual(bounded.pages.map((page) => page.length), [3, 3, 3]);
});

test("long text and excessive pages are explicitly blocked for export", () => {
  const data = Array.from({ length: MAX_WORKSHEET_CHARACTERS + 1 }, () => character());
  const long = createWorksheetDocument({ ...defaultWorksheetConfig, characters: "春".repeat(201) }, data);
  assert.equal(long.characters.length, 200);
  assert.equal(long.exceedsCharacterLimit, true);
  const many = createWorksheetDocument({ ...defaultWorksheetConfig, rowsPerPage: 1 }, data.slice(0, 100));
  assert.equal(many.pages.length, 100);
  assert.equal(many.exceedsPageLimit, true);
});

test("orientation, fractional gaps and dense stroke data never overflow physical page bounds", () => {
  for (const orientation of ["portrait", "landscape"] as const) {
    for (const pageSize of ["A4", "A3", "Letter"] as const) {
      for (const columnsPerRow of [8, 12, 20]) {
        const document = createWorksheetDocument({ ...defaultWorksheetConfig, orientation, pageSize, columnsPerRow,
          rowGap: 2.5, pageMargin: 96, showStrokeOrder: true, showRadical: true, showStrokeCount: true,
        }, Array.from({ length: 20 }, () => character()), { 春: Array.from({ length: 64 }, () => "M 0 0 L 10 10") });
        assert.equal(document.rowGap, 2.5 * MM_TO_PX);
        for (const page of document.pages) {
          assert.ok(page.reduce((sum, row) => sum + row.height, 0) + (page.length - 1) * document.rowGap <= document.contentHeight + 0.01);
        }
      }
    }
  }
});

test("tracing off, outline and blank modes have distinct real drawing output", () => {
  const off = { ...defaultWorksheetConfig, traceEnabled: false };
  assert.equal(worksheetCellColor(off, 0), off.characterColor);
  assert.equal(worksheetCellColor(off, 1), null);
  assert.equal(worksheetCellColor({ ...off, highlightFirst: false }, 0), null);
  assert.equal(worksheetCellColor({ ...off, displayMode: "empty" }, 0), null);
  const outline = createWorksheetDocument({ ...defaultWorksheetConfig, displayMode: "outline" }, [character()]);
  assert.ok(drawWorksheetPage(outline, 0).some((operation) => operation.kind === "text" && operation.text === "春" && operation.outline));
});
