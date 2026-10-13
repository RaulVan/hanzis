import { test, expect } from "./fixtures";

test("fresh scenario, retained settings, explicit application, undo and refresh", async ({ page }) => {
  await page.goto("/worksheets/mizi/");
  const input = page.getByRole("textbox", { name: "练习内容" });
  await expect(input).toHaveValue("大木人天");
  await input.fill("自己的练习");
  await page.goto("/worksheets/tianzi/");
  await expect(input).toHaveValue("自己的练习");
  await page.getByRole("button", { name: "应用场景预设", exact: true }).click();
  await expect(input).toHaveValue("春眠不觉晓");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("hanzis-worksheet-settings")!).state.config.gridType)).toBe("tian");
  await page.getByRole("button", { name: "撤销预设", exact: true }).click();
  await expect(input).toHaveValue("自己的练习");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("hanzis-worksheet-settings")!).state.config.gridType)).toBe("mi");
  await page.reload();
  await expect(input).toHaveValue("自己的练习");
});

test("poem selector applies full poem only on request and keeps edits after reload", async ({ page }) => {
  await page.goto("/worksheets/poetry/");
  const input = page.getByRole("textbox", { name: "练习内容" });
  await expect(input).toHaveValue(/床前明月光/);
  await page.getByLabel("选择练习古诗").selectOption("yong-e");
  await expect(input).toHaveValue(/床前明月光/);
  await expect(page.getByRole("link", { name: "阅读所选古诗" })).toHaveAttribute("href", "/poetry/yong-e/");
  await page.getByRole("button", { name: "应用场景预设", exact: true }).click();
  await expect(input).toHaveValue("鹅，鹅，鹅，\n曲项向天歌。\n白毛浮绿水，\n红掌拨清波。");
  await input.fill("鹅掌清波");
  await page.reload();
  await expect(input).toHaveValue("鹅掌清波");
});


test("unreadable stored settings are preserved when visiting a scenario", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("hanzis-worksheet-settings", "unreadable-original"));
  await page.goto("/worksheets/mizi/");
  await expect(page.getByText("保存的设置暂时无法读取，原记录未改动。本次设置不会自动保存，请在关闭页面前导出字帖。")).toBeVisible();
  await page.getByRole("button", { name: "应用场景预设", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "练习内容" })).toHaveValue("大木人天");
  expect(await page.evaluate(() => localStorage.getItem("hanzis-worksheet-settings"))).toBe("unreadable-original");
});

test("scenario export produces a real PNG and complete print document", async ({ page }) => {
  await page.addInitScript(() => {
    window.print = () => document.documentElement.setAttribute("data-print-called", "true");
  });
  await page.goto("/worksheets/tianzi/");
  const png = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出第 1 页 PNG" }).click();
  const download = await png;
  const { readFile } = await import("node:fs/promises");
  const bytes = await readFile((await download.path())!);
  expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(bytes.readUInt32BE(16)).toBeGreaterThan(2000);
  await page.getByRole("button", { name: "打印字帖", exact: true }).click();
  const printFrame = page.frameLocator('iframe[title="字帖打印"]');
  await expect(printFrame.locator("html")).toHaveAttribute("data-print-called", "true");
  await expect(printFrame.locator("img")).toHaveCount(1);
  expect(await printFrame.locator("img").evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 2000)).toBe(true);
  expect(await printFrame.locator("style").textContent()).toContain("size:210mm 297mm");
  await page.getByRole("textbox", { name: "练习内容" }).fill("字".repeat(201));
  await expect(page.getByRole("button", { name: "导出 PDF" })).toBeDisabled();
});
