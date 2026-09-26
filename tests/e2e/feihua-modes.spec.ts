import { expect, test, type Page } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import feihuaJson from "../../data/feihuaLines.json";
import type { FeihuaData } from "../../lib/feihuaTypes";

const data = feihuaJson as FeihuaData;
const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  return errors;
}

test("desktop: theme blanks stay off the keyword, and an unknown recite line says 未收录", async ({ page }) => {
  const errors = trackErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/games/feihua/");
  await page.getByRole("radio", { name: "主题" }).click();
  await page.getByRole("button", { name: /^春天主题飞花令/ }).click();
  await expect(page.getByRole("heading", { name: "飞花令 ·「春天」" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("这句诗里有");
  expect((await new AxeBuilder({ page }).withTags(axeTags).analyze()).violations).toEqual([]);

  await page.getByRole("button", { name: "换一个字" }).click();
  await page.getByRole("radio", { name: "对句" }).click();
  await page.getByRole("button", { name: /^「月」字对句/ }).click();
  await page.getByLabel("写一句含有「月」的诗").fill("自造月句一二三");
  await page.getByRole("button", { name: "提交" }).click();
  await expect(page.getByRole("status")).toContainText("未收录");
  const sample = data.tiers.basic["月"].map(id => data.lines[id]).find(line => line.text.length === 5 || line.text.length === 7)!;
  await page.getByLabel("写一句含有「月」的诗").fill(`《${sample.text}》。`);
  await page.getByRole("button", { name: "提交" }).click();
  await expect(page.getByRole("status")).toContainText("系统接了一句");
  await expect(page.getByRole("list", { name: "已接诗句" })).toContainText(sample.text);
  expect(errors).toEqual([]);
});

test("mobile: theme choices and the recite field stay inside the screen", async ({ page }) => {
  const errors = trackErrors(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/games/feihua/");
  await page.getByRole("radio", { name: "对句" }).click();
  const field = await page.getByRole("button", { name: /^「月」字对句/ }).boundingBox();
  expect(field!.height).toBeGreaterThanOrEqual(44);
  await page.getByRole("button", { name: /^「月」字对句/ }).click();
  const input = await page.getByLabel("写一句含有「月」的诗").boundingBox();
  expect(input!.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  await page.screenshot({ path: "/tmp/hanzis-feihua-recite-375.png" });
  expect(errors).toEqual([]);
});
