export interface RevisedDefinition {
  def: string;
  type?: string;
  quote?: string[];
  example?: string[];
  link?: string[];
  synonyms?: string;
  antonyms?: string;
}
export interface RevisedEntry {
  title: string;
  radical?: string;
  stroke_count?: number;
  non_radical_stroke_count?: number;
  heteronyms: { pinyin?: string; bopomofo?: string; definitions: RevisedDefinition[] }[];
}
export interface XinhuaEntry { kind: "character" | "word" | "idiom"; data: Record<string, string> }
export interface DictionarySearchResult { terms: string[]; unavailableSources: string[] }
