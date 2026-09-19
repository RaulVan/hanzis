import { expect, test, type Locator } from "@playwright/test";

async function expectLocalClips(stage: Locator, strokeCount: number) {
  await expect(stage.locator("path[clip-path]")).toHaveCount(strokeCount * 3);
  const invalid = await stage.locator("path[clip-path]").evaluateAll(paths => paths.flatMap(path => {
    const value = path.getAttribute("clip-path")!;
    const url = new URL(value.slice(4, -1).replace(/^"|"$/g, ""), location.href);
    const documentURL = new URL(location.href);
    documentURL.hash = "";
    const id = url.hash.slice(1);
    url.hash = "";
    return url.href !== documentURL.href || !document.getElementById(id) ? [value] : [];
  }));
  expect(invalid, "Every stroke must clip against a shape in the current document").toEqual([]);
}

for (const width of [1440, 375]) {
  test(`cached character changes keep SVG clipping and learning controls working at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 375 ? 812 : 1000 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto("/stroke/?char=%E8%AF%B4");
    await expect(page.getByText("画布已准备好", { exact: true })).toBeVisible();
    for (const char of ["学", "说", "学", "说"]) {
      await page.getByRole("button", { name: `学习“${char}”字`, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`char=${encodeURIComponent(char)}$`));
      const stage = page.getByRole("group", { name: `“${char}”字的笔顺动画和书写区域` });
      await expect(stage).toBeVisible();
      await expect(page.getByText("画布已准备好", { exact: true })).toBeVisible();
      await expectLocalClips(stage, char === "说" ? 9 : 8);
    }
    const stage = page.getByRole("group", { name: "“说”字的笔顺动画和书写区域" });
    const steps = page.getByRole("list", { name: "“说”字的逐笔分解" });
    await expect(steps.getByRole("listitem")).toHaveCount(9);
    await expect(steps.getByRole("listitem").last().locator("g path")).toHaveCount(9);
    await page.getByRole("button", { name: "播放动画", exact: true }).click();
    await expect(page.getByText("动画正在播放", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "暂停", exact: true }).click();
    await expect(page.getByText("动画已暂停", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "继续播放", exact: true }).click();
    await expect(page.getByText("画布已准备好", { exact: true })).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "开始书写测验", exact: true }).click();
    await page.getByRole("button", { name: "提示下一笔", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("已示范当前一笔");
    await expectLocalClips(stage, 9);
    await stage.scrollIntoViewIfNeeded();
    const data = await (await page.request.get("/hanzi/8bf4.json")).json();
    const points = await stage.locator("path[clip-path]").first().evaluate((path, median: number[][]) => {
      const matrix = (path as SVGGraphicsElement).getScreenCTM()!;
      return median.map(([x, y]) => {
        const point = new DOMPoint(x, y).matrixTransform(matrix);
        return { x: point.x, y: point.y };
      });
    }, data.medians[0]);
    await page.mouse.move(points[0].x, points[0].y);
    await page.mouse.down();
    for (const point of points.slice(1)) await page.mouse.move(point.x, point.y, { steps: 4 });
    await page.mouse.up();
    await expect(page.getByRole("status")).toContainText("已完成 1 / 9 笔");
    await page.getByRole("button", { name: "退出练习", exact: true }).click();
    await expect(page.getByText("画布已准备好", { exact: true })).toBeVisible();
    await stage.screenshot({ path: `/tmp/hanzis-stroke-fixed-${width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
