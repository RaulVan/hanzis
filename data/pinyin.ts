// 拼音学习数据

// 声母定义
export interface Initial {
  letter: string;
  name: string;
  pinyin: string;
  category: "labial" | "apical" | "velar" | "palatal" | "retroflex" | "sibilant" | "special";
  examples: Array<{ char: string; pinyin: string }>;
}

// 韵母定义
export interface Final {
  letter: string;
  name: string;
  pinyin: string;
  type: "single" | "compound" | "nasal_front" | "nasal_back";
  examples: Array<{ char: string; pinyin: string }>;
}

// 整体认读音节定义
export interface WholeSyllable {
  syllable: string;
  name: string;
  pinyin: string;
  examples: Array<{ char: string; pinyin: string }>;
}

// 声母表 (23个)
export const initials: Initial[] = [
  // 唇音
  { letter: "b", name: "玻", pinyin: "bō", category: "labial", examples: [{ char: "爸", pinyin: "bà" }, { char: "北", pinyin: "běi" }, { char: "白", pinyin: "bái" }] },
  { letter: "p", name: "坡", pinyin: "pō", category: "labial", examples: [{ char: "怕", pinyin: "pà" }, { char: "跑", pinyin: "pǎo" }, { char: "朋", pinyin: "péng" }] },
  { letter: "m", name: "摸", pinyin: "mō", category: "labial", examples: [{ char: "妈", pinyin: "mā" }, { char: "门", pinyin: "mén" }, { char: "明", pinyin: "míng" }] },
  { letter: "f", name: "佛", pinyin: "fó", category: "labial", examples: [{ char: "飞", pinyin: "fēi" }, { char: "风", pinyin: "fēng" }, { char: "房", pinyin: "fáng" }] },

  // 舌尖音
  { letter: "d", name: "得", pinyin: "dé", category: "apical", examples: [{ char: "大", pinyin: "dà" }, { char: "地", pinyin: "dì" }, { char: "东", pinyin: "dōng" }] },
  { letter: "t", name: "特", pinyin: "tè", category: "apical", examples: [{ char: "他", pinyin: "tā" }, { char: "天", pinyin: "tiān" }, { char: "听", pinyin: "tīng" }] },
  { letter: "n", name: "讷", pinyin: "nè", category: "apical", examples: [{ char: "你", pinyin: "nǐ" }, { char: "年", pinyin: "nián" }, { char: "南", pinyin: "nán" }] },
  { letter: "l", name: "勒", pinyin: "lè", category: "apical", examples: [{ char: "来", pinyin: "lái" }, { char: "六", pinyin: "liù" }, { char: "老", pinyin: "lǎo" }] },

  // 舌根音
  { letter: "g", name: "哥", pinyin: "gē", category: "velar", examples: [{ char: "高", pinyin: "gāo" }, { char: "国", pinyin: "guó" }, { char: "工", pinyin: "gōng" }] },
  { letter: "k", name: "科", pinyin: "kē", category: "velar", examples: [{ char: "开", pinyin: "kāi" }, { char: "口", pinyin: "kǒu" }, { char: "看", pinyin: "kàn" }] },
  { letter: "h", name: "喝", pinyin: "hē", category: "velar", examples: [{ char: "好", pinyin: "hǎo" }, { char: "红", pinyin: "hóng" }, { char: "花", pinyin: "huā" }] },

  // 舌面音
  { letter: "j", name: "基", pinyin: "jī", category: "palatal", examples: [{ char: "家", pinyin: "jiā" }, { char: "见", pinyin: "jiàn" }, { char: "九", pinyin: "jiǔ" }] },
  { letter: "q", name: "欺", pinyin: "qī", category: "palatal", examples: [{ char: "七", pinyin: "qī" }, { char: "去", pinyin: "qù" }, { char: "前", pinyin: "qián" }] },
  { letter: "x", name: "希", pinyin: "xī", category: "palatal", examples: [{ char: "小", pinyin: "xiǎo" }, { char: "心", pinyin: "xīn" }, { char: "学", pinyin: "xué" }] },

  // 翘舌音
  { letter: "zh", name: "知", pinyin: "zhī", category: "retroflex", examples: [{ char: "中", pinyin: "zhōng" }, { char: "这", pinyin: "zhè" }, { char: "住", pinyin: "zhù" }] },
  { letter: "ch", name: "蚩", pinyin: "chī", category: "retroflex", examples: [{ char: "吃", pinyin: "chī" }, { char: "车", pinyin: "chē" }, { char: "长", pinyin: "cháng" }] },
  { letter: "sh", name: "诗", pinyin: "shī", category: "retroflex", examples: [{ char: "水", pinyin: "shuǐ" }, { char: "书", pinyin: "shū" }, { char: "山", pinyin: "shān" }] },
  { letter: "r", name: "日", pinyin: "rì", category: "retroflex", examples: [{ char: "人", pinyin: "rén" }, { char: "热", pinyin: "rè" }, { char: "日", pinyin: "rì" }] },

  // 平舌音
  { letter: "z", name: "资", pinyin: "zī", category: "sibilant", examples: [{ char: "字", pinyin: "zì" }, { char: "做", pinyin: "zuò" }, { char: "走", pinyin: "zǒu" }] },
  { letter: "c", name: "雌", pinyin: "cī", category: "sibilant", examples: [{ char: "草", pinyin: "cǎo" }, { char: "从", pinyin: "cóng" }, { char: "才", pinyin: "cái" }] },
  { letter: "s", name: "思", pinyin: "sī", category: "sibilant", examples: [{ char: "三", pinyin: "sān" }, { char: "四", pinyin: "sì" }, { char: "送", pinyin: "sòng" }] },

  // 特殊声母
  { letter: "y", name: "衣", pinyin: "yī", category: "special", examples: [{ char: "一", pinyin: "yī" }, { char: "要", pinyin: "yào" }, { char: "有", pinyin: "yǒu" }] },
  { letter: "w", name: "乌", pinyin: "wū", category: "special", examples: [{ char: "我", pinyin: "wǒ" }, { char: "五", pinyin: "wǔ" }, { char: "王", pinyin: "wáng" }] },
];

