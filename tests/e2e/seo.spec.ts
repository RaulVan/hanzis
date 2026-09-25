import { expect, test } from "@playwright/test";
import { poems, poemText } from "../../data/poems";

test.use({ javaScriptEnabled: false });

test("all sitemap pages expose unique canonical metadata without JavaScript", async ({ page, request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const urls = [...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  expect(urls).toHaveLength(13 + poems.length);
  expect(new Set(urls).size).toBe(urls.length);
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
    await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/);
    await expect(page.locator("main h1")).toHaveCount(1);
  }

  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Sitemap: https://hanzis.com/sitemap.xml");
  await page.goto("/404.html");
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
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
