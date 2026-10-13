import { expect, test } from "./fixtures";

const labels = ["汉字笔顺", "中文字典", "古诗词", "拼音学习", "汉字游戏"];
const routes = ["/stroke/", "/dictionary/", "/poetry/", "/pinyin/", "/games/"];
for (const width of [1440, 375]) {
  test(`five navigation entries and copyright flow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/about/");
    if (width < 768) await page.getByRole("button", { name: "打开导航" }).click();
    const nav = page.getByRole("navigation", { name: width < 768 ? "移动端主导航" : "主导航", exact: true });
    await expect(nav.getByRole("link")).toHaveText(labels);
    expect(await nav.getByRole("link").evaluateAll(links => links.map(link => link.getAttribute("href")))).toEqual(routes);
    await page.getByRole("link", { name: "版权说明", exact: true }).click();
    await expect(page).toHaveURL(/\/about\/copyright\/$/);
    await expect(page.getByRole("link", { name: "第三方资料说明", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("link", { name: "汉字网首页", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
  });
}

test("feedback is editable, copied locally and only prepares mail", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/about/?text=private-text");
  await page.getByRole("button", { name: "报告问题" }).click();
  const dialog = page.getByRole("dialog");
  const input = dialog.getByRole("textbox", { name: "反馈文本" });
  await expect(input).toHaveValue(/内容标识：about/);
  expect(await input.inputValue()).not.toContain("private-text");
  const draft = (await input.inputValue()) + "测试：释义建议";
  await input.fill(draft);
  const mail = new URL((await dialog.getByRole("link", { name: "打开邮件草稿" }).getAttribute("href"))!);
  expect(mail.pathname).toBe("f35j10@gmail.com");
  expect(mail.searchParams.get("body")).toBe(draft);
  await dialog.getByRole("button", { name: "复制反馈文本" }).click();
  await expect(dialog.getByRole("status")).toHaveText("已复制反馈文本，尚未发送。");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(draft);
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("denied"); } } }));
  await dialog.getByRole("button", { name: "复制反馈文本" }).click();
  await expect(dialog.getByRole("status")).toHaveText("无法自动复制，请选中文本手动复制。");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.getByRole("button", { name: "Report an issue", exact: true }).click();
  await expect(dialog.getByRole("textbox", { name: "Feedback text" })).toHaveValue(/Content ID/);

});

test("representative pages load without ad documents or scripts", async ({ page, request }) => {
  const requests: string[] = [];
  page.on("request", req => requests.push(req.url()));
  for (const route of ["/", "/stroke/?char=床", "/dictionary/?q=床", "/poetry/jing-ye-si/", "/pinyin/", "/games/", "/about/"]) {
    await page.goto(route);
    await expect(page.locator('iframe[src*="/ads/"],script[src*="adsterra"]')).toHaveCount(0);
    await expect(page.locator('meta[name="google-adsense-account"]')).toHaveCount(1);
  }
  expect(requests.filter(url => /adsterra|\/ads\/banner|effectivegatecpm|highperformanceformat/.test(url))).toEqual([]);
  expect((await request.get("/ads/banner.html")).status()).toBe(404);
  expect((await request.get("/licenses/NOTICE.txt")).ok()).toBe(true);
  await page.goto("/about/copyright/");
  const licenses = await page.locator('a[href^="/licenses/"]').evaluateAll(links => links.map(link => link.getAttribute("href")!));
  for (const license of licenses) expect((await request.get(license)).ok(), license).toBe(true);

});
