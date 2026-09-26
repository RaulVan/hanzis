import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import wordleJson from "../data/chengyuWordle.json";
import { chengyuChains } from "../data/chengyuChains";
import {
  answerForDate,
  answerForPractice,
  chengyuWordleDate,
  chengyuWordleDayIndex,
  chengyuWordleMistakes,
  chengyuWordlePath,
  compareChengyu,
  createChengyuWordleState,
  getChengyuWordleStars,
  indexChengyuDictionary,
  isChengyuWordleDate,
  chengyuHintsExhausted,
  nextChengyuInitialHint,
  revealChengyuAnswer,
  revealChengyuInitial,
  shareChengyuWordle,
  showChengyuExplanation,
  submitChengyuGuess,
} from "../lib/chengyuWordle";
import { emptyChengyuWordleProgress, parseChengyuWordleProgress, recordChengyuWordleRound } from "../lib/chengyuWordleProgress";
import type { PinyinSyllable } from "../lib/pinyinSyllable";
import { buildChengyuWordleData, loadChengyuSnapshot, type ChengyuWordleData } from "../scripts/prepare-chengyu-wordle";

const data = wordleJson as ChengyuWordleData;
const syllable = (initial: string, final: string, tone: number): PinyinSyllable => ({ initial, final, tone });

test("the committed idiom bank matches the verified snapshot", () => {
  const sources = JSON.parse(readFileSync(new URL("../data/dictionary-sources.json", import.meta.url), "utf8")) as { id: string; repository: string; revision: string; snapshotSha256: string }[];
  const source = sources.find(item => item.id === "xinhua-idiom")!;
  const bytes = readFileSync(new URL("../data/xinhua-idiom-source.json.gz", import.meta.url));
  assert.equal(createHash("sha256").update(bytes).digest("hex"), source.snapshotSha256);
  assert.deepEqual(buildChengyuWordleData(loadChengyuSnapshot(), { repository: source.repository, revision: source.revision, snapshotSha256: source.snapshotSha256 }), data);
});

test("daily answers are common enough to hint, and the handwritten chains are included", () => {
  assert.equal(data.answers.length, 366);
  assert.equal(data.source.reviewStatus, "unreviewed");
  const answers = new Set(data.answers.map(item => item.word));
  const dictionaryWords = new Set(data.dictionary.map(item => item.word));
  for (const chain of chengyuChains) {
    for (const idiom of chain.idioms) {
      if (!dictionaryWords.has(idiom.text)) {
        assert.equal(idiom.text, "童言无忌");
        continue;
      }
      assert.equal(answers.has(idiom.text), true, idiom.text);
    }
  }
  for (const answer of data.answers) {
    assert.equal(answer.explanation.includes(answer.word), false);
    assert.ok(answer.explanation.length >= 8 && answer.explanation.length <= 64);
  }
  const dictionary = indexChengyuDictionary(data.dictionary);
  assert.equal(dictionary.size, data.dictionary.length);
});

test("the puzzle id is the date, and the share text leaves the answer out", () => {
  assert.equal(chengyuWordleDate(new Date(2026, 8, 26, 23, 30)), "2026-09-26");
  assert.equal(chengyuWordleDayIndex("2026-01-01", data.epoch), 0);
  assert.equal(chengyuWordleDayIndex("2025-12-31", data.epoch), -1);
  assert.equal(isChengyuWordleDate("2026-02-31"), false);
  const day = "2026-09-26";
  const answer = answerForDate(data, day);
  assert.equal(chengyuWordlePath(day).includes(answer.word), false);
  assert.match(chengyuWordlePath(day), /\?d=2026-09-26$/);
  assert.equal(answerForDate(data, day).word, answer.word);
  const practice = answerForPractice(data, "e2e");
  assert.equal(answerForPractice(data, "e2e").word, practice.word);
  const dictionary = indexChengyuDictionary(data.dictionary);
  const wrong = data.dictionary.find(item => item.word !== practice.word)!;
  let state = createChengyuWordleState(practice, "e2e", true);
  state = submitChengyuGuess(state, wrong.word, dictionary);
  state = submitChengyuGuess(state, practice.word, dictionary);
  const share = shareChengyuWordle(state);
  assert.equal(share.includes(practice.word), false);
  assert.match(share, /2\/6/);
  assert.match(share, /●对 ◐有 ○无/);
  assert.match(share, /练习/);
});

