import { expect, test, type Page } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import wordleJson from "../../data/chengyuWordle.json";
import { answerForPractice, shareChengyuWordle, submitChengyuGuess, createChengyuWordleState, indexChengyuDictionary } from "../../lib/chengyuWordle";
import type { ChengyuWordleData } from "../../scripts/prepare-chengyu-wordle";

const data = wordleJson as ChengyuWordleData;
const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  return errors;
}

test("desktop: a practice puzzle marks a miss, hides the answer in the share, and can be solved", async ({ page }) => {
  const errors = trackErrors(page);
  const answer = answerForPractice(data, "e2e");
  const wrong = data.dictionary.find(item => item.word !== answer.word)!;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/games/chengyu-wordle/?practice=e2e");
  await expect(page.getByRole("heading", { name: "每日成语", exact: true })).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(axeTags).analyze()).violations).toEqual([]);
  await page.getByLabel("猜一个四字成语").fill("甲乙丙丁");
  await page.getByRole("button", { name: "提交" }).click();
  await expect(page.getByRole("status")).toContainText("词库里没有这个成语");
  await expect(page.getByRole("status")).not.toContainText(answer.word);
  await page.getByLabel("猜一个四字成语").fill(wrong.word);
  await page.getByRole("button", { name: "提交" }).click();
  await expect(page.getByRole("list", { name: "已猜成语" })).toContainText("对");
  await expect(page.getByRole("status")).not.toContainText(answer.word);
  await page.getByRole("button", { name: "看释义" }).click();
  await expect(page.getByRole("status")).toContainText(`释义：${answer.explanation}`);
  await page.getByRole("button", { name: "看一个声母" }).click();
  await expect(page.getByRole("status")).toContainText("声母是");
  await page.getByLabel("猜一个四字成语").fill(answer.word);
  await page.getByRole("button", { name: "提交" }).click();
  await expect(page.getByRole("heading", { name: `猜对了：${answer.word}` })).toBeVisible();
  const share = await page.locator("pre").innerText();
  expect(share.includes(answer.word)).toBe(false);
  expect(share).toContain("●对 ◐有 ○无");
  expect(page.url()).not.toContain(encodeURIComponent(answer.word));
  const solved = submitChengyuGuess(submitChengyuGuess(createChengyuWordleState(answer, "e2e", true), wrong.word, indexChengyuDictionary(data.dictionary)), answer.word, indexChengyuDictionary(data.dictionary));
  expect(shareChengyuWordle(solved).includes(answer.word)).toBe(false);
  expect(errors).toEqual([]);
});

test("mobile: the guess board does not overflow and the main controls are at least 44px", async ({ page }) => {
  const errors = trackErrors(page);
  const answer = answerForPractice(data, "e2e-mobile");
  const wrong = data.dictionary.find(item => item.word !== answer.word)!;
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/games/chengyu-wordle/?practice=e2e-mobile");
  await page.getByLabel("猜一个四字成语").fill(wrong.word);
  await page.getByRole("button", { name: "提交" }).click();
  await expect(page.getByRole("list", { name: "已猜成语" })).toBeVisible();
  const submit = await page.getByRole("button", { name: "提交" }).boundingBox();
  const hint = await page.getByRole("button", { name: "看释义" }).boundingBox();
  expect(submit!.height).toBeGreaterThanOrEqual(44);
  expect(hint!.width).toBeGreaterThanOrEqual(44);
  expect(hint!.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  await page.screenshot({ path: "/tmp/hanzis-chengyu-wordle-375.png" });
  expect(errors).toEqual([]);
});
