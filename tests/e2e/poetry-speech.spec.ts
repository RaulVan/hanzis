import { expect, test, type Page } from "@playwright/test";

declare global {
  interface Window {
    speechTest: {
      texts: string[];
      boundary: (index: number, length?: number, name?: string) => void;
      end: () => void;
      fail: () => void;
      late: () => void;
    };
  }
}

// Deterministic system-voice events test synchronization, not audible engine quality.
async function mockSpeech(page: Page) {
  await page.addInitScript(() => {
    let current: SpeechSynthesisUtterance;
    let late = () => {};
    const texts: string[] = [];
    Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: class extends EventTarget {
      text: string;
      constructor(text: string) { super(); this.text = text; }
    } });
    const speechEvent = (type: string, values: object) => Object.assign(new Event(type), values) as SpeechSynthesisEvent;
    const voice = { lang: "zh-CN", name: "Test Chinese", default: true, localService: true, voiceURI: "test" };
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: Object.assign(new EventTarget(), {
      getVoices: () => [voice],
      speak: (utterance: SpeechSynthesisUtterance) => {
        current = utterance; texts.push(utterance.text);
        const boundary = utterance.onboundary, end = utterance.onend;
        late = () => {
          boundary?.call(utterance, speechEvent("boundary", { utterance, charIndex: 4, charLength: 1, name: "word" }));
          end?.call(utterance, speechEvent("end", { utterance }));
        };
      },
      cancel: () => {},
    }) });
    window.speechTest = {
      texts,
      boundary: (index, length = 1, name = "word") => current.onboundary?.(speechEvent("boundary", { utterance: current, charIndex: index, charLength: length, name })),
      end: () => current.onend?.(speechEvent("end", { utterance: current })),
      fail: () => current.onerror?.(Object.assign(new Event("error"), { utterance: current, error: "synthesis-failed" }) as SpeechSynthesisErrorEvent),
      late: () => late(),
    };
  });
}
const red = "rgb(180, 67, 53)";

for (const width of [1440, 375]) test(`poetry read progress uses solid theme red, survives pinyin toggles and resets on replay at ${width}px`, async ({ page }) => {
  await mockSpeech(page);
  await page.setViewportSize({ width, height: width === 375 ? 812 : 1000 });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/poetry/?poem=haitang-10095");
  await expect(page).toHaveTitle(/古诗词/);
  const article = page.getByRole("article", { name: "望岳原文与注释" });
  const verses = article.locator(".poem-verses");
  await article.getByRole("switch", { name: "显示拼音" }).click();
  await expect(verses.locator("rt").first()).toBeVisible();
  await article.getByRole("button", { name: "朗读", exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.speechTest.texts[0])).toBe("岱宗夫如何？");
  await page.evaluate(() => window.speechTest.boundary(0, 6, "sentence"));
  await expect(verses.locator('[data-read="true"]')).toHaveCount(0);
  await page.evaluate(() => window.speechTest.boundary(0, 1));
  await expect(verses.locator('[data-read="true"]')).toHaveCount(1);
  await expect(verses.locator('[data-read="true"] ruby')).toHaveCSS("color", red);
  await expect(verses.locator('[data-read="true"] rt')).toHaveCSS("color", red);
  await expect(verses.locator('ruby').nth(1)).not.toHaveCSS("color", red);
  await page.evaluate(() => window.speechTest.boundary(2, 1));
  await expect(verses.locator('[data-read="true"]')).toHaveCount(3);
  await page.evaluate(() => { window.speechTest.boundary(0); window.speechTest.boundary(999); });
  await expect(verses.locator('[data-read="true"]')).toHaveCount(3);
  await page.evaluate(() => window.speechTest.end());
  await expect.poll(() => page.evaluate(() => window.speechTest.texts.length)).toBe(2);
  await expect(verses.locator('[data-read="true"]')).toHaveCount(6);
  await page.evaluate(() => window.speechTest.boundary(1));
  await expect(verses.locator('[data-read="true"]')).toHaveCount(8);
  await article.screenshot({ path: `/tmp/hanzis-poetry-speech-${width}.png` });
  await article.getByRole("switch", { name: "显示拼音" }).click();
  await expect(verses.locator('[data-read="true"]')).toHaveText("岱宗夫如何？齐鲁");
  await expect(verses.locator('[data-read="true"]')).toHaveCSS("color", red);
  await article.getByRole("button", { name: "停止朗读" }).click();
  await page.evaluate(() => window.speechTest.late());
  await expect(verses.locator('[data-read="true"]')).toHaveText("岱宗夫如何？齐鲁");
  expect(await page.evaluate(() => window.speechTest.texts.length)).toBe(2);
  await article.getByRole("button", { name: "朗读", exact: true }).click();
  await expect(verses.locator('[data-read="true"]')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.speechTest.texts.length)).toBe(3);
  for (let i = 0; i < 8; i++) {
    await page.evaluate(() => window.speechTest.end());
    if (i < 7) await expect.poll(() => page.evaluate(() => window.speechTest.texts.length)).toBe(i + 4);
  }
  await expect(article.getByRole("button", { name: "朗读", exact: true })).toBeVisible();
  await expect(verses.locator('[data-read="true"]')).toHaveCount(4);
  const allText = await verses.textContent();
  expect(await verses.locator('[data-read="true"]').allTextContents()).toEqual(["岱宗夫如何？齐鲁青未了。", "造化钟神秀，阴阳割昏晓。", "荡胸生曾云，决眦入归鸟。", "会当凌绝顶，一览众山小。"]);
  expect(allText).toContain("会当凌绝顶");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("switching poems cancels late events; curated links and error recovery retain only actual progress", async ({ page }) => {
  await mockSpeech(page);
  await page.goto("/poetry/?poem=haitang-10095");
  await page.getByRole("button", { name: "朗读", exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.speechTest.texts.length)).toBe(1);
  await page.evaluate(() => window.speechTest.boundary(1));
  await page.getByRole("searchbox", { name: "搜索诗词" }).fill("静夜思");
  const article = page.getByRole("article", { name: "静夜思原文与注释" });
  await expect(article).toBeVisible();
  await page.evaluate(() => window.speechTest.late());
  await expect(article.locator('[data-read="true"]')).toHaveCount(0);
  expect(await page.evaluate(() => window.speechTest.texts.length)).toBe(1);
  await article.getByRole("button", { name: "朗读", exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.speechTest.texts.length)).toBe(2);
  await page.evaluate(() => window.speechTest.boundary(0, 2));
  await expect(article.locator('.poem-verses a[data-read="true"]')).toHaveCount(2);
  await expect(article.locator('.poem-verses a').first()).toHaveAttribute("href", "/dictionary/?q=%E5%BA%8A");
  await page.evaluate(() => window.speechTest.fail());
  await expect(page.getByText("系统中文语音播放失败，请检查设备语音设置后重试。")).toBeVisible();
  await expect(article.getByRole("button", { name: "朗读", exact: true })).toBeVisible();
  await expect(article.locator('[data-read="true"]')).toHaveCount(2);
  await article.getByRole("button", { name: "朗读", exact: true }).click();
  await expect(article.locator('[data-read="true"]')).toHaveCount(0);
});
