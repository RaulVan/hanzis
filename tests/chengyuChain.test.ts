import assert from "node:assert/strict";
import test from "node:test";
import { CHENGYU_CHAIN_CONTENT_VERSION, CHENGYU_CHAIN_REVIEW_STATUS, CHENGYU_CHAIN_SOURCE, chengyuChains } from "../data/chengyuChains";
import {
  chooseChengyuOption,
  createChengyuChainState,
  getChengyuChainStars,
  hintChengyuChain,
  type ChengyuChainState,
} from "../lib/chengyuChain";
import { CHENGYU_CHAIN_PROGRESS_KEY, emptyChengyuChainProgress, parseChengyuChainProgress, recordChengyuChainRound } from "../lib/chengyuChainProgress";

function solve(state: ChengyuChainState): ChengyuChainState {
  let current = state;
  while (!current.done) current = chooseChengyuOption(current, current.questions[current.index].answer);
  return current;
}

test("chengyu chains are linked four-character idioms with original glosses", () => {
  assert.equal(chengyuChains.length, 6);
  assert.equal(CHENGYU_CHAIN_SOURCE, "汉字网编写");
  assert.equal(CHENGYU_CHAIN_REVIEW_STATUS, "unreviewed");
  assert.equal(CHENGYU_CHAIN_CONTENT_VERSION, 1);
  const texts = chengyuChains.flatMap(chain => chain.idioms.map(idiom => idiom.text));
  assert.equal(new Set(texts).size, texts.length);
  for (const chain of chengyuChains) {
    assert.equal(chain.idioms.length, 6);
    for (let index = 0; index < chain.idioms.length; index += 1) {
      const idiom = chain.idioms[index];
      const chars = [...idiom.text];
      assert.equal(chars.length, 4);
      assert.equal(idiom.meaning.includes(idiom.text), false);
      assert.equal(idiom.example.includes(idiom.text), false);
      const next = chain.idioms[index + 1];
      if (!next) continue;
      assert.equal(chars[3], [...next.text][0]);
      assert.equal(idiom.meaning.includes(next.text), false);
      assert.equal(idiom.example.includes(next.text), false);
    }
  }
});

test("each link offers four choices and a wrong one explains the missing initial", () => {
  for (const chain of chengyuChains) {
    for (const attempt of [0, 1, 2]) {
      const state = createChengyuChainState(chain, attempt);
      assert.equal(state.questions.length, 5);
      for (const question of state.questions) {
        assert.equal(question.options.length, 4);
        assert.equal(new Set(question.options).size, 4);
        assert.ok(question.options.includes(question.answer));
        const start = [...question.answer][0];
        for (const option of question.options) {
          if (option !== question.answer) assert.notEqual([...option][0], start);
        }
      }
    }
  }
  const state = createChengyuChainState(chengyuChains[0], 0);
  const question = state.questions[0];
  const wrong = question.options.find(option => option !== question.answer)!;
  const missed = chooseChengyuOption(state, wrong);
  assert.equal(missed.mistakes, 1);
  assert.equal(missed.index, 0);
  assert.deepEqual(missed.eliminated, [wrong]);
  assert.equal(missed.feedback.text.includes(`以「${[...question.answer][0]}」开头`), true);
  assert.equal(missed.feedback.text.includes(question.answer), false);
  assert.equal(chooseChengyuOption(missed, wrong), missed);
});

test("a hint marks the answer once per link and a clean chain keeps three stars", () => {
  const chain = chengyuChains[0];
  let state = hintChengyuChain(createChengyuChainState(chain, 4));
  assert.equal(state.hints, 1);
  assert.equal(state.hinted, true);
  assert.equal(state.feedback.text.includes(state.questions[0].answer), false);
  state = hintChengyuChain(state);
  assert.equal(state.hints, 1);
  state = solve(state);
  assert.equal(state.done, true);
  assert.equal(state.mistakes, 0);
  assert.equal(getChengyuChainStars(state), 2);
  assert.equal(getChengyuChainStars(solve(createChengyuChainState(chain, 5))), 3);
});

test("chengyu progress keeps the best stars for known chains", () => {
  const ids = chengyuChains.map(chain => chain.id);
  assert.equal(CHENGYU_CHAIN_PROGRESS_KEY, "hanzis-games-chengyu-chain-v1");
  assert.deepEqual(parseChengyuChainProgress("nope", ids), emptyChengyuChainProgress);
  assert.deepEqual(parseChengyuChainProgress(JSON.stringify({ "shou-zhu": 2, other: 3, "hua-she": 9 }), ids), { "shou-zhu": 2 });
  assert.deepEqual(recordChengyuChainRound({ "shou-zhu": 2 }, "shou-zhu", 1), { "shou-zhu": 2 });
});
