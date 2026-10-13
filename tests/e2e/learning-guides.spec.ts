import { expect, test } from "./fixtures";

for (const width of [1440, 375]) {
  test(`poem learning answer and writing task work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/poetry/jing-ye-si/");
    const guide = page.getByRole("region", { name: "读懂这首诗" });
    await expect(guide).toBeVisible();
    await expect(guide.getByText("从动作读懂思乡", { exact: true })).toBeVisible();
    const details = guide.locator("details");
    await expect(details).not.toHaveAttribute("open");
    await details.locator("summary").click();
    await expect(details).toHaveAttribute("open", "");
    await expect(details).toContainText("抬头时望见明月");
    await expect(guide.getByRole("link", { name: "《春晓》" })).toHaveAttribute("href", "/poetry/chun-xiao/");
    await guide.getByRole("link", { name: "用选字生成字帖" }).click();
    await expect(page.getByRole("textbox", { name: "练习内容" })).toHaveValue("明月故乡");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("aspiration and umlaut exercises explain mistakes and reset", async ({ page }) => {
  await page.goto("/pinyin/initials/#aspiration");
  const aspiration = page.locator("#aspiration");
  await aspiration.getByRole("radio", { name: "bā", exact: true }).check();
  await expect(aspiration.locator("fieldset").getByRole("status")).toContainText("再比较一下。");
  await aspiration.getByRole("radio", { name: "pā", exact: true }).check();
  await expect(aspiration.locator("fieldset").getByRole("status")).toContainText("答对了。");
  await aspiration.getByRole("button", { name: "重新练习本单元" }).click();
  await expect(aspiration.getByRole("radio", { checked: true })).toHaveCount(0);
  await page.goto("/pinyin/finals/#u-spelling");
  const spelling = page.locator("#u-spelling");
  await spelling.getByRole("radio", { name: "qv4", exact: true }).check();
  await expect(spelling.locator("fieldset").getByRole("status")).toContainText("不是书面拼音");
  await spelling.getByRole("radio", { name: "qù", exact: true }).check();
  await spelling.getByRole("radio", { name: "nǚ", exact: true }).check();
  await expect(spelling.locator("fieldset").getByRole("status").filter({ hasText: "答对了。" })).toHaveCount(2);
  await expect(spelling.getByRole("link", { name: "进入拼音快答（综合练习）" })).toHaveAttribute("href", "/games/pinyin-quiz/");
});

test("new teaching explanations follow saved English preference", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("hanzis-language", "en"));
  await page.goto("/poetry/chun-xiao/");
  await expect(page.getByRole("heading", { name: "Understand this poem" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "春晓", exact: true })).toBeVisible();
  await page.goto("/pinyin/finals/#u-spelling");
  const spelling = page.locator("#u-spelling");
  await expect(spelling.getByRole("heading", { name: "Spelling ü and typing it" })).toBeVisible();
  await spelling.getByRole("radio", { name: "nǚ", exact: true }).check();
  await expect(spelling.locator("fieldset").getByRole("status")).toContainText("After n, keep the dots on ü.");
});
