import { expect, test, type Page } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import { pinyinQuizCharacters, pinyinQuizWords } from "../../data/pinyinQuizItems";

const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const marks: Record<string, [string, number]> = Object.fromEntries(
  ["āáǎà", "ēéěè", "īíǐì", "ōóǒò", "ūúǔù", "ǖǘǚǜ"].flatMap((group, vowel) => [...group].map((char, tone) => [char, ["aeiouv"[vowel], tone + 1]])),
);

function numbered(pinyin: string) {
  return pinyin.split(" ").map(syllable => {
    let tone = "";
    const letters = [...syllable].map(char => { const mark = marks[char]; if (mark) { tone = String(mark[1]); return mark[0]; } return char === "ü" ? "v" : char; }).join("");
    return letters + tone;
  }).join("");
}
const bare = (pinyin: string) => numbered(pinyin).replace(/\d/g, "");

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  return errors;
}

async function currentItem(page: Page, mode: "character" | "word") {
  const text = (await page.locator("#pinyin-quiz-prompt").textContent())!;
  return (mode === "word" ? pinyinQuizWords : pinyinQuizCharacters).find(item => item.text === text)!;
}

async function answer(page: Page, value: string) {
  await page.getByRole("textbox").fill(value);
  await page.keyboard.press("Enter");
}

test("desktop: toned word round explains each mistake, finishes untimed, and remembers the best score", async ({ page }) => {
  const errors = trackErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/games/");
  await expect(page.getByRole("navigation", { name: "主导航" }).getByRole("link", { name: "汉字游戏" })).toHaveAttribute("aria-current", "page");
  const list = page.getByRole("list", { name: "小游戏列表" });
  await expect(list.getByRole("link", { name: /^开始玩/ })).toHaveCount(6);
  expect((await new AxeBuilder({ page }).withTags(axeTags).analyze()).violations).toEqual([]);
  await list.getByRole("link", { name: "开始玩拼音快答" }).click();
  await expect(page).toHaveURL(/\/games\/pinyin-quiz\/$/);

  await page.getByRole("radio", { name: "词语" }).click();
  await page.getByRole("radio", { name: "标声调" }).click();
  await page.getByRole("radio", { name: "不限时 20 题" }).click();
  await expect(page.getByText("这个设置还没有成绩")).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(axeTags).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "开始" }).click();

  const input = page.getByRole("textbox", { name: "写出上面词语的拼音" });
  await expect(input).toBeFocused();
  const status = page.getByRole("status");
  const first = await currentItem(page, "word");
  await answer(page, "火");
  await expect(status).toContainText("先关闭中文输入法");
  await answer(page, "xx");
  await expect(status).toContainText("拼写不对");
  await expect(input).toBeFocused();
  await answer(page, bare(first.pinyin));
  await expect(status).toContainText("声调不对");
  await answer(page, numbered(first.pinyin));
  await expect(status).toContainText(`答对了：${first.text} ${first.pinyin}`);
  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();

  const skipped = await currentItem(page, "word");
  await page.getByRole("button", { name: "跳过，看答案" }).click();
  await expect(status).toContainText(`已跳过：${skipped.text} 读 ${skipped.pinyin}`);
  expect((await new AxeBuilder({ page }).withTags(axeTags).analyze()).violations).toEqual([]);
  await page.screenshot({ path: "/tmp/hanzis-pinyin-quiz-play-1440.png" });

  for (let index = 2; index < 20; index += 1) {
    const item = await currentItem(page, "word");
    await answer(page, index % 2 ? item.pinyin : numbered(item.pinyin));
  }
  await expect(page.getByRole("heading", { name: "本轮结束" })).toBeFocused();
  await expect(page.getByText("共作答 20 题 · 最长连对 18 题 · 新纪录")).toBeVisible();
  await expect(page.getByText(`答错 2 次后答对`)).toBeVisible();
  await expect(page.getByText("已跳过")).toBeVisible();
  await expect(page.getByRole("link", { name: `在字典中查看「${skipped.text}」` })).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(axeTags).analyze()).violations).toEqual([]);
  await page.screenshot({ path: "/tmp/hanzis-pinyin-quiz-result-1440.png" });

  await page.reload();
  await page.getByRole("radio", { name: "词语" }).click();
  await page.getByRole("radio", { name: "标声调" }).click();
  await page.getByRole("radio", { name: "不限时 20 题" }).click();
  await expect(page.getByText("这个设置的最好成绩：答对 19 题，最长连对 18 题")).toBeVisible();
  expect(errors).toEqual([]);
});

test("mobile: a timed character round fits the screen and ends by itself when time runs out", async ({ page }) => {
  const errors = trackErrors(page);
  await page.clock.install();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/games/pinyin-quiz/");
  await page.getByRole("button", { name: "开始" }).click();
  await expect(page.getByRole("timer")).toHaveText("1:30");
  for (let index = 0; index < 3; index += 1) {
    const item = await currentItem(page, "character");
    await answer(page, bare(item.pinyin));
  }
  await expect(page.getByText(/^答对$/).locator("..")).toContainText("3");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  const box = await page.getByRole("textbox").boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await page.screenshot({ path: "/tmp/hanzis-pinyin-quiz-play-375.png" });
  await page.clock.fastForward(45_000);
  await expect(page.getByRole("timer")).toHaveText("0:45");
  await page.clock.fastForward(46_000);
  await expect(page.getByRole("heading", { name: "本轮结束" })).toBeFocused();
  await expect(page.getByText(/^3 题答对$/)).toBeVisible();
  expect(errors).toEqual([]);
});
