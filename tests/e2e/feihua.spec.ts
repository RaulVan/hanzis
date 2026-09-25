import { expect, test, type Page } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import feihuaJson from "../../data/feihuaLines.json";
import type { FeihuaData, FeihuaTier } from "../../lib/feihuaTypes";

const data = feihuaJson as FeihuaData;
const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  return errors;
}

/** Reads the screen-reader version of the verse ("床 前 空 月 光") and finds the matching line in the bank. */
async function nextAnswer(page: Page, tier: FeihuaTier, key: string) {
  const spoken = (await page.getByText(/^诗句：/).textContent())!.replace("诗句：", "").split(" ");
  const line = data.tiers[tier][key].map(id => data.lines[id]).find(item => [...item.text].length === spoken.length && [...item.text].every((char, index) => spoken[index] === "空" || spoken[index] === char))!;
  return [...line.text][spoken.indexOf("空")];
}

const options = (page: Page) => page.getByRole("group", { name: /个空的候选字$/ }).getByRole("button");

test("desktop: crosses out a wrong choice, keeps keyboard focus on the choices, and records the round", async ({ page }) => {
  const errors = trackErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/games/feihua/");
  expect((await new AxeBuilder({ page }).withTags(axeTags).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: /^「月」字飞花令/ }).click();
  await expect(page.getByRole("heading", { name: "飞花令 ·「月」" })).toBeVisible();
  const status = page.getByRole("status");
  await expect(status).toContainText("这句诗里有「月」");

  const correct = await nextAnswer(page, "basic", "月");
  const wrong = (await options(page).allTextContents()).find(text => text !== correct)!;
  await options(page).filter({ hasText: wrong }).click();
  await expect(status).toContainText(`不是「${wrong}」，已把它划掉`);
  await expect(page.getByRole("button", { name: `${wrong}，已排除` })).toBeDisabled();
  expect(await page.evaluate(() => document.activeElement?.closest('[role="group"]') !== null)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(axeTags).analyze()).violations).toEqual([]);

  for (let line = 0; line < 8; line += 1) {
    const answer = await nextAnswer(page, "basic", "月");
    // Keyboard only: move to the right option with Tab from the focused first option.
    for (let step = 0; step < 4; step += 1) {
      if (await page.evaluate(char => document.activeElement?.textContent === char, answer)) break;
      await page.keyboard.press("Tab");
    }
    await page.keyboard.press("Enter");
    await expect(status).toContainText("答对了");
    if (line === 0) await page.screenshot({ path: "/tmp/hanzis-feihua-play-1440.png" });
    const next = page.getByRole("button", { name: line === 7 ? "查看本轮结果" : "下一句" });
    await expect(next).toBeFocused();
    await expect(page.getByRole("link", { name: "读全诗" })).toHaveAttribute("href", /^\/poetry\/read\/\?poem=haitang-\d+$/);
    await page.keyboard.press("Enter");
  }

  await expect(page.getByRole("heading", { name: "「月」字令完成" })).toBeFocused();
  await expect(page.getByRole("img", { name: "获得 3 颗星，共 3 颗" })).toBeVisible();
  await expect(page.getByRole("link", { name: /^读全诗《/ })).toHaveCount(8);
  expect((await new AxeBuilder({ page }).withTags(axeTags).analyze()).violations).toEqual([]);
  await page.screenshot({ path: "/tmp/hanzis-feihua-result-1440.png" });

  const firstRow = page.getByRole("listitem").filter({ has: page.getByRole("link", { name: /^读全诗《/ }) }).first();
  const verse = (await firstRow.locator("p.font-serif").textContent())!;
  const href = await firstRow.getByRole("link").getAttribute("href");
  await page.reload();
  await expect(page.getByRole("button", { name: /^「月」字飞花令，\d+ 句可选，已获得 3 颗星$/ })).toBeVisible();
  await page.goto(href!);
  // The reading page loads works on demand; the verse must appear once it has loaded.
  await expect(page.locator("main")).toContainText(verse, { timeout: 15_000 });
  expect(errors).toEqual([]);
});

test("mobile: advanced seven-character lines stay on one row and two blanks fill in order", async ({ page }) => {
  const errors = trackErrors(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/games/feihua/");
  await page.getByRole("radio", { name: "进阶" }).click();
  await page.getByRole("button", { name: /^「春」字飞花令/ }).click();
  for (let line = 0; line < 8; line += 1) {
    const cells = page.locator('[aria-hidden="true"] > span.font-serif');
    const tops = await cells.evaluateAll(elements => elements.map(element => Math.round(element.getBoundingClientRect().top)));
    expect(new Set(tops).size, "verse wrapped onto two rows").toBe(1);
    await options(page).filter({ hasText: await nextAnswer(page, "advanced", "春") }).click();
    await expect(page.getByRole("status")).toContainText("对了，再填下一个空");
    await options(page).filter({ hasText: await nextAnswer(page, "advanced", "春") }).click();
    await expect(page.getByRole("status")).toContainText("答对了");
    if (line === 0) {
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      await page.screenshot({ path: "/tmp/hanzis-feihua-play-375.png" });
    }
    await page.getByRole("button", { name: line === 7 ? "查看本轮结果" : "下一句" }).click();
  }
  await expect(page.getByRole("heading", { name: "「春」字令完成" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  await page.screenshot({ path: "/tmp/hanzis-feihua-result-375.png", fullPage: true });
  expect(errors).toEqual([]);
});
