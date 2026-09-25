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

test("pinyin tone marks sit over their vowel inside words in the site sans font", async ({ page }) => {
  await page.goto("/games/hanzi-match/", { waitUntil: "load" });
  const letters = ["ā", "ē", "ī", "ō", "ū", "ǖ", "á", "ǎ", "à"];
  // "n" has no ascender, so the topmost ink belongs to the tone mark; the bug only appears after another letter.
  await page.evaluate(async chars => {
    const box = document.createElement("div");
    box.id = "tone-probe";
    box.style.cssText = "position:fixed;top:0;left:0;z-index:999;display:flex;gap:24px;padding:16px;background:#fff;color:#000;font-size:96px;line-height:1.4";
    box.innerHTML = chars.map(char => `<span class="font-sans">n${char}</span>`).join("");
    document.body.append(box);
    const family = getComputedStyle(box.firstElementChild!).fontFamily;
    await Promise.all(chars.map(char => document.fonts.load(`96px ${family}`, `n${char}`)));
    await document.fonts.ready;
  }, letters);
  const images = await Promise.all((await page.locator("#tone-probe span").all()).map(async span => (await span.screenshot()).toString("base64")));
  const offsets = await page.evaluate(async sources => Promise.all(sources.map(async source => {
    const image = new Image();
    image.src = `data:image/png;base64,${source}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d")!;
    context.drawImage(image, 0, 0);
    const { data } = context.getImageData(0, 0, image.width, image.height);
    const rows = Array.from({ length: image.height }, (_, y) => {
      const columns: number[] = [];
      for (let x = 0; x < image.width; x += 1) if (data[(y * image.width + x) * 4] < 128) columns.push(x);
      return columns;
    });
    const inkRows = rows.map((columns, y) => columns.length ? y : -1).filter(y => y >= 0);
    const markEnd = inkRows.findIndex((y, index) => index > 0 && y !== inkRows[index - 1] + 1);
    const markColumns = inkRows.slice(0, markEnd).flatMap(y => rows[y]);
    const bodyColumns = [...new Set(inkRows.slice(markEnd).flatMap(y => rows[y]))].sort((a, b) => a - b);
    let split = 1;
    for (let index = 1; index < bodyColumns.length; index += 1) {
      if (bodyColumns[index] - bodyColumns[index - 1] > bodyColumns[split] - bodyColumns[split - 1]) split = index;
    }
    const vowel = bodyColumns.slice(split);
    const center = (columns: number[]) => (Math.min(...columns) + Math.max(...columns)) / 2;
    return Math.abs(center(markColumns) - center(vowel)) / (vowel[vowel.length - 1] - vowel[0]);
  })), images);
  const misplaced = letters.filter((_, index) => offsets[index] > 0.25);
  expect(misplaced, JSON.stringify(Object.fromEntries(letters.map((letter, index) => [letter, offsets[index].toFixed(2)])))).toEqual([]);
});
