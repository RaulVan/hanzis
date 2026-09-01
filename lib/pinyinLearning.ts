import { finals, finalCategories, initials, initialCategories, wholeSyllables } from "../data/pinyin";

export type PinyinLessonKind = "initials" | "finals" | "syllables";
export type PinyinLearningItem = {
  letter: string;
  pinyin: string;
  name: string;
  category: string;
  examples: Array<{ char: string; pinyin: string }>;
};

const syllableGroups = [
  { name: "zhi / chi / shi / ri", letters: ["zhi", "chi", "shi", "ri"] },
  { name: "zi / ci / si", letters: ["zi", "ci", "si"] },
  { name: "yi / wu / yu", letters: ["yi", "wu", "yu"] },
  { name: "ye / yue / yuan", letters: ["ye", "yue", "yuan"] },
  { name: "yin / yun / ying", letters: ["yin", "yun", "ying"] },
];

export const pinyinLessons: Record<PinyinLessonKind, {
  title: string;
  noun: string;
  note: string;
  items: PinyinLearningItem[];
  next: { href: string; label: string };
}> = {
  initials: {
    title: "声母表", noun: "声母",
    note: "声母用呼读音帮助记忆；实际拼读时，要把声母读得轻而短。",
    items: initials.map((item) => ({ ...item, category: initialCategories.find((category) => category.id === item.category)!.name })),
    next: { href: "/pinyin/finals/", label: "继续学习韵母" },
  },
  finals: {
    title: "韵母表", noun: "韵母",
    note: "先听韵母，再读带有这个韵母的例字。例字的声调可能不同。",
    items: finals.map((item) => ({ ...item, category: finalCategories.find((category) => category.id === item.type)!.name })),
    next: { href: "/pinyin/syllables/", label: "学习整体认读音节" },
  },
  syllables: {
    title: "整体认读音节", noun: "音节",
    note: "整体认读音节直接认读，结合例字记住完整的音节。",
    items: wholeSyllables.map((item) => ({ ...item, letter: item.syllable, category: syllableGroups.find((group) => group.letters.includes(item.syllable))!.name })),
    next: { href: "/pinyin/tones/", label: "继续学习声调" },
  },
};
