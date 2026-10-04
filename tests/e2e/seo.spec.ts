import { expect, test } from "@playwright/test";
import { poems, poemText } from "../../data/poems";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { SHARE_IMAGE } from "../../lib/seo";

test.use({ javaScriptEnabled: false });

test("all sitemap pages expose unique canonical metadata without JavaScript", async ({ page, request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const urls = [...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  expect(urls).toHaveLength(19 + poems.length);
  expect(new Set(urls).size).toBe(urls.length);
  // New public routes must not silently disappear from the sitemap.
  const appFiles = await readdir(join(__dirname, "../../app"), { recursive: true });
  const staticRoutes = appFiles.filter(file => file.endsWith("page.tsx") && !file.includes("[") && file !== "poetry/read/page.tsx")
    .map(file => `https://hanzis.com/${file.replace(/page\.tsx$/, "")}`);
  for (const url of staticRoutes) expect(urls).toContain(url);
  expect(urls).not.toContain("https://hanzis.com/poetry/read/");
  const titles = new Set<string>();
  const descriptions = new Set<string>();

  for (const url of urls) {
    const route = new URL(url).pathname;
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator('html')).toHaveAttribute("lang", "zh-CN");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", url);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", url);
    const title = await page.title();
    expect(title, route).toContain("汉字网 Hanzis");
    expect(titles.has(title), `duplicate title: ${route}`).toBeFalsy();
    titles.add(title);
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description?.length, route).toBeGreaterThan(20);
    expect(descriptions.has(description!), `duplicate description: ${route}`).toBeFalsy();
    descriptions.add(description!);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", title);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", description!);
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute("content", description!);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", SHARE_IMAGE.url);
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", SHARE_IMAGE.url);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/);
    await expect(page.locator("main h1")).toHaveCount(1);
  }

  const image = await request.get(new URL(SHARE_IMAGE.url).pathname);
  expect(image.ok()).toBeTruthy();
  expect(image.headers()["content-type"]).toContain("image/png");
  const bytes = await image.body();
  expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(bytes.readUInt32BE(16)).toBe(1200);
  expect(bytes.readUInt32BE(20)).toBe(630);

  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Sitemap: https://hanzis.com/sitemap.xml");
  await page.goto("/404.html");
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
});

test("parameter URLs keep canonical targets and the client-only reader stays noindex", async ({ page }) => {
  for (const route of ["/?text=汉字", "/dictionary/?q=春", "/poetry/?poem=jing-ye-si", "/games/chengyu-wordle/?date=2026-10-04"]) {
    await page.goto(route);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://hanzis.com${new URL(route, "https://hanzis.com").pathname}`);
  }
  await page.goto("/poetry/read/?poem=unknown");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("pinyin lessons have distinct headings and matching breadcrumb links without JavaScript", async ({ page }) => {
  const headings = new Set<string>();
  for (const route of ["", "initials/", "finals/", "syllables/", "tones/", "practice/"]) {
    await page.goto(`/pinyin/${route}`);
    const heading = await page.locator("main h1").innerText();
    expect(headings.has(heading)).toBeFalsy();
    headings.add(heading);
    expect(await page.title()).toContain(heading);
    const breadcrumb = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
    expect(breadcrumb["@type"]).toBe("BreadcrumbList");
    const last = breadcrumb.itemListElement.at(-1);
    expect(last.item).toBe(`https://hanzis.com/pinyin/${route}`);
    await expect(page.getByRole("navigation", { name: "面包屑", exact: true }).locator('[aria-current="page"]')).toHaveText(last.name);
    for (const item of breadcrumb.itemListElement.slice(0, -1)) {
      await expect(page.getByRole("navigation", { name: "面包屑", exact: true }).getByRole("link", { name: item.name, exact: true })).toHaveAttribute("href", new URL(item.item).pathname);
    }
  }
});

test("collection structured data points to visible reading and game links", async ({ page }) => {
  for (const [route, count] of [["/poetry/", poems.length], ["/games/", 6]] as const) {
    await page.goto(route);
    const data = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
    expect(data["@type"]).toBe("CollectionPage");
    expect(data.mainEntity.itemListElement).toHaveLength(count);
    for (const item of data.mainEntity.itemListElement) {
      await expect(page.locator(`main a[href="${new URL(item.url).pathname}"]`).first()).toBeVisible();
    }
  }
});

test("pinyin headings and navigation fit phone and desktop viewports", async ({ page }, testInfo) => {
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/pinyin/finals/");
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "拼音学习分类" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    await page.screenshot({ path: testInfo.outputPath(`pinyin-${width}.png`), fullPage: true });
    await page.getByRole("navigation", { name: "拼音学习分类" }).getByRole("link", { name: "声母", exact: true }).click();
    await expect(page.locator("main h1")).toHaveText("23 个声母表 · 拼音发音与例字");
  }
});

test("guides, poetry links and structured data are readable without JavaScript", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "免费在线生成汉字字帖", exact: true })).toBeVisible();
  const website = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
  expect(website).toMatchObject({ "@type": "WebSite", name: "汉字网 Hanzis", url: "https://hanzis.com/" });
  await page.goto("/stroke/");
  await expect(page.getByRole("heading", { name: "汉字笔顺查询与练习方法", exact: true })).toBeVisible();
  await page.goto("/dictionary/");
  await expect(page.getByRole("heading", { name: "在线中文字典查询方法", exact: true })).toBeVisible();
  await page.goto("/poetry/");
  const index = page.getByRole("region", { name: "唐宋古诗词阅读目录" });
  for (const poem of poems) {
    await expect(index.locator(`a[href="/poetry/${poem.slug}/"]`)).toContainText(poem.title);
  }
  await index.getByRole("link", { name: "静夜思 唐 · 李白", exact: true }).click();
  await expect(page).toHaveURL(/\/poetry\/jing-ye-si\/$/);
  await expect(page.getByRole("heading", { name: "静夜思", exact: true })).toBeVisible();
  const graph = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!)["@graph"];
  expect(graph[0]).toMatchObject({ "@type": "CreativeWork", name: "静夜思", author: { name: "李白" }, text: poemText(poems[0]) });
  expect(graph[1].itemListElement.map((item: { item: string }) => item.item)).toEqual([
    "https://hanzis.com/", "https://hanzis.com/poetry/", "https://hanzis.com/poetry/jing-ye-si/",
  ]);
  await page.getByRole("navigation", { name: "面包屑" }).getByRole("link", { name: "古诗词", exact: true }).click();
  await expect(page).toHaveURL(/\/poetry\/$/);
});
