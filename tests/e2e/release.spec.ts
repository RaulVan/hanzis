import { readFile, stat } from "node:fs/promises";
import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const accessibilityRoutes = ["/", "/pinyin/tones/", "/pinyin/practice/", "/stroke/", "/poetry/", "/dictionary/?q=学习", "/about/", "/privacy/"];

test("core static pages have no automatically detectable WCAG A/AA violations", async ({ page }) => {
  for (const route of accessibilityRoutes) {
    const response = await page.goto(route, { waitUntil: "load" });
    expect(response?.ok(), route).toBe(true);
    if (route.startsWith("/dictionary")) await expect(page.getByText(/找到 \d+ 条结果/)).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(results.violations, `${route}\n${results.violations.map(item => `${item.id}: ${item.help}`).join("\n")}`).toEqual([]);
  }
});

test("the worksheet PDF action downloads a real PDF", async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  await page.getByRole("textbox", { name: "练习内容" }).fill("春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出 PDF" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
  expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  expect((await stat(path!)).size).toBeGreaterThan(10_000);
  expect((await readFile(path!)).subarray(0, 5).toString("ascii")).toBe("%PDF-");
});
