import { expect, test } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

test.setTimeout(60_000);


for (const locale of ["zh-CN", "zh-TW", "en-US", "ja-JP", "fr-FR"]) {
  test(`browser language ${locale} selects the expected interface`, async ({ browser }) => {
    const context = await browser.newContext({ locale });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/");
    const chinese = locale.startsWith("zh");
    await expect(page.locator("html")).toHaveAttribute("lang", chinese ? "zh-CN" : "en");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(chinese ? "把每一个字，写得更好。" : "Chinese handwriting worksheets");
    await expect(page.locator("#worksheet-text")).toHaveValue("春眠不觉晓，处处闻啼鸟。");
    await expect(page.getByRole("button", { name: chinese ? "中文" : "English", exact: true })).toHaveAttribute("aria-pressed", "true");
    expect(errors).toEqual([]);
    await context.close();
  });
}

test("language switches preserve learning content and persist across navigation and reload", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "基础汉字", exact: true }).click();
  await page.locator("#worksheet-text").fill("字有无，春眠不觉晓。");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.getByText("Basic characters loaded", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle("Free Chinese worksheets · printable practice grids | Hanzis");
  await expect(page.locator("#worksheet-text")).toHaveValue("字有无，春眠不觉晓。");
  await expect(page.getByRole("navigation", { name: "Main navigation" })).not.toContainText(/[\p{Script=Han}]/u);
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Poetry", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Classical Chinese poetry", { timeout: 15_000 });
  await expect(page).toHaveTitle("Learn classical poetry · text, pinyin & notes | Hanzis");
  await page.getByRole("switch", { name: "Show pinyin" }).uncheck();
  await expect(page.locator(".poem-verses")).toContainText("床前明月光");
  const original = await page.locator(".poem-verses").textContent();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".poem-verses")).toHaveText(original!);
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page.locator(".poem-verses")).toHaveText(original!);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("读一首诗，记一段时光。");
  expect(errors).toEqual([]);
});

test("language switching still works when local storage is unavailable", async ({ browser }) => {
  const context = await browser.newContext({ locale: "ja-JP" });
  await context.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException("Blocked", "SecurityError"); };
    Storage.prototype.setItem = () => { throw new DOMException("Blocked", "SecurityError"); };
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("把每一个字，写得更好。");
  await page.getByRole("navigation", { name: "主导航" }).getByRole("link", { name: "古诗词", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await context.close();
});

test("English pages and a game round render with healthy consoles and responsive navigation", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "English", exact: true }).click();
  const routes = ["/", "/pinyin/", "/pinyin/initials/", "/pinyin/tones/", "/pinyin/practice/", "/stroke/", "/poetry/", "/poetry/chun-xiao/", "/dictionary/?q=有", "/games/", "/games/pinyin-quiz/", "/games/feihua/", "/games/poem-sort/", "/games/hanzi-match/", "/games/chengyu-chain/", "/games/chengyu-wordle/", "/about/", "/privacy/"];
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.ok(), route).toBe(true);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    if (route === "/poetry/chun-xiao/") await expect(page).toHaveTitle("春晓 · 孟浩然 · text, pinyin & translation | Hanzis");
    await expect(page.getByRole("navigation", { name: "Main navigation" })).not.toContainText(/[\p{Script=Han}]/u);
    await expect(page.locator("footer")).not.toContainText(/[\p{Script=Han}]/u);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
  }
  await page.goto("/games/pinyin-quiz/");
  await page.getByRole("radio", { name: "20 questions, untimed" }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.getByRole("button", { name: "Skip & show answer" }).click();
  await expect(page.locator("#pinyin-quiz-feedback")).toContainText("Skipped:");
  await page.getByRole("button", { name: "End round", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Round complete", exact: true })).toBeVisible();
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(axe.violations).toEqual([]);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Dictionary" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Chinese dictionary");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("English daily idiom feedback fits every cell on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/games/chengyu-wordle/");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.locator("#chengyu-wordle-input").fill("画蛇添足");
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  const rows = page.locator("ol li ul li");
  await expect(rows).toHaveCount(16);
  expect(await rows.evaluateAll(items => items.every(item => {
    const bounds = item.getBoundingClientRect();
    return [...item.querySelectorAll("span")].every(span => span.getBoundingClientRect().right <= bounds.right + 1);
  }))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("stroke information preserves its pinyin and radical when the interface switches", async ({ page }) => {
  await page.goto("/stroke/?char=无");
  const originalRadical = page.locator("dl > div").filter({ has: page.getByText("部首", { exact: true }) }).locator("dd");
  await expect(originalRadical).toHaveText(/^\p{Script=Han}$/u);
  const original = await originalRadical.textContent();
  await page.getByRole("button", { name: "English", exact: true }).click();
  const radical = page.locator("dl > div").filter({ has: page.getByText("Radical", { exact: true }) }).locator("dd");
  await expect(radical).toHaveText(original!);
  await expect(page.locator("dl > div").filter({ has: page.getByText("Pinyin", { exact: true }) }).locator("dd")).toHaveText("wú");
});
