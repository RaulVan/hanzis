import { expect, test, type Page } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import { hanziMatchLevels } from "../../data/hanziMatchLevels";

const beginner = hanziMatchLevels.find(level => level.id === "beginner-1")!;
const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  return errors;
}

const board = (page: Page) => page.getByRole("group", { name: "字卡棋盘" });
const tile = (page: Page, char: string) => board(page).locator(`button[aria-pressed="false"][aria-label^="${char}"]`).first();

async function pick(page: Page, word: string) {
  const [first, second] = [...word];
  await tile(page, first).click();
  await tile(page, second).click();
}

async function expectNoHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
}

test("desktop: explains mistakes, uses a hint, finishes a level, and keeps progress after reload", async ({ page }) => {
  const errors = trackErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/games/hanzi-match/");
  await expect(page.getByRole("navigation", { name: "主导航" }).getByRole("link", { name: "汉字游戏" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("button", { name: /^第 2 关 每天做的事，完成第 1 关后解锁$/ })).toBeDisabled();
  expect((await new AxeBuilder({ page }).withTags(axeTags).analyze()).violations).toEqual([]);
  await page.screenshot({ path: "/tmp/hanzis-hanzi-match-select-1440.png" });

  await page.getByRole("button", { name: /^第 1 关 看看天地/ }).click();
  const heading = page.getByRole("heading", { name: "第 1 关 · 看看天地" });
  await expect(heading).toBeFocused();
  await expect(board(page).getByRole("button")).toHaveCount(16);
  await expect(board(page).getByRole("button", { name: /^火 huǒ，第/ })).toBeVisible();

  const status = page.getByRole("status");
  await pick(page, "车火");
  await expect(status).toContainText("顺序反了：不是「车火」，而是「火车」");
  await pick(page, "火海");
  await expect(status).toContainText("「火海」不是本关要找的词语");

  await page.getByRole("button", { name: "提示" }).click();
  await expect(status).toContainText("提示已高亮两个字");
  await expect(board(page).locator('button[aria-label$="，提示"]')).toHaveCount(2);
  expect((await new AxeBuilder({ page }).withTags(axeTags).analyze()).violations).toEqual([]);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "/tmp/hanzis-hanzi-match-play-1440.png" });

  for (const [index, word] of beginner.words.entries()) {
    await pick(page, word.word);
    if (index < beginner.words.length - 1) {
      await expect(status).toContainText(`找到了「${word.word}」（${word.pinyin}）`);
      await expect(page.getByRole("complementary", { name: "已找到的词语" })).toContainText(word.meaning);
    }
  }

  const result = page.getByRole("heading", { name: "第 1 关完成" });
  await expect(result).toBeFocused();
  await expect(page.getByRole("img", { name: "获得 2 颗星，共 3 颗" })).toBeVisible();
  await expect(page.getByText("失误 2 次 · 提示 1 次")).toBeVisible();
  for (const word of beginner.words) await expect(page.getByText(`例：${word.example}`)).toBeVisible();
  await expect(page.getByRole("link", { name: "在字典中查看「火车」" })).toHaveAttribute("href", "/dictionary/?q=%E7%81%AB%E8%BD%A6");
  expect((await new AxeBuilder({ page }).withTags(axeTags).analyze()).violations).toEqual([]);
  await page.screenshot({ path: "/tmp/hanzis-hanzi-match-result-1440.png" });

  await page.reload();
  await expect(page.getByRole("button", { name: /^第 1 关 看看天地，已获得 2 颗星$/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /^第 2 关 每天做的事，未完成$/ })).toBeEnabled();
  const review = page.getByRole("region", { name: "待复习词语" });
  await expect(review.getByRole("link", { name: "在字典中查看「火车」" })).toBeVisible();
  // The reversed attempt and the hint both pointed at 火车, so it is listed once.
  await expect(review.getByRole("link")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("mobile: board fits with touch-sized tiles and replaying cleanly keeps the best score", async ({ page }) => {
  const errors = trackErrors(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/games/hanzi-match/");
  await page.getByRole("radio", { name: "挑战" }).click();
  await page.getByRole("button", { name: /^第 1 关 首尾相连/ }).click();
  const tiles = board(page).getByRole("button");
  await expect(tiles).toHaveCount(16);
  await expect(tiles.first()).not.toContainText(/[a-z]/);
  for (const box of await Promise.all((await tiles.all()).map(item => item.boundingBox()))) {
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "/tmp/hanzis-hanzi-match-play-375.png", fullPage: true });

  const level = hanziMatchLevels.find(item => item.id === "challenge-1")!;
  for (const word of level.words) await pick(page, word.word);
  await expect(page.getByRole("heading", { name: "第 1 关完成" })).toBeFocused();
  await expect(page.getByRole("img", { name: "获得 3 颗星，共 3 颗" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "/tmp/hanzis-hanzi-match-result-375.png", fullPage: true });
  await page.getByRole("button", { name: "下一关：一路接下去" }).click();
  await expect(page.getByRole("heading", { name: "第 2 关 · 一路接下去" })).toBeFocused();
  await page.getByRole("button", { name: "返回选关" }).click();
  await expect(page.getByRole("button", { name: /^第 1 关 首尾相连，已获得 3 颗星$/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test("blocked storage still lets the level finish and says progress was not saved", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException("blocked", "SecurityError"); };
  });
  const errors = trackErrors(page);
  await page.goto("/games/hanzi-match/");
  await page.getByRole("button", { name: /^第 1 关 看看天地/ }).click();
  for (const word of beginner.words) await pick(page, word.word);
  await expect(page.getByRole("heading", { name: "第 1 关完成" })).toBeVisible();
  await expect(page.getByText("进度未能保存")).toBeVisible();
  expect(errors).toEqual([]);
});
