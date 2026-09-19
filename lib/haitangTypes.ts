export interface PoetrySummary {
  slug: string;
  title: string;
  author: string;
  dynasty: string;
  kind: string;
  excerpt: string;
  collectionIds: number[];
}
export interface HaitangCatalog {
  revision: string;
  works: PoetrySummary[];
  dynasties: string[];
  collections: { id: number; name: string; kind: string; count: number }[];
}
export interface HaitangWork {
  id: number;
  title: string;
  author: string;
  author_id: number;
  dynasty: string;
  kind_cn: string;
  content: string;
  content_tr: string;
  foreword: string;
  intro: string;
  annotation: string;
  translation: string;
  master_comment: string;
  layout: string;
  collections: string[];
  quotes: string[];
}
