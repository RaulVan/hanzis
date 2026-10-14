import { test, expect, type Page } from "./fixtures";
import { AxeBuilder } from "@axe-core/playwright";

async function drawStroke(page: Page, index: number) {
  const stage = page.getByRole("group", { name: "“床”字的笔顺动画和书写区域" });
  await stage.scrollIntoViewIfNeeded();
  const data = await (await page.request.get("/hanzi/5e8a.json")).json();
  const points = await stage.locator("path[clip-path]").first().evaluate((path, median: number[][]) => {
    const matrix = (path as SVGGraphicsElement).getScreenCTM()!;
    return median.map(([x, y]) => {
      const point = new DOMPoint(x, y).matrixTransform(matrix);
      return { x: point.x, y: point.y };
    });
  }, data.medians[index]);
  await page.mouse.move(points[0].x, points[0].y);
  await page.mouse.down();
  for (const point of points.slice(1)) await page.mouse.move(point.x, point.y, { steps: 4 });
  await page.mouse.up();
}

test("stroke practice keeps completed strokes and accepts input after rotating", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/stroke/?char=床");
  await page.getByRole("button", { name: "开始书写测验", exact: true }).click();
  await drawStroke(page, 0);
  await expect(page.getByRole("status")).toContainText("已完成 1 / 7 笔");
  await page.setViewportSize({ width: 812, height: 375 });
  await expect(page.getByRole("button", { name: "退出练习", exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("已完成 1 / 7 笔");
  await drawStroke(page, 1);
  await expect(page.getByRole("status")).toContainText("已完成 2 / 7 笔");
});

test("keyboard demonstration advances separately from practice scores", async ({ page }) => {
  await page.goto("/stroke/?char=床");
  const next = page.getByRole("button", { name: "下一笔", exact: true });
  await expect(next).toBeEnabled();
  await next.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText("逐笔查看：第 2 / 7 笔，仅演示，不计入测验。");
  await page.getByRole("button", { name: "上一笔", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("第 1 / 7 笔");
  await page.getByRole("button", { name: "开始书写测验", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("已完成 0 / 7 笔");
  await expect(next).toBeDisabled();
});

test("dictionary selection and result page survive reload and browser back", async ({ page }) => {
  await page.goto("/dictionary/?q=床");
  const results = page.getByRole("navigation", { name: "查询结果", exact: true });
  await results.getByRole("button", { name: "临床", exact: true }).click();
  await expect(page).toHaveURL(/entry=%E4%B8%B4%E5%BA%8A/);
  await page.reload();
  await expect(page.getByRole("article", { name: "临床的释义", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "下一页结果", exact: true }).click();
  const selected = await results.locator('[aria-pressed="true"]').innerText();
  await page.reload();
  await expect(page.getByRole("article", { name: `${selected}的释义`, exact: true })).toBeVisible();
  await expect(page.getByText("2 / 22 页", { exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("article", { name: "临床的释义", exact: true })).toBeVisible();
});

test("invalid pinyin is an editable field error rather than a retry loop", async ({ page }) => {
  await page.goto("/dictionary/?q=zzzzzzzzzzz");
  const input = page.getByRole("searchbox", { name: "汉字、词语或拼音", exact: true });
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("alert").filter({ hasText: "请输入一个有效的拼音音节" })).toBeVisible();
  await expect(page.getByRole("button", { name: "重新查询", exact: true })).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText("spellInfo");
  await input.fill("xue");
  await page.getByRole("button", { name: "查询", exact: true }).click();
  await expect(page.getByRole("navigation", { name: "查询结果", exact: true }).getByRole("button").first()).toBeVisible();
  await expect(input).toHaveAttribute("aria-invalid", "false");
});

test("dictionary network failure still offers a working retry", async ({ page }) => {
  const pattern = /\/dictionary\/(?:[^/]+\/)?index\.json$/;
  await page.route(pattern, route => route.fulfill({ status: 503, body: "unavailable" }));
  await page.goto("/dictionary/?q=床");
  await page.getByRole("button", { name: "重新查询", exact: true }).waitFor();
  await page.unroute(pattern);
  await page.getByRole("button", { name: "重新查询", exact: true }).click();
  await expect(page.getByRole("article", { name: "床的释义", exact: true })).toBeVisible();
});

test("mobile preview can zoom, scroll, change pages and restore focus", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("textbox", { name: "练习内容", exact: true }).fill("天地玄黄宇宙洪荒日月盈昃辰宿列张寒来暑往");
  await page.getByRole("link", { name: "查看预览", exact: true }).click();
  await expect(page.locator("#worksheet-preview-title")).toBeFocused();
  const trigger = page.getByRole("button", { name: "放大预览", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "字帖大图预览" });
  const scroll = dialog.getByRole("region", { name: "可滚动的字帖大图" });
  await expect(dialog.getByRole("status")).toHaveText("100%");
  expect(await scroll.evaluate(node => node.scrollWidth > node.clientWidth)).toBe(true);
  await dialog.getByRole("button", { name: "放大预览比例", exact: true }).click();
  await expect(dialog.getByRole("status")).toHaveText("125%");
  await dialog.getByRole("button", { name: "适应宽度", exact: true }).click();
  expect(await scroll.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
  const fitWidth = (await dialog.getByRole("img").boundingBox())!.width;
  await dialog.getByRole("button", { name: "缩小预览", exact: true }).click();
  expect((await dialog.getByRole("img").boundingBox())!.width).toBeLessThan(fitWidth);
  await dialog.getByRole("button", { name: "下一页", exact: true }).click();
  await expect(dialog.getByRole("img")).toHaveAttribute("aria-label", /第 2 页/);
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("button", { name: "导出第 2 页 PNG", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("mobile stroke picker is compact and scenario navigation stays active", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/stroke/?char=床");
  const play = page.getByRole("button", { name: "播放动画", exact: true });
  await expect(play).toBeEnabled();
  expect((await play.boundingBox())!.y).toBeLessThan(812);
  await page.getByRole("button", { name: "展开常用字", exact: true }).click();
  await page.getByRole("button", { name: "学习“说”字", exact: true }).click();
  await expect(page).toHaveURL(/char=%E8%AF%B4/);
  await page.goto("/worksheets/mizi/");
  await page.getByRole("button", { name: "打开导航", exact: true }).click();
  await expect(page.getByRole("navigation", { name: "移动端主导航" }).getByRole("link", { name: "字帖生成", exact: true })).toHaveAttribute("aria-current", "page");
});
