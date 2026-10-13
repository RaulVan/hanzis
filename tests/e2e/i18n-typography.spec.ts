import { expect, test } from "./fixtures";

for (const width of [1440, 375]) {
  test(`English typography keeps pinyin and Chinese learning content intact at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 375 ? 812 : 1000 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto("/pinyin/");
    await page.getByRole("button", { name: "English", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Learn Mandarin pinyin");
    await expect(page).toHaveTitle("Learn Mandarin pinyin | Hanzis");
    const fonts = await page.evaluate(() => {
      const heading = getComputedStyle(document.querySelector("h1")!);
      return { body: getComputedStyle(document.body).fontFamily, heading: heading.fontFamily, spacing: parseFloat(heading.letterSpacing), pinyin: getComputedStyle(document.querySelector(".pinyin-samples")!).fontFamily };
    });
    expect(fonts.body).toContain("system-ui");
    expect(fonts.heading).toBe(fonts.body);
    expect(fonts.spacing).toBeLessThan(0);
    expect(fonts.pinyin).toContain("Hanzis Pinyin Sans");
    expect(await page.locator(".pinyin-samples span").evaluateAll(samples => samples.every(sample => {
      const bounds = sample.getBoundingClientRect();
      const parent = sample.parentElement!.getBoundingClientRect();
      return bounds.left >= parent.left - 1 && bounds.right <= parent.right + 1;
    }))).toBe(true);
    await page.screenshot({ path: `/tmp/hanzis-pinyin-polished-${width}.png` });

    await page.getByRole("link", { name: "Learn initials", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pinyin initials");
    await page.getByRole("radio", { name: "m", exact: true }).click();
    await expect(page.getByText("mō", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Listen to all examples" })).toBeVisible();
    await page.getByRole("button", { name: "中文", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("23 个声母表 · 拼音发音与例字");
    expect(await page.locator("h1").evaluate(heading => getComputedStyle(heading).fontFamily)).toContain("Noto Serif SC");
    await expect(page.getByText("mō", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "English", exact: true }).click();
    await page.goto("/stroke/");
    await page.getByRole("textbox", { name: "Chinese character", exact: true }).fill("好");
    await page.getByRole("button", { name: "Show stroke order", exact: true }).click();
    await expect(page.getByText("Canvas ready", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Play animation", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Animation is playing");
    await page.getByRole("button", { name: "Pause", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Animation is paused");
    await page.getByRole("button", { name: "Resume", exact: true }).click();
    await expect(page.getByText("Canvas ready", { exact: true })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: "Start writing", exact: true }).click();
    await page.getByRole("button", { name: "Show next stroke", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("This stroke has been demonstrated");
    await expect(page.locator("dl")).toContainText("hǎo");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
