import type { CharDataLoaderFn } from "hanzi-writer";
import type { HanziData } from "@/lib/hanziData";
import { loadHanziData } from "@/lib/hanziData";

export function createLocalStrokeDataLoader(currentChar: string, currentData: HanziData): CharDataLoaderFn {
  return (requestedChar) => {
    if (requestedChar === currentChar) return currentData;
    return loadHanziData(requestedChar);
  };
}
