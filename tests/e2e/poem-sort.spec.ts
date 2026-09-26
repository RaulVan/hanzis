import { expect, test, type Page } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const jingYeSi = ["床前明月光", "疑是地上霜", "举头望明月", "低头思故乡"];

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  return errors;
}

async function place(page: Page, line: string) {
  for (const char of line) {
    await page.getByRole("group", { name: "待排序的字" }).getByRole("button", { name: char, exact: true }).click();
  }
}

test("desktop: a wrong tile stays put, the poem can be rebuilt, and the best stars survive a reload", async ({ page }) => {
  const errors = trackErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/games/poem-sort/");
  expect((await new AxeBuilder({ page }).withTags(axeTags).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: /静夜思，李白/ }).click();
  await expect(page.getByRole("heading", { name: "静夜思" })).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(axeTags).analyze()).violations).toEqual([]);

  const tiles = page.getByRole("group", { name: "待排序的字" }).getByRole("button");
  const wrong = (await tiles.allTextContents()).find(text => text !== "床")!;
  await tiles.filter({ hasText: wrong }).first().click();
  await expect(page.getByRole("status")).toContainText("这个字还不到这里");
  await expect(page.getByRole("status")).not.toContainText("床");
  await page.screenshot({ path: "/tmp/hanzis-poem-sort-play-1440.png" });
  expect(await page.evaluate(() => document.activeElement?.closest('[role="group"]')?.getAttribute("aria-label"))).toBe("待排序的字");

  await page.getByRole("button", { name: "床", exact: true }).focus();
  await page.keyboard.press("Enter");
  for (const line of jingYeSi) await place(page, line.slice(line.startsWith("床前") ? 1 : 0));
  await expect(page.getByRole("heading", { name: "《静夜思》排好了" })).toBeVisible();
  await expect(page.getByRole("img", { name: "获得 3 颗星，共 3 颗" })).toBeVisible();
  await page.screenshot({ path: "/tmp/hanzis-poem-sort-result-1440.png" });
  expect((await new AxeBuilder({ page }).withTags(axeTags).analyze()).violations).toEqual([]);
  await page.getByRole("link", { name: "读全诗《静夜思》" }).click();
  await expect(page.locator("main")).toContainText("床前明月光", { timeout: 15_000 });

  await page.goto("/games/poem-sort/");
  await expect(page.getByRole("button", { name: /静夜思，李白，4 句，已获得 3 颗星/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test("mobile: a seven-character line stays on one row and tiles meet the touch size", async ({ page }) => {
  const errors = trackErrors(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/games/poem-sort/");
  await page.getByRole("radio", { name: "进阶" }).click();
  await page.getByRole("button", { name: /早发白帝城/ }).click();
  const slots = page.locator("[data-poem-slot]");
  await expect(slots).toHaveCount(7);
  const boxes = await Promise.all((await slots.all()).map(slot => slot.boundingBox()));
  expect(new Set(boxes.map(box => box!.y)).size).toBe(1);
  const tile = await page.getByRole("group", { name: "待排序的字" }).getByRole("button").first().boundingBox();
  expect(tile!.width).toBeGreaterThanOrEqual(44);
  expect(tile!.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  await page.screenshot({ path: "/tmp/hanzis-poem-sort-play-375.png" });
  await place(page, "朝辞白帝彩云间");
  await expect(page.getByRole("status")).toContainText("这一句排好了");
  expect(errors).toEqual([]);
});