// 韵母表 (24个)
export const finals: Final[] = [
  // 单韵母 (6个)
  { letter: "a", name: "啊", pinyin: "ā", type: "single", examples: [{ char: "大", pinyin: "dà" }, { char: "他", pinyin: "tā" }, { char: "马", pinyin: "mǎ" }] },
  { letter: "o", name: "喔", pinyin: "ō", type: "single", examples: [{ char: "波", pinyin: "bō" }, { char: "坡", pinyin: "pō" }, { char: "摸", pinyin: "mō" }] },
  { letter: "e", name: "鹅", pinyin: "ē", type: "single", examples: [{ char: "河", pinyin: "hé" }, { char: "车", pinyin: "chē" }, { char: "哥", pinyin: "gē" }] },
  { letter: "i", name: "衣", pinyin: "ī", type: "single", examples: [{ char: "衣", pinyin: "yī" }, { char: "一", pinyin: "yī" }, { char: "机", pinyin: "jī" }] },
  { letter: "u", name: "乌", pinyin: "ū", type: "single", examples: [{ char: "五", pinyin: "wǔ" }, { char: "不", pinyin: "bù" }, { char: "书", pinyin: "shū" }] },
  { letter: "ü", name: "迂", pinyin: "ǖ", type: "single", examples: [{ char: "女", pinyin: "nǚ" }, { char: "绿", pinyin: "lǜ" }, { char: "雨", pinyin: "yǔ" }] },

  // 复韵母 (9个)
  { letter: "ai", name: "哀", pinyin: "āi", type: "compound", examples: [{ char: "爱", pinyin: "ài" }, { char: "来", pinyin: "lái" }, { char: "白", pinyin: "bái" }] },
  { letter: "ei", name: "诶", pinyin: "ēi", type: "compound", examples: [{ char: "北", pinyin: "běi" }, { char: "飞", pinyin: "fēi" }, { char: "黑", pinyin: "hēi" }] },
  { letter: "ui", name: "威", pinyin: "uī", type: "compound", examples: [{ char: "水", pinyin: "shuǐ" }, { char: "对", pinyin: "duì" }, { char: "回", pinyin: "huí" }] },
  { letter: "ao", name: "熬", pinyin: "āo", type: "compound", examples: [{ char: "好", pinyin: "hǎo" }, { char: "高", pinyin: "gāo" }, { char: "老", pinyin: "lǎo" }] },
  { letter: "ou", name: "欧", pinyin: "ōu", type: "compound", examples: [{ char: "走", pinyin: "zǒu" }, { char: "后", pinyin: "hòu" }, { char: "头", pinyin: "tóu" }] },
  { letter: "iu", name: "优", pinyin: "iū", type: "compound", examples: [{ char: "六", pinyin: "liù" }, { char: "九", pinyin: "jiǔ" }, { char: "牛", pinyin: "niú" }] },
  { letter: "ie", name: "耶", pinyin: "iē", type: "compound", examples: [{ char: "写", pinyin: "xiě" }, { char: "姐", pinyin: "jiě" }, { char: "叶", pinyin: "yè" }] },
  { letter: "üe", name: "约", pinyin: "üē", type: "compound", examples: [{ char: "月", pinyin: "yuè" }, { char: "学", pinyin: "xué" }, { char: "雪", pinyin: "xuě" }] },
  { letter: "er", name: "耳", pinyin: "ēr", type: "compound", examples: [{ char: "二", pinyin: "èr" }, { char: "耳", pinyin: "ěr" }, { char: "儿", pinyin: "ér" }] },

  // 前鼻韵母 (5个)
  { letter: "an", name: "安", pinyin: "ān", type: "nasal_front", examples: [{ char: "三", pinyin: "sān" }, { char: "山", pinyin: "shān" }, { char: "安", pinyin: "ān" }] },
  { letter: "en", name: "恩", pinyin: "ēn", type: "nasal_front", examples: [{ char: "门", pinyin: "mén" }, { char: "人", pinyin: "rén" }, { char: "很", pinyin: "hěn" }] },
  { letter: "in", name: "因", pinyin: "īn", type: "nasal_front", examples: [{ char: "今", pinyin: "jīn" }, { char: "心", pinyin: "xīn" }, { char: "林", pinyin: "lín" }] },
  { letter: "un", name: "温", pinyin: "ūn", type: "nasal_front", examples: [{ char: "春", pinyin: "chūn" }, { char: "轮", pinyin: "lún" }, { char: "村", pinyin: "cūn" }] },
  { letter: "ün", name: "晕", pinyin: "ǖn", type: "nasal_front", examples: [{ char: "军", pinyin: "jūn" }, { char: "群", pinyin: "qún" }, { char: "运", pinyin: "yùn" }] },

  // 后鼻韵母 (4个)
  { letter: "ang", name: "昂", pinyin: "āng", type: "nasal_back", examples: [{ char: "上", pinyin: "shàng" }, { char: "光", pinyin: "guāng" }, { char: "王", pinyin: "wáng" }] },
  { letter: "eng", name: "鞥", pinyin: "ēng", type: "nasal_back", examples: [{ char: "风", pinyin: "fēng" }, { char: "灯", pinyin: "dēng" }, { char: "冷", pinyin: "lěng" }] },
  { letter: "ing", name: "英", pinyin: "īng", type: "nasal_back", examples: [{ char: "听", pinyin: "tīng" }, { char: "明", pinyin: "míng" }, { char: "星", pinyin: "xīng" }] },
  { letter: "ong", name: "翁", pinyin: "ōng", type: "nasal_back", examples: [{ char: "中", pinyin: "zhōng" }, { char: "红", pinyin: "hóng" }, { char: "东", pinyin: "dōng" }] },
];

