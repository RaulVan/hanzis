"use client";

// cnchar library helper functions
// Note: cnchar needs to be imported on the client side only

import type { CharacterInfo } from "@/types";

let cncharLoaded = false;
let cnchar: typeof import("cnchar") | null = null;

// Dynamically load cnchar and its plugins
export async function loadCnchar() {
  if (cncharLoaded && cnchar) {
    return cnchar.default || cnchar;
  }

  try {
    // Import cnchar and its plugins
    const cncharModule = await import("cnchar");
    await import("cnchar-poly");
    await import("cnchar-order");
    await import("cnchar-radical");

    cnchar = cncharModule;
    cncharLoaded = true;

    return cncharModule.default || cncharModule;
  } catch (error) {
    console.error("Failed to load cnchar:", error);
    return null;
  }
}

// Get pinyin for a character
export function getPinyin(
  char: string,
  withTone: boolean = true
): string {
  if (!cncharLoaded || !cnchar) {
    return "";
  }

  try {
    const cncharInstance = cnchar.default || cnchar;
    if (withTone) {
      return cncharInstance.spell(char, "tone", "low") as string;
    }
    return cncharInstance.spell(char, "low") as string;
  } catch (error) {
    console.error("Failed to get pinyin:", error);
    return "";
  }
}

// Get stroke count for a character
export function getStrokeCount(char: string): number {
  if (!cncharLoaded || !cnchar) {
    return 0;
  }

  try {
    const cncharInstance = cnchar.default || cnchar;
    const result = cncharInstance.stroke(char);
    return typeof result === "number" ? result : 0;
  } catch (error) {
    console.error("Failed to get stroke count:", error);
    return 0;
  }
}

// Get radical for a character
export function getRadical(char: string): { radical: string; struct: string } {
  if (!cncharLoaded || !cnchar) {
    return { radical: "", struct: "" };
  }

  try {
    const cncharInstance = cnchar.default || cnchar;
    if (cncharInstance.radical) {
      const result = cncharInstance.radical(char);
      if (Array.isArray(result) && result.length > 0) {
        return {
          radical: result[0].radical || "",
          struct: result[0].struct || "",
        };
      }
    }
    return { radical: "", struct: "" };
  } catch (error) {
    console.error("Failed to get radical:", error);
    return { radical: "", struct: "" };
  }
}

// Get stroke order for a character
export function getStrokeOrder(char: string): string[] {
  if (!cncharLoaded || !cnchar) {
    return [];
  }

  try {
    const cncharInstance = cnchar.default || cnchar;
    const result = cncharInstance.stroke(char, "order", "name");
    if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) {
      return result[0] as string[];
    }
    return [];
  } catch (error) {
    console.error("Failed to get stroke order:", error);
    return [];
  }
}

// Get complete character information
export function getCharacterInfo(char: string): CharacterInfo {
  const pinyinWithTone = getPinyin(char, true);
  const pinyin = getPinyin(char, false);
  const strokeCount = getStrokeCount(char);
  const { radical, struct } = getRadical(char);
  const strokeNames = getStrokeOrder(char);

  // Extract tone number from pinyin
  const toneMap: Record<string, number> = {
    ā: 1, á: 2, ǎ: 3, à: 4,
    ē: 1, é: 2, ě: 3, è: 4,
    ī: 1, í: 2, ǐ: 3, ì: 4,
    ō: 1, ó: 2, ǒ: 3, ò: 4,
    ū: 1, ú: 2, ǔ: 3, ù: 4,
    ǖ: 1, ǘ: 2, ǚ: 3, ǜ: 4,
  };

  let tone = 0;
  for (const c of pinyinWithTone) {
    if (toneMap[c]) {
      tone = toneMap[c];
      break;
    }
  }

  return {
    char,
    pinyin,
    pinyinWithTone,
    tone,
    strokeCount,
    radical,
    radicalStrokeCount: 0,
    struct,
    strokeOrder: [],
    strokeNames,
  };
}

// Check if cnchar is loaded
export function isCncharLoaded(): boolean {
  return cncharLoaded;
}
