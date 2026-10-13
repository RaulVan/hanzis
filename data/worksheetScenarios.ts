import { poems } from "./poems";
import { defaultWorksheetConfig, type CharacterInfo, type WorksheetConfig } from "../types";
import { applyWorksheetPinyin } from "../lib/worksheetPinyin";
import { createWorksheetDocument } from "../lib/worksheetLayout";

export const worksheetScenarioIds = ["tianzi", "mizi", "poetry"] as const;
export type WorksheetScenarioId = typeof worksheetScenarioIds[number];
export const worksheetPoems = poems.filter(poem => ["jing-ye-si", "chun-xiao", "yong-e", "deng-guan-que-lou", "min-nong"].includes(poem.slug));

export const worksheetScenarios = {
  tianzi: {
    title: "田字格练字与打印",
    description: "观察横竖中线与字的重心，从描红过渡到独立书写。输入自己的文字，生成 A4 田字格练习页。",
    text: "春眠不觉晓",
    pinyin: ["chūn", "mián", "bù", "jué", "xiǎo"],
    gridType: "tian",
    guide: "田字格的横竖中线把格子分成四部分。先观察字在格子中的位置，再描红，最后在空格中独立写一遍；辅助线用于观察结构，不要求每一笔都贴在线上。",
  },
  mizi: {
    title: "米字格结构练习",
    description: "在横竖中线之外增加对角线，观察撇捺的方向与字形展开。用例字练习后，可替换为自己的内容。",
    text: "大木人天",
    pinyin: ["dà", "mù", "rén", "tiān"],
    gridType: "mi",
    guide: "比较“大”和“天”的横画位置，观察“人”的撇捺怎样展开，再看“木”的竖画如何穿过中部。米字格的对角线提供方向参考，并不意味着所有撇捺都必须沿对角线书写。",
  },
  poetry: {
    title: "古诗字帖",
    description: "从五首精选古诗中选择练习内容，结合拼音、描红和空格练写，直接生成可下载的古诗字帖。",
    text: worksheetPoems[0].lines.map(line => line.text).join("\n"),
    pinyin: worksheetPoems[0].lines.flatMap(line => line.pinyin),
    gridType: "tian",
    guide: "先到作品学习页理解诗意，再回到字帖逐字书写。每个汉字练习一行，标点不生成字格；长诗会自动分页。预设保留全诗内容，熟悉后可在输入框中改为只练难字。",
  },
} satisfies Record<WorksheetScenarioId, { title: string; description: string; text: string; pinyin: string[]; gridType: "tian" | "mi"; guide: string }>;

export function worksheetScenarioConfig(id: WorksheetScenarioId, poemSlug?: string): WorksheetConfig {
  const scenario = worksheetScenarios[id];
  const poem = id === "poetry" ? worksheetPoems.find(item => item.slug === poemSlug) ?? worksheetPoems[0] : undefined;
  return { ...defaultWorksheetConfig, title: poem?.title ?? scenario.title, characters: poem ? poem.lines.map(line => line.text).join("\n") : scenario.text,
    gridType: scenario.gridType, pageSize: "A4", orientation: "portrait", columnsPerRow: 10, repeatCount: 10, traceCount: 4, emptyCount: 5 };
}

/** Samples use the very same physical layout and SVG drawing operations as live preview/export. */
export function worksheetScenarioSample(id: WorksheetScenarioId) {
  const scenario = worksheetScenarios[id];
  const characters: CharacterInfo[] = Array.from(scenario.text).filter(char => /\p{Script=Han}/u.test(char)).map((char, index) => ({
    char, pinyin: "", pinyinWithTone: scenario.pinyin[index],
    tone: 0, strokeCount: 0, radical: "", radicalStrokeCount: 0, struct: "", strokeOrder: [], strokeNames: [],
  }));
  return createWorksheetDocument(worksheetScenarioConfig(id), applyWorksheetPinyin(characters, scenario.pinyin));
}
