import { isChinese } from "@/lib/utils";

export const DEFAULT_STROKE_CHARACTER = "永";

export type StrokeSpeedId = "slow" | "normal" | "fast";

export interface StrokeSpeedPreset {
  id: StrokeSpeedId;
  label: string;
  animationSpeed: number;
  delayBetweenStrokes: number;
}

export const STROKE_SPEEDS: readonly StrokeSpeedPreset[] = [
  { id: "slow", label: "慢速", animationSpeed: 0.55, delayBetweenStrokes: 520 },
  { id: "normal", label: "常速", animationSpeed: 1, delayBetweenStrokes: 300 },
  { id: "fast", label: "快速", animationSpeed: 1.75, delayBetweenStrokes: 160 },
];

const strokeNameMap: Record<string, string> = {
  h: "横", s: "竖", p: "撇", n: "捺", d: "点", t: "提", z: "折",
  hg: "横钩", sg: "竖钩", wg: "弯钩", xg: "斜钩", hzg: "横折钩",
  hpg: "横撇弯钩", hz: "横折", hzz: "横折折", hzzg: "横折折钩",
  hzzzg: "横折折折钩", hzzp: "横折折撇", hzp: "横折撇",
  hzwg: "横折弯钩", hzw: "横折弯", hzzz: "横折折折", sp: "竖撇",
  sz: "竖折", szz: "竖折折", szzg: "竖折折钩", sw: "竖弯",
  swg: "竖弯钩", pg: "撇钩", pz: "撇折", pd: "撇点",
};

export function extractFirstStrokeCharacter(value: string | null | undefined): string | null {
  if (!value) return null;
  return Array.from(value).find(isChinese) ?? null;
}

export function getStrokeSpeed(id: StrokeSpeedId): StrokeSpeedPreset {
  return STROKE_SPEEDS.find((preset) => preset.id === id) ?? STROKE_SPEEDS[1];
}

export function getStrokeName(code: string | undefined, index: number): string {
  if (!code) return `第 ${index + 1} 笔`;
  return (strokeNameMap[code] ?? code).replaceAll("|", "／");
}

export function getCumulativeStrokePaths(strokes: readonly string[]): string[][] {
  return strokes.map((_, index) => strokes.slice(0, index + 1));
}

export function getStrokeLoadErrorMessage(problem: unknown): string {
  if (problem instanceof Error) {
    if (problem.name === "AbortError" || /abort|timeout|超时/i.test(problem.message)) {
      return "笔顺数据加载超时，请检查连接后重试。";
    }
    if (/暂未收录|格式异常|暂时无法加载/.test(problem.message)) return problem.message;
  }
  return "笔顺数据暂时无法读取，请稍后重试。";
}
