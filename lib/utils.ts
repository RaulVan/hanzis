import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge class names with Tailwind CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Check if a character is a Chinese character
export function isChinese(char: string): boolean {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf) || // CJK Unified Ideographs Extension A
    (code >= 0x20000 && code <= 0x2a6df) || // CJK Unified Ideographs Extension B
    (code >= 0xf900 && code <= 0xfaff) // CJK Compatibility Ideographs
  );
}

// Filter only Chinese characters from a string
export function filterChineseCharacters(text: string): string {
  return text
    .split("")
    .filter((char) => isChinese(char))
    .join("");
}

// Get unique characters from a string
export function getUniqueCharacters(text: string): string[] {
  const filtered = filterChineseCharacters(text);
  return [...new Set(filtered.split(""))];
}

// Chunk array into smaller arrays
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Repeat array items
export function repeatArray<T>(array: T[], times: number): T[] {
  return array.flatMap((item) => Array(times).fill(item));
}

// Calculate columns per row based on page width and grid size
export function calculateColumnsPerRow(options: {
  gridSizeMm: number;
  pageMarginPx: number;
  pageWidthMm?: number;
  mmToPx?: number;
}): number {
  const pageWidthMm = options.pageWidthMm ?? 210;
  const mmToPx = options.mmToPx ?? 3.78;
  const contentWidthPx = pageWidthMm * mmToPx - options.pageMarginPx * 2;
  const gridSizePx = options.gridSizeMm * mmToPx;
  return Math.max(1, Math.floor(contentWidthPx / gridSizePx));
}