// 整体认读音节 (16个)
export const wholeSyllables: WholeSyllable[] = [
  // zh ch sh r 组
  { syllable: "zhi", name: "知", pinyin: "zhī", examples: [{ char: "知", pinyin: "zhī" }, { char: "纸", pinyin: "zhǐ" }, { char: "织", pinyin: "zhī" }] },
  { syllable: "chi", name: "吃", pinyin: "chī", examples: [{ char: "吃", pinyin: "chī" }, { char: "尺", pinyin: "chǐ" }, { char: "池", pinyin: "chí" }] },
  { syllable: "shi", name: "诗", pinyin: "shī", examples: [{ char: "师", pinyin: "shī" }, { char: "诗", pinyin: "shī" }, { char: "十", pinyin: "shí" }] },
  { syllable: "ri", name: "日", pinyin: "rì", examples: [{ char: "日", pinyin: "rì" }] },

  // z c s 组
  { syllable: "zi", name: "资", pinyin: "zī", examples: [{ char: "字", pinyin: "zì" }, { char: "紫", pinyin: "zǐ" }, { char: "子", pinyin: "zǐ" }] },
  { syllable: "ci", name: "雌", pinyin: "cī", examples: [{ char: "词", pinyin: "cí" }, { char: "次", pinyin: "cì" }, { char: "刺", pinyin: "cì" }] },
  { syllable: "si", name: "思", pinyin: "sī", examples: [{ char: "思", pinyin: "sī" }, { char: "四", pinyin: "sì" }, { char: "丝", pinyin: "sī" }] },

  // y w 组
  { syllable: "yi", name: "衣", pinyin: "yī", examples: [{ char: "一", pinyin: "yī" }, { char: "衣", pinyin: "yī" }, { char: "医", pinyin: "yī" }] },
  { syllable: "wu", name: "屋", pinyin: "wū", examples: [{ char: "五", pinyin: "wǔ" }, { char: "屋", pinyin: "wū" }, { char: "雾", pinyin: "wù" }] },
  { syllable: "yu", name: "鱼", pinyin: "yú", examples: [{ char: "鱼", pinyin: "yú" }, { char: "雨", pinyin: "yǔ" }, { char: "语", pinyin: "yǔ" }] },

  // ye yue yuan 组
  { syllable: "ye", name: "叶", pinyin: "yè", examples: [{ char: "夜", pinyin: "yè" }, { char: "叶", pinyin: "yè" }, { char: "页", pinyin: "yè" }] },
  { syllable: "yue", name: "月", pinyin: "yuè", examples: [{ char: "月", pinyin: "yuè" }, { char: "乐", pinyin: "yuè" }, { char: "跃", pinyin: "yuè" }] },
  { syllable: "yuan", name: "元", pinyin: "yuán", examples: [{ char: "元", pinyin: "yuán" }, { char: "园", pinyin: "yuán" }, { char: "远", pinyin: "yuǎn" }] },

  // yin yun ying 组
  { syllable: "yin", name: "音", pinyin: "yīn", examples: [{ char: "音", pinyin: "yīn" }, { char: "因", pinyin: "yīn" }, { char: "银", pinyin: "yín" }] },
  { syllable: "yun", name: "云", pinyin: "yún", examples: [{ char: "云", pinyin: "yún" }, { char: "运", pinyin: "yùn" }, { char: "晕", pinyin: "yūn" }] },
  { syllable: "ying", name: "英", pinyin: "yīng", examples: [{ char: "英", pinyin: "yīng" }, { char: "应", pinyin: "yīng" }, { char: "影", pinyin: "yǐng" }] },
];

