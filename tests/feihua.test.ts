import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { gunzipSync } from "node:zlib";
import feihuaJson from "../data/feihuaLines.json";
import {
  chooseFeihuaOption,
  createFeihuaState,
  currentFeihuaQuestion,
  describeFeihuaFeedback,
  FEIHUA_OPTION_COUNT,
  FEIHUA_ROUND_LINES,
  feihuaBlankCount,
  feihuaLinesFor,
  feihuaWorkHref,
  getFeihuaStars,
  isFeihuaComplete,
  nextFeihuaLine,
  type FeihuaState,
} from "../lib/feihua";
import { emptyFeihuaProgress, parseFeihuaProgress, recordFeihuaRound } from "../lib/feihuaProgress";
import type { FeihuaData, FeihuaTier } from "../lib/feihuaTypes";
import { buildFeihuaData, FEIHUA_KEYS } from "../scripts/prepare-feihua";

const data = feihuaJson as FeihuaData;
const tiers: FeihuaTier[] = ["basic", "advanced"];

function correctChar(state: FeihuaState) {
  const question = currentFeihuaQuestion(state)!;
  return [...question.line.text][question.blanks[state.filled]];
}

test("the committed bank is exactly what the generator produces from the verified snapshot", () => {
  const manifest = JSON.parse(readFileSync(new URL("../data/haitang-manifest.json", import.meta.url), "utf8"));
  const bytes = readFileSync(new URL(`../${manifest.snapshot}`, import.meta.url));
  const snapshotSha256 = createHash("sha256").update(bytes).digest("hex");
  assert.equal(snapshotSha256, manifest.snapshotSha256);
  const tables = JSON.parse(gunzipSync(bytes).toString()).tables;
  assert.deepEqual(buildFeihuaData(tables, { repository: manifest.repository, revision: manifest.revision, snapshotSha256 }), data);
  const workIds = new Set(tables.works.map((work: { id: string | number }) => String(work.id)));
  assert.ok(data.lines.every(line => workIds.has(line.workId)));
});

test("every key has enough classical five- or seven-character lines in both tiers", () => {
  assert.deepEqual(data.keys, [...FEIHUA_KEYS]);
  assert.deepEqual(data.lines.map(line => line.id), data.lines.map((_, index) => index));
  assert.equal(new Set(data.lines.map(line => line.text)).size, data.lines.length);
  for (const line of data.lines) {
    assert.match(line.text, /^\p{Script=Han}{5}$|^\p{Script=Han}{7}$/u, line.text);
    assert.ok(!["近现代", "现代", "当代"].includes(line.dynasty), line.text);
    assert.ok(line.title && line.author, line.text);
  }
  for (const tier of tiers) for (const key of data.keys) {
    const lines = feihuaLinesFor(data, tier, key);
    assert.ok(lines.length >= FEIHUA_ROUND_LINES + 4, `${tier} ${key}: ${lines.length}`);
    assert.ok(lines.every(line => line.text.includes(key)), `${tier} ${key}`);
  }
  const basicWorks = new Set(Object.values(data.tiers.basic).flat().map(id => data.lines[id].workId));
  assert.ok(Object.values(data.tiers.advanced).flat().every(id => !basicWorks.has(data.lines[id].workId)), "a beginner work leaked into the advanced tier");
});

test("rounds deal eight distinct lines with fair blanks and four plausible, non-ambiguous options", () => {
  const texts = new Set(data.lines.map(line => line.text));
  for (const tier of tiers) for (const key of data.keys) for (const attempt of [0, 1]) {
    const state = createFeihuaState(data, tier, key, attempt);
    assert.equal(state.questions.length, FEIHUA_ROUND_LINES);
    assert.equal(new Set(state.questions.map(question => question.line.id)).size, FEIHUA_ROUND_LINES);
    for (const question of state.questions) {
      const chars = [...question.line.text];
      assert.equal(question.blanks.length, feihuaBlankCount[tier]);
      assert.deepEqual([...question.blanks].sort((a, b) => a - b), question.blanks);
      question.blanks.forEach((position, blankIndex) => {
        const options = question.options[blankIndex];
        assert.notEqual(chars[position], key, "the key character is never hidden");
        assert.equal(options.length, FEIHUA_OPTION_COUNT);
        assert.equal(new Set(options).size, FEIHUA_OPTION_COUNT);
        assert.equal(options.filter(option => option === chars[position]).length, 1);
        for (const option of options.filter(option => option !== chars[position])) {
          assert.ok(!chars.includes(option) && option !== key, `${question.line.text}: ${option}`);
          const variant = [...chars];
          variant[position] = option;
          assert.ok(!texts.has(variant.join("")), `${option} spells another line`);
        }
      });
    }
  }
  assert.deepEqual(createFeihuaState(data, "basic", "月", 3), createFeihuaState(data, "basic", "月", 3));
  assert.notDeepEqual(createFeihuaState(data, "basic", "月", 3).questions.map(question => question.line.id), createFeihuaState(data, "basic", "月", 4).questions.map(question => question.line.id));
});

test("wrong choices are crossed out and counted; correct ones fill blanks in order until the round ends", () => {
  let state = createFeihuaState(data, "advanced", "春", 0);
  const first = currentFeihuaQuestion(state)!;
  const wrong = first.options[0].find(option => option !== correctChar(state))!;
  state = chooseFeihuaOption(state, wrong);
  assert.deepEqual(state.feedback, { kind: "wrong", char: wrong });
  assert.deepEqual(state.eliminated, [wrong]);
  assert.equal(chooseFeihuaOption(state, wrong), state, "a crossed-out option cannot be chosen again");
  assert.equal(chooseFeihuaOption(state, "不在选项里"), state);
  state = chooseFeihuaOption(state, correctChar(state));
  assert.equal(state.feedback.kind, "correct");
  assert.equal(state.filled, 1);
  assert.deepEqual(state.eliminated, []);
  assert.equal(nextFeihuaLine(state), state, "cannot move on before the line is solved");
  state = chooseFeihuaOption(state, correctChar(state));
  assert.deepEqual(state.feedback, { kind: "solved", line: first.line });
  assert.deepEqual(state.answers, [{ line: first.line, mistakes: 1 }]);
  assert.match(describeFeihuaFeedback(state.feedback, "春"), new RegExp(`${first.line.text}——《${first.line.title}》`));
  while (!isFeihuaComplete(state)) {
    state = nextFeihuaLine(state);
    while (state.feedback.kind !== "solved") state = chooseFeihuaOption(state, correctChar(state));
  }
  assert.equal(state.answers.length, FEIHUA_ROUND_LINES);
  assert.equal(state.mistakes, 1);
  assert.equal(getFeihuaStars(state), 3);
  assert.equal(nextFeihuaLine(state), state);
  assert.equal(feihuaWorkHref(first.line), `/poetry/read/?poem=haitang-${first.line.workId}`);
});

test("feihua records keep the best stars per tier and key", () => {
  let progress = recordFeihuaRound(emptyFeihuaProgress, "basic", "月", 2);
  progress = recordFeihuaRound(progress, "basic", "月", 1);
  assert.deepEqual(progress, { "basic:月": 2 });
  assert.deepEqual(parseFeihuaProgress(JSON.stringify({ ...progress, "basic:龙": 3, "advanced:花": 4, "advanced:雪": 3 }), data.keys), { "basic:月": 2, "advanced:雪": 3 });
  assert.equal(parseFeihuaProgress("{", data.keys), emptyFeihuaProgress);
});
