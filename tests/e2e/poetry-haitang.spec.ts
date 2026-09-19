import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const width of [1440, 375]) {
  test(`Haitang reading, original annotations and safe long-poem worksheet at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 375 ? 812 : 900 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto("/poetry/?poem=haitang-10103");
    const article = page.getByRole("article", { name: "春江花月夜原文与注释" });
    await expect(article).toBeVisible();
    await expect(article.locator(".poem-verses")).toContainText("春江潮水连海平");
    await expect(article.getByText("来源未提供拼音", { exact: true })).toBeVisible();
    await expect(article.getByRole("switch", { name: "显示拼音" })).toHaveCount(0);
    await article.locator("summary").filter({ hasText: /^译文$/ }).click();
    await expect(article.locator("details[open]")).toContainText("春天");
    await expect(page.getByRole("navigation", { name: "诗词目录" }).getByRole("button")).toHaveCount(24);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.getByRole("heading", { name: "春江花月夜", exact: true }).last().scrollIntoViewIfNeeded();
    await page.screenshot({ path: `/tmp/hanzis-haitang-${width}.png` });
    await article.getByRole("button", { name: "选段生成字帖", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "选择字帖练习片段" });
    await expect(dialog).toContainText("单次字帖最多 200 字");
    await dialog.getByRole("textbox", { name: "练习片段" }).fill("江".repeat(201));
    await expect(dialog.getByRole("button", { name: "用选段生成字帖" })).toBeDisabled();
    await dialog.getByRole("textbox", { name: "练习片段" }).fill("春江潮水连海平，海上明月共潮生。");
    const href = await dialog.getByRole("link", { name: "用选段生成字帖" }).getAttribute("href");
    expect(new URL(href!, "http://localhost").searchParams.get("text")).toBe("春江潮水连海平，海上明月共潮生。");
    expect(errors).toEqual([]);
  });
}

test("source/dynasty/collection filters and pagination find real works without a giant DOM", async ({ page }) => {
  await page.goto("/poetry/");
  await expect(page.getByRole("status").filter({ hasText: "当前" })).toContainText("11,437");
  const nav = page.getByRole("navigation", { name: "诗词目录" });
  await expect(nav.getByRole("button")).toHaveCount(24);
  await page.getByRole("button", { name: "下一页诗词", exact: true }).click();
  await expect(page.getByText(/2 \/ \d+ 页/)).toBeVisible();
  await page.getByRole("searchbox", { name: "搜索诗词" }).fill("静夜思");
  await expect(nav.getByRole("button")).toHaveCount(2);
  await page.getByRole("radiogroup", { name: "诗词来源" }).getByRole("radio", { name: "海棠资料" }).click();
  await expect(nav.getByRole("button")).toHaveCount(1);
  await expect(page.getByRole("article")).toContainText("来源未提供拼音");
  await page.getByRole("searchbox", { name: "搜索诗词" }).fill("");
  await page.getByRole("combobox", { name: "朝代", exact: true }).click();
  await page.getByRole("option", { name: "唐", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "当前" })).toContainText("1,619");
  await page.getByRole("combobox", { name: "选集与主题" }).click();
  await page.getByRole("option", { name: /^唐诗三百首（/ }).click();
  await expect(page.getByRole("status").filter({ hasText: "当前" })).not.toContainText("1,619");
  await expect(nav.getByRole("button")).toHaveCount(24);
});

test("existing and new favorites coexist, survive reload and reopen by stable ID", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("hanzis-poetry-favorites-v1", '["jing-ye-si"]'));
  await page.goto("/poetry/?poem=haitang-10156");
  const article = page.getByRole("article", { name: "静夜思原文与注释" });
  await expect(article).toContainText("海棠诗社资料");
  await article.getByRole("button", { name: "收藏", exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("hanzis-poetry-favorites-v1")!))).toEqual(["jing-ye-si", "haitang-10156"]);
  // Remove initialization for the reload by using the same context's new page.
  const reopened = await page.context().newPage();
  await reopened.goto("/poetry/?poem=haitang-10156");
  await reopened.reload();
  await expect(reopened.getByRole("article").getByRole("button", { name: "已收藏", exact: true })).toBeVisible();
  await reopened.getByRole("radiogroup", { name: "诗词来源" }).getByRole("radio", { name: /收藏/ }).click();
  await expect(reopened.getByRole("navigation", { name: "诗词目录" }).getByRole("button")).toHaveCount(2);
  await reopened.close();
});

test("missing annotations stay absent and curated readings retain their checked pinyin", async ({ page }) => {
  await page.goto("/poetry/?poem=haitang-10033");
  await expect(page.getByRole("article")).toContainText("来源暂未提供译文。");
  await expect(page.getByRole("article")).toContainText("来源暂未提供注解。");
  await page.goto("/poetry/jing-ye-si/");
  await expect(page.getByRole("switch", { name: "显示拼音" })).toBeChecked();
  await expect(page.getByRole("article").locator("rt").first()).toContainText("chuáng");
});

test("index and detail network failures retry independently and unknown IDs show a clear error", async ({ page }) => {
  await page.route("**/poetry/haitang/index.json*", route => route.abort());
  await page.goto("/poetry/");
  await expect(page.getByText("海棠诗词索引暂时无法读取", { exact: false })).toBeVisible();
  await expect(page.getByRole("article", { name: "静夜思原文与注释" })).toBeVisible();
  await page.unroute("**/poetry/haitang/index.json*");
  await page.getByRole("button", { name: "重试诗词索引" }).click();
  await expect(page.getByRole("button", { name: "重试诗词索引" })).toHaveCount(0);
  const shard = /\/poetry\/haitang\/[0-9a-f]{2}\.json\?/;
  await page.route(shard, route => route.abort());
  await page.getByRole("searchbox", { name: "搜索诗词" }).fill("春江花月夜");
  await expect(page.getByRole("button", { name: "重新加载诗词" })).toBeVisible();
  await page.unroute(shard);
  await page.getByRole("button", { name: "重新加载诗词" }).click();
  await expect(page.getByRole("article", { name: "春江花月夜原文与注释" })).toBeVisible();
  await page.goto("/poetry/?poem=haitang-999999999");
  await expect(page.getByText("未找到链接中的作品", { exact: false })).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(0);
});

test("a search preview offers the correct stable work link and short-source recitation remains usable", async ({ page }) => {
  await page.goto("/poetry/?poem=jing-ye-si");
  await expect(page.getByRole("status").filter({ hasText: "当前" })).toContainText("11,437");
  await page.getByRole("searchbox", { name: "搜索诗词" }).fill("春江花月夜");
  const link = page.getByRole("article").getByRole("link", { name: "打开作品链接" });
  await expect(link).toHaveAttribute("href", "/poetry/?poem=haitang-10103");
  await link.click();
  await expect(page).toHaveURL(/poem=haitang-10103$/);
  await page.reload();
  await expect(page.getByRole("article", { name: "春江花月夜原文与注释" })).toBeVisible();
  await page.getByRole("article").getByRole("button", { name: "背诵练习" }).click();
  const practice = page.getByRole("dialog", { name: "背诵练习 · 春江花月夜" });
  await practice.getByRole("textbox", { name: "默写第 1 句" }).fill("春江潮水连海平海上明月共潮生");
  await practice.getByRole("button", { name: "检查答案" }).click();
  await expect(practice).toContainText("答对了");
});

test("a slow imported detail cannot replace a newly selected curated poem", async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const shard = (10103 % 128).toString(16).padStart(2, "0");
  await page.route(`**/poetry/haitang/${shard}.json*`, async route => { await gate; await route.continue(); });
  const requested = page.waitForRequest(request => request.url().includes(`/poetry/haitang/${shard}.json`));
  await page.goto("/poetry/?poem=haitang-10103");
  await requested;
  await page.getByRole("searchbox", { name: "搜索诗词" }).fill("静夜思");
  const response = page.waitForResponse(response => response.url().includes(`/poetry/haitang/${shard}.json`));
  await expect(page.getByRole("article")).toContainText("本站校对精选");
  release();
  await response;
  await expect(page.getByRole("article", { name: "静夜思原文与注释" })).toBeVisible();
  await expect(page.getByRole("article", { name: "春江花月夜原文与注释" })).toHaveCount(0);
});