// 声母分类
export const initialCategories = [
  { id: "labial", name: "唇音", letters: ["b", "p", "m", "f"] },
  { id: "apical", name: "舌尖音", letters: ["d", "t", "n", "l"] },
  { id: "velar", name: "舌根音", letters: ["g", "k", "h"] },
  { id: "palatal", name: "舌面音", letters: ["j", "q", "x"] },
  { id: "retroflex", name: "翘舌音", letters: ["zh", "ch", "sh", "r"] },
  { id: "sibilant", name: "平舌音", letters: ["z", "c", "s"] },
  { id: "special", name: "特殊", letters: ["y", "w"] },
];

// 韵母分类
export const finalCategories = [
  { id: "single", name: "单韵母", letters: ["a", "o", "e", "i", "u", "ü"] },
  { id: "compound", name: "复韵母", letters: ["ai", "ei", "ui", "ao", "ou", "iu", "ie", "üe", "er"] },
  { id: "nasal_front", name: "前鼻韵母", letters: ["an", "en", "in", "un", "ün"] },
  { id: "nasal_back", name: "后鼻韵母", letters: ["ang", "eng", "ing", "ong"] },
];

// 声调信息
export const tones = [
  { id: 1, name: "第一声", symbol: "ˉ", description: "阴平", pitch: "55", example: { char: "妈", pinyin: "mā" } },
  { id: 2, name: "第二声", symbol: "ˊ", description: "阳平", pitch: "35", example: { char: "麻", pinyin: "má" } },
  { id: 3, name: "第三声", symbol: "ˇ", description: "上声", pitch: "214", example: { char: "马", pinyin: "mǎ" } },
  { id: 4, name: "第四声", symbol: "ˋ", description: "去声", pitch: "51", example: { char: "骂", pinyin: "mà" } },
  { id: 0, name: "轻声", symbol: "", description: "轻声", pitch: "-", example: { char: "吗", pinyin: "ma" } },
];
