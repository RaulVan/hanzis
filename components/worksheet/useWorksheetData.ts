"use client";

import * as React from "react";
import { getCharacterInfo, getTextPinyin, loadCnchar } from "@/lib/cncharHelper";
import { loadHanziData } from "@/lib/hanziData";
import { extractWorksheetCharacters, MAX_WORKSHEET_CHARACTERS } from "@/lib/worksheetConfig";
import type { WorksheetStrokeMap } from "@/lib/worksheetLayout";
import { applyWorksheetPinyin } from "@/lib/worksheetPinyin";
import type { CharacterInfo, WorksheetConfig } from "@/types";

interface WorksheetData {
  key: string;
  characters: CharacterInfo[];
  strokes: WorksheetStrokeMap;
  status: "loading" | "ready" | "error";
  message: string | null;
  missingStrokes: string[];
  missingAnnotations: string[];
  usingFallback: boolean;
}

function basicCharacter(char: string): CharacterInfo {
  return { char, pinyin: "", pinyinWithTone: "", tone: 0, strokeCount: 0, radical: "",
    radicalStrokeCount: 0, struct: "", strokeOrder: [], strokeNames: [] };
}

export function useWorksheetData(config: WorksheetConfig, enabled: boolean) {
  const text = extractWorksheetCharacters(config.characters).slice(0, MAX_WORKSHEET_CHARACTERS).join("");
  const needsStrokes = config.showStrokeOrder || config.displayMode === "stroke-order";
  const key = `${text}|${needsStrokes}`;
  const [attempt, setAttempt] = React.useState(0);
  const [data, setData] = React.useState<WorksheetData>({
    key: "", characters: [], strokes: {}, status: "loading", message: null,
    missingStrokes: [], missingAnnotations: [], usingFallback: false,
  });

  React.useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const characters = Array.from(text);
    const load = async () => {
      const initial: WorksheetData = { key, characters: [], strokes: {}, status: "loading", message: null,
        missingStrokes: [], missingAnnotations: [], usingFallback: false };
      setData(initial);
      if (characters.length === 0) {
        setData({ ...initial, status: "ready" });
        return;
      }
      try {
        const cnchar = await loadCnchar();
        if (!cnchar) throw new Error("汉字资料暂时无法加载，请检查连接后重试。" );
        const information = new Map<string, CharacterInfo>();
        for (const char of new Set(characters)) information.set(char, getCharacterInfo(char));
        const processed = applyWorksheetPinyin(
          characters.map((char) => information.get(char) ?? basicCharacter(char)), getTextPinyin(text),
        );
        const strokes: WorksheetStrokeMap = {};
        const missingStrokes: string[] = [];
        if (needsStrokes) {
          const unique = [...new Set(characters)];
          // Bound concurrent requests when a long passage contains many unique characters.
          for (let start = 0; start < unique.length; start += 6) {
            if (cancelled) return;
            await Promise.all(unique.slice(start, start + 6).map(async (char) => {
              try {
                const result = await loadHanziData(char);
                if (!result.strokes.length) throw new Error("No strokes");
                strokes[char] = result.strokes;
              } catch {
                missingStrokes.push(char);
              }
            }));
          }
        }
        if (!cancelled) setData({
          key, characters: processed, strokes, status: "ready", message: null, missingStrokes,
          missingAnnotations: [...new Set(processed.filter((info) => !info.pinyin).map((info) => info.char))],
          usingFallback: false,
        });
      } catch (error) {
        if (!cancelled) setData({ ...initial, status: "error", message: error instanceof Error ? error.message : "字库加载失败，请重试。" });
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [enabled, key, text, needsStrokes, attempt]);

  return {
    ...data,
    ready: enabled && data.key === key && data.status === "ready",
    pending: !enabled || data.key !== key || data.status === "loading",
    retry: () => setAttempt((value) => value + 1),
    useBasicCharacters: () => setData({
      key, characters: Array.from(text).map(basicCharacter), strokes: {}, status: "ready",
      message: null, missingStrokes: [], missingAnnotations: [], usingFallback: true,
    }),
  };
}