test("marks consume one match per dimension, and invalid guesses do not use a try", () => {
  const answerSyllables = [syllable("b", "a", 1), syllable("b", "a", 1), syllable("p", "a", 2), syllable("m", "a", 4)];
  const guessSyllables = [syllable("b", "a", 1), syllable("p", "a", 1), syllable("b", "a", 4), syllable("f", "a", 4)];
  const marks = compareChengyu("甲乙丙丁", guessSyllables, "甲丙乙戊", answerSyllables);
  assert.equal(marks[0].char, "exact");
  assert.equal(marks[1].char, "present");
  assert.equal(marks[2].char, "present");
  assert.equal(marks[3].char, "absent");
  assert.equal(marks[0].initial, "exact");
  assert.equal(marks[1].initial, "present");
  assert.equal(marks[2].initial, "present");
  assert.equal(marks[3].initial, "absent");
  assert.equal(marks[3].tone, "exact");

  const dictionary = indexChengyuDictionary(data.dictionary);
  const answer = data.answers[0];
  let state = createChengyuWordleState(answer, "2026-09-26", false);
  state = submitChengyuGuess(state, "", dictionary);
  state = submitChengyuGuess(state, "马", dictionary);
  state = submitChengyuGuess(state, "甲乙丙丁", dictionary);
  assert.equal(state.guesses.length, 0);
  assert.equal(state.feedback.kind, "unknown");
  const other = data.dictionary.find(item => item.word !== answer.word)!;
  state = submitChengyuGuess(state, other.word, dictionary);
  state = submitChengyuGuess(state, other.word, dictionary);
  assert.equal(state.guesses.length, 1);
  assert.equal(state.feedback.kind, "duplicate");
  state = showChengyuExplanation(state);
  state = showChengyuExplanation(state);
  assert.equal(state.hints, 1);
  assert.match(state.feedback.text, new RegExp(answer.explanation));
  state = revealChengyuInitial(state);
  const hintsAfterFirst = state.hints;
  state = revealChengyuInitial({ ...state, revealed: state.revealed });
  assert.equal(hintsAfterFirst, 2);
  assert.ok(state.hints >= 2);
  const repeated = revealChengyuInitial({ ...state, guesses: state.guesses.map(guess => ({ ...guess, marks: guess.marks.map(mark => ({ ...mark, initial: "exact" as const })) })) });
  assert.equal(repeated.hints, state.hints);
});

test("six misses reveal the answer, and a win keeps the streak on the calendar day", () => {
  const dictionary = indexChengyuDictionary(data.dictionary);
  const answer = data.answers[0];
  const misses = data.dictionary.filter(item => item.word !== answer.word).slice(0, 6);
  let state = createChengyuWordleState(answer, "2026-09-26", false);
  for (const miss of misses) state = submitChengyuGuess(state, miss.word, dictionary);
  assert.equal(state.done, true);
  assert.equal(state.won, false);
  assert.match(state.feedback.text, new RegExp(answer.word));
  assert.equal(chengyuWordleMistakes(state), 6);
  assert.equal(getChengyuWordleStars(state), 1);

  const won = submitChengyuGuess(createChengyuWordleState(answer, "2026-09-26", false), answer.word, dictionary);
  assert.equal(won.won, true);
  assert.equal(getChengyuWordleStars(won), 3);
  const round = { date: "2026-09-25", guesses: [answer.word], hints: 0, explanationShown: false, revealed: [], won: true, gaveUp: false };
  let progress = recordChengyuWordleRound(emptyChengyuWordleProgress, round, "2026-09-25");
  progress = recordChengyuWordleRound(progress, { ...round, date: "2026-09-26" }, "2026-09-26");
  assert.equal(progress.streak, 2);
  progress = recordChengyuWordleRound(progress, { ...round, date: "2026-09-26" }, "2026-09-26");
  assert.equal(progress.streak, 2);
  progress = recordChengyuWordleRound(progress, { ...round, date: "2026-01-01" }, "2026-09-26");
  assert.equal(progress.streak, 2);
  assert.equal(progress.lastSolved, "2026-09-26");
  assert.equal(parseChengyuWordleProgress("{").streak, 0);
});

test("showing the answer waits until every hint is used and does not count as a win", () => {
  const dictionary = indexChengyuDictionary(data.dictionary);
  const answer = data.answers[0];
  const wrong = data.dictionary.find(item => item.word !== answer.word)!;
  let state = submitChengyuGuess(createChengyuWordleState(answer, "2026-09-26", false), wrong.word, dictionary);
  assert.equal(chengyuHintsExhausted(state), false);
  assert.equal(revealChengyuAnswer(state), state);
  state = showChengyuExplanation(state);
  while (nextChengyuInitialHint(state) !== undefined) state = revealChengyuInitial(state);
  assert.equal(chengyuHintsExhausted(state), true);
  const shown = revealChengyuAnswer(state);
  assert.equal(shown.gaveUp, true);
  assert.equal(shown.done, true);
  assert.equal(shown.won, false);
  assert.match(shown.feedback.text, new RegExp(answer.word));
  assert.equal(revealChengyuAnswer(shown), shown);
  assert.equal(shareChengyuWordle(shown).includes(answer.word), false);
  const saved = recordChengyuWordleRound(emptyChengyuWordleProgress, {
    date: "2026-09-26",
    guesses: shown.guesses.map(guess => guess.word),
    hints: shown.hints,
    explanationShown: true,
    revealed: [...shown.revealed],
    won: false,
    gaveUp: true,
  }, "2026-09-26");
  assert.equal(saved.streak, 0);
  assert.equal(parseChengyuWordleProgress(JSON.stringify({ ...saved, rounds: { "2026-09-26": { ...saved.rounds["2026-09-26"], gaveUp: undefined } } })).rounds["2026-09-26"].gaveUp, false);
});
