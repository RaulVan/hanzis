import { expect, test } from "@playwright/test";

for (const width of [1440, 375]) {
  test(`automatic pinyin toggles, keeps corrected readings and persists at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 375 ? 812 : 1000 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    const pinyinRequests: string[] = [];
    page.on("request", request => { if (request.url().includes("/poetry/pinyin/")) pinyinRequests.push(request.url()); });
    await page.goto("/poetry/?poem=haitang-10133");
    const article = page.getByRole("article", { name: "咏鹅原文与注释" });
    const toggle = article.getByRole("switch", { name: "显示拼音" });
    await expect(toggle).not.toBeChecked();
    await expect(article.locator("rt")).toHaveCount(0);
    expect(pinyinRequests).toHaveLength(0);
    await toggle.click();
    await expect(article.locator("ruby").filter({ hasText: "曲" }).locator("rt")).toHaveText("qū");
    await expect(article).toContainText("自动注音，部分多音字待校对");
    await page.getByRole("searchbox", { name: "搜索诗词" }).fill("早发白帝城");
    await page.getByRole("navigation", { name: "诗词目录" }).getByRole("button").last().click();
    await expect(page.getByRole("article").getByRole("switch", { name: "显示拼音" })).toBeChecked();
    await expect(page.getByRole("article").locator("rt").first()).toHaveText("zhāo");
    await expect(page.getByRole("article").locator("ruby").filter({ hasText: "还" }).locator("rt")).toHaveText("huán");
    await page.reload();
    await expect(page.getByRole("article").locator("rt").first()).toHaveText("zhāo");
    await page.getByRole("article").screenshot({ path: `/tmp/hanzis-poetry-pinyin-${width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("article").getByRole("switch", { name: "显示拼音" }).click();
    await expect(page.getByRole("article").locator("rt")).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole("article").getByRole("switch", { name: "显示拼音" })).not.toBeChecked();
    expect(errors).toEqual([]);
  });
}

test("pinyin failures preserve reading, retry, reject mismatched assets and keep curated pinyin", async ({ page }) => {
  await page.route("**/poetry/pinyin/*.json*", route => route.abort());
  await page.goto("/poetry/?poem=haitang-10103");
  await page.getByRole("switch", { name: "显示拼音" }).click();
  await expect(page.getByRole("button", { name: "重试拼音" })).toBeVisible();
  await expect(page.locator(".poem-verses")).toContainText("春江潮水连海平");
  await page.unroute("**/poetry/pinyin/*.json*");
  await page.route("**/poetry/pinyin/*.json*", route => route.fulfill({ json: { revision: "stale", entries: {} } }));
  await page.getByRole("button", { name: "重试拼音" }).click();
  await expect(page.getByText("正在加载拼音", { exact: false })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "重试拼音" })).toBeVisible();
  await expect(page.locator(".poem-verses rt")).toHaveCount(0);
  await page.unroute("**/poetry/pinyin/*.json*");
  await page.getByRole("button", { name: "重试拼音" }).click();
  await expect(page.locator(".poem-verses rt").first()).toHaveText("chūn");
  await page.goto("/poetry/jing-ye-si/");
  await expect(page.locator(".poem-verses rt").first()).toHaveText("chuáng");
  await expect(page.getByRole("article")).not.toContainText("自动注音");
});

test("partial readings and long prose keep text and remain usable with pinyin enabled", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/poetry/?poem=haitang-310785");
  await page.getByRole("switch", { name: "显示拼音" }).click();
  await expect(page.getByRole("article")).toContainText("本篇有 2 个字暂缺读音");
  await page.goto("/poetry/?poem=haitang-640168");
  await expect(page.getByRole("heading", { name: "三国志 · 魏书 · 文帝纪", exact: true }).last()).toBeVisible();
  await expect(page.locator(".poem-verses rt").first()).toBeAttached({ timeout: 20_000 });
  expect(await page.locator(".poem-verses rt").count()).toBeGreaterThan(10000);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("switch", { name: "显示拼音" }).click();
  await expect(page.locator(".poem-verses rt")).toHaveCount(0);
  await expect(page.locator(".poem-verses")).toContainText("文帝");
});

test("blocked storage and a late pinyin response do not override a newer selection", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Blocked", "SecurityError"); } }));
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/poetry/pinyin/*.json*", async route => { await gate; await route.continue(); });
  await page.goto("/poetry/?poem=haitang-10133");
  const requested = page.waitForRequest(request => request.url().includes("/poetry/pinyin/"));
  await page.getByRole("switch", { name: "显示拼音" }).click();
  await requested;
  await expect(page.getByText("正在加载拼音", { exact: false })).toBeVisible();
  await page.getByRole("switch", { name: "显示拼音" }).click();
  await expect(page.getByText("正在加载拼音", { exact: false })).toHaveCount(0);
  await page.getByRole("searchbox", { name: "搜索诗词" }).fill("静夜思");
  await expect(page.getByRole("article", { name: "静夜思原文与注释" })).toBeVisible();
  const response = page.waitForResponse(response => response.url().includes("/poetry/pinyin/"));
  release();
  await response;
  await expect(page.getByRole("article").getByRole("switch", { name: "显示拼音" })).not.toBeChecked();
  await expect(page.getByRole("article").locator("rt")).toHaveCount(0);
  await expect(page.getByRole("article")).toContainText("床前明月光");
});
