import english from "@/locales/en.json";

export type Language = "zh" | "en";
export const LANGUAGE_STORAGE_KEY = "hanzis-language";

export function resolveLanguage(browserLanguage: string, saved?: string | null): Language {
  if (saved === "zh" || saved === "en") return saved;
  return /^zh(?:[-_]|$)/i.test(browserLanguage) ? "zh" : "en";
}

const messages: Record<string, string> = english;
// Only these placeholders contain other interface messages. All other values are learning content.
const localizedValues: Record<string, readonly number[]> = {
  "汉字网 · 每日成语 {0} {1}/{2}": [0], "学习{0}": [0], "开始玩{0}": [0], "{0}预设": [0], "{0}相关学习工具": [0],
  "{0} 个{1}，点击开始学习。": [1], "{0}分类": [0], "选择{0}": [0],
  "{0} {1} 的发音与例字": [0], "{0} · 没听清时，可以再听一次。": [0],
  "写出上面{0}的拼音": [0], "{0} ü 可以输入 v，如 lv 表示 lü。": [0],
  "共作答 {0} 题 · 最长连对 {1} 题{2}": [2], "猜错 {0} 次，提示 {1} 次。{2}": [2],
  "{0}预览适应屏幕宽度，导出保留真实纸张尺寸。": [0], "{0}纸张尺寸 {1} × {2} 毫米。": [0],
  "开放词库释义{0}": [0], "{0} / {1} 字{2}": [2], "来源暂未提供{0}。": [0],
  "自动注音，部分多音字待校对；标注本调，不合并儿化音。{0}": [0], "点击诗中的汉字可查字典；{0}": [0],
  "{0}答完就能看到出处，再去读整首诗。": [0], "{0}主题": [0], "{0}关键字": [0],
  "{0}成语链": [0], "{0}关卡": [0], "{0}诗篇": [0],
  "{0}，{1} 个成语{2}": [2], "{0}，{1} 句可选{2}": [2], "{0}，{1}，{2} 句{3}": [3],
  "{0}{1}，第 {2} 行第 {3} 列{4}": [4], "第 {0} 关 {1}{2}": [1, 2], "第 {0} 字：字{1}，声母{2}，韵母{3}，声调{4}": [1, 2, 3, 4],
  "{0} · 调值 {1}": [0], "第 {0} 关 · {1}": [1], "下一关：{0}": [0], "正在播放 · {0}": [0], "选择 {0}": [0], "回答有误，正确答案是 {0}": [0], "“{0}”读 {1}，是{2}。": [2], "“{0}”读 {1}，是{2}{3}。": [2, 3],
  "书写测验进行中，已完成 {0} / {1} 笔，修正 {2} 次。 {3}": [3],
};
const patterns = Object.entries(messages).filter(([key]) => /\{\d+\}/.test(key))
  .sort(([a], [b]) => b.replace(/\{\d+\}/g, "").length - a.replace(/\{\d+\}/g, "").length)
  .map(([key, value]) => ({
  key,
  pattern: new RegExp(`^${key.split(/\{\d+\}/).map(part => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("(.*?)")}$`, "s"),
  value,
}));

function formatMessage(template: string, values: readonly string[], localize: readonly number[] | undefined, language: Language): string {
  // Inflect interface count labels without changing any interpolated learning text.
  if (language === "en") template = template.replace(/\{(\d+)\} (pages|characters|cells|idioms|days|lines|steps|strokes|questions|seconds|works)\b/g,
    (match, index: string, noun: string) => values[Number(index)] === "1" ? `{${index}} ${noun.slice(0, -1)}` : match);
  return template.replace(/\{(\d+)\}/g, (_, index: string) => {
    const part = values[Number(index)] ?? "";
    return localize?.includes(Number(index)) ? translate(part, language) : part;
  });
}

/** Only interface messages in the catalog are translated. Learning content stays verbatim. */
export function translate(text: string, language: Language, values?: readonly string[]): string {
  const normalized = text.trim().replace(/\s+/g, " ");
  let result = text;
  if (language === "en") {
    const exact = messages[normalized];
    if (exact !== undefined) result = exact;
    else if (!values) {
      for (const { pattern, value, key } of patterns) {
        const match = normalized.match(pattern);
        if (match) {
          result = formatMessage(value, match.slice(1), localizedValues[key], language);
          break;
        }
      }
    }
    // Preserve intentional spaces around linked text and inline fragments.
    if (result !== text) result = `${/^\s/.test(text) ? " " : ""}${result}${/\s$/.test(text) ? " " : ""}`;
  }
  return values ? formatMessage(result, values, localizedValues[normalized], language) : result;
}
