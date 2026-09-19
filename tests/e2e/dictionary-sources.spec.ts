import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const viewport of [{ width: 1440, height: 900 }, { width: 375, height: 812 }]) {
  test(`four dictionary sources preserve readings and fit ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/dictionary/?q=学习");
    const article = page.getByRole("article", { name: "学习的释义" });
    await expect(article.getByText("《國語辭典簡編本》原文", { exact: false })).toBeVisible();
    await article.locator("summary").filter({ hasText: "《重編國語辭典修訂本》" }).click();
    const revised = article.getByRole("region", { name: "修订本释义" });
    await expect(revised.getByText("xué xi", { exact: false }).first()).toBeVisible();
    await expect(revised.getByText("xué xí", { exact: false }).first()).toBeVisible();
    await expect(revised.getByText("受教研習。", { exact: true })).toBeVisible();
    await article.locator("summary").filter({ hasText: "第三方整理字典" }).click();
    await expect(article.getByRole("region", { name: "第三方整理释义" })).toContainText("学习");
    await article.locator("summary").filter({ hasText: "开放词库释义" }).click();
    await expect(article.getByText("来源：cnchar-data", { exact: false })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
    await article.screenshot({ path: `/tmp/hanzis-dictionary-${viewport.width}.png` });
    expect(errors).toEqual([]);
  });
}

test("revised-only terms are discoverable and open automatically", async ({ page }) => {
  await page.goto("/dictionary/?q=一條藤兒&kind=word");
  await expect(page.getByRole("navigation", { name: "查询结果" }).getByRole("button", { name: "一條藤兒", exact: true })).toBeVisible();
  const revised = page.getByRole("region", { name: "修订本释义" });
  await expect(revised).toBeVisible();
  await expect(revised.getByRole("heading", { name: "一條藤兒", exact: true })).toBeVisible();
});

test("third-party character and idiom records expose their additional original fields", async ({ page }) => {
  await page.goto("/dictionary/?q=嗄&kind=character");
  await page.locator("summary").filter({ hasText: "第三方整理字典" }).click();
  const thirdParty = page.getByRole("region", { name: "第三方整理释义" });
  await expect(thirdParty.getByText("汉字", { exact: true }).first()).toBeVisible();
  await thirdParty.getByText("更多原文资料", { exact: true }).first().click();
  await expect(thirdParty.getByText("声音嘶哑的", { exact: false }).last()).toBeVisible();
  await page.goto("/dictionary/?q=画蛇添足&kind=idiom");
  await page.locator("summary").filter({ hasText: "第三方整理字典" }).click();
  await expect(page.getByRole("region", { name: "第三方整理释义" }).getByText("成语", { exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "第三方整理释义" }).getByText("出处", { exact: true })).toBeVisible();
});

test("a missing source index reports incomplete results and can recover", async ({ page }) => {
  const pattern = "**/dictionary/revised/index.json";
  await page.route(pattern, route => route.abort());
  await page.goto("/dictionary/?q=学习");
  await expect(page.getByText("修订本索引暂不可用", { exact: false })).toBeVisible();
  await expect(page.getByRole("article", { name: "学习的释义" })).toBeVisible();
  await page.unroute(pattern);
  await page.getByRole("button", { name: "重试缺失来源" }).click();
  await expect(page.getByText("修订本索引暂不可用", { exact: false })).toHaveCount(0);
  await expect(page.getByRole("article", { name: "学习的释义" })).toBeVisible();
});

test("a missing detail source leaves other definitions readable and retry restores it", async ({ page }) => {
  const pattern = /\/dictionary\/xinhua\/[0-9a-f]{2}\.json$/;
  await page.route(pattern, route => route.abort());
  await page.goto("/dictionary/?q=学习");
  await expect(page.getByText("第三方整理暂时无法读取", { exact: false })).toBeVisible();
  await expect(page.getByText("《國語辭典簡編本》原文", { exact: false })).toBeVisible();
  await page.unroute(pattern);
  await page.getByRole("button", { name: "重试缺失释义" }).click();
  await expect(page.locator("summary").filter({ hasText: "第三方整理字典" })).toBeVisible();
  await expect(page.getByRole("button", { name: "重试缺失释义" })).toHaveCount(0);
});

test("complete detail failure is recoverable and is not shown as an absent definition", async ({ page }) => {
  const pattern = /\/dictionary\/(?:moe\/|revised\/|xinhua\/)?[0-9a-f]{2}\.json$/;
  await page.route(pattern, route => route.abort());
  await page.goto("/dictionary/?q=学");
  await expect(page.getByText("释义数据暂时无法读取", { exact: false })).toBeVisible();
  await expect(page.getByText("当前词库还没有", { exact: false })).toHaveCount(0);
  await page.unroute(pattern);
  await page.getByRole("button", { name: "重新加载", exact: true }).click();
  await expect(page.getByRole("article", { name: "学的释义" })).toBeVisible();
});
