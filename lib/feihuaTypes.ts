export type FeihuaTier = "basic" | "advanced";

export interface FeihuaLine {
  id: number;
  text: string;
  workId: string;
  title: string;
  author: string;
  dynasty: string;
}

export interface FeihuaData {
  format: 1;
  source: { repository: string; revision: string; snapshotSha256: string };
  keys: string[];
  lines: FeihuaLine[];
  /** Line ids per tier and key. */
  tiers: Record<FeihuaTier, Record<string, number[]>>;
}
