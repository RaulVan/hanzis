import { expect, test, type Page } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  return errors;
}

test("desktop: a wrong idiom is explained, the chain finishes, and stars survive a reload", async ({ page }) => {
  const errors = trackErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/games/chengyu-chain/");
  expect((await new AxeBuilder({ page }).withTags(axeTags).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: /守株待兔，6 个成语/ }).click();
  await expect(page.getByRole("heading", { name: "成语接龙 · 守株待兔" })).toBeVisible();
  const choices = page.getByRole("group", { name: "候选成语" });
  const wrong = (await choices.getByRole("button").allTextContents()).find(text => !text.startsWith("兔"))!;
  await choices.getByRole("button", { name: wrong, exact: true }).click();
  await expect(page.getByRole("status")).toContainText("要接以「兔」开头");
  await expect(page.getByRole("status")).not.toContainText("兔死狐悲");
  await expect(choices.getByRole("button", { name: `${wrong}，已排除` })).toBeDisabled();
  expect((await new AxeBuilder({ page }).withTags(axeTags).analyze()).violations).toEqual([]);

  for (let step = 0; step < 5; step += 1) {
    const prompt = await page.locator("[data-chengyu-prompt]").getAttribute("data-chengyu-prompt");
    const start = [...prompt!][3];
    await page.getByRole("group", { name: "候选成语" }).getByRole("button", { name: new RegExp(`^${start}`) }).click();
  }
  await expect(page.getByRole("heading", { name: "「守株待兔」接完了" })).toBeVisible();
  await expect(page.getByRole("img", { name: "获得 3 颗星，共 3 颗" })).toBeVisible();
  await page.screenshot({ path: "/tmp/hanzis-chengyu-chain-result-1440.png" });
  await page.reload();
  await expect(page.getByRole("button", { name: /守株待兔，6 个成语，已获得 3 颗星/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test("mobile: chain choices stay on screen and a hinted link is marked once", async ({ page }) => {
  const errors = trackErrors(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/games/chengyu-chain/");
  await page.getByRole("radio", { name: "进阶" }).click();
  await page.getByRole("button", { name: /滴水穿石/ }).click();
  await page.getByRole("button", { name: "标出这一环" }).click();
  await expect(page.getByRole("status")).toContainText("已经标出来了");
  await expect(page.getByRole("button", { name: /，提示$/ })).toBeVisible();
  const choice = await page.getByRole("group", { name: "候选成语" }).getByRole("button").first().boundingBox();
  expect(choice!.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  await page.screenshot({ path: "/tmp/hanzis-chengyu-chain-play-375.png" });
  await page.getByRole("button", { name: "标出这一环" }).click();
  await expect(page.locator("dt").filter({ hasText: /^提示$/ }).locator("xpath=..").locator("dd")).toHaveText("1");
  expect(errors).toEqual([]);
});
