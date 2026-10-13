import test from "node:test";
import assert from "node:assert/strict";
import { worksheetScenarioConfig, worksheetScenarioIds, worksheetScenarioSample, worksheetPoems } from "../data/worksheetScenarios";
import { extractWorksheetCharacters, MAX_WORKSHEET_CHARACTERS } from "../lib/worksheetConfig";
import { drawWorksheetPage } from "../lib/worksheetDrawing";

test("scenario samples use export layout with printable A4 bounds and aligned readings", () => {
  for (const id of worksheetScenarioIds) {
    const doc = worksheetScenarioSample(id);
    assert.deepEqual([doc.widthMm, doc.heightMm], [210, 297]);
    assert.equal(doc.exceedsPageLimit, false);
    assert.equal(doc.exceedsCharacterLimit, false);
    assert.ok(doc.characters.every(character => character.pinyin && character.pinyinWithTone));
    const operations = drawWorksheetPage(doc, 0);
    assert.ok(operations.some(operation => operation.kind === "text"));
    for (const operation of operations) {
      if (operation.kind === "text") {
        assert.ok(operation.x >= 0 && operation.x <= doc.width);
        assert.ok(operation.y >= 0 && operation.y <= doc.height);
      }
    }
  }
});

test("all five poetry presets preserve the entire source text and stay under input limits", () => {
  assert.equal(worksheetPoems.length, 5);
  for (const poem of worksheetPoems) {
    const config = worksheetScenarioConfig("poetry", poem.slug);
    assert.equal(config.characters, poem.lines.map(line => line.text).join("\n"));
    assert.equal(config.title, poem.title);
    assert.ok(extractWorksheetCharacters(config.characters).length <= MAX_WORKSHEET_CHARACTERS);
  }
});
