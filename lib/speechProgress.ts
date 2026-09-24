export interface SpeechChunk { text: string; start: number; end: number }

/** Keep UTF-16 offsets, matching speech events and String.slice, including source whitespace. */
export function speechChunks(text: string): SpeechChunk[] {
  const chunks: SpeechChunk[] = [];
  let start = 0, position = 0, count = 0;
  const flush = () => {
    const raw = text.slice(start, position);
    const value = raw.trim();
    if (value) chunks.push({ text: value, start: start + raw.length - raw.trimStart().length, end: position });
    start = position; count = 0;
  };
  for (const char of text) {
    position += char.length; count++;
    if (/[，。！？；、,.!?;\n\r]/u.test(char) || count >= 120) flush();
  }
  flush();
  return chunks;
}

/** Mark the current spoken word; sentence events only confirm the preceding prefix. */
export function speechBoundaryEnd(text: string, index: number, length: number, name: string): number | null {
  if (!Number.isInteger(index) || index < 0 || index >= text.length) return null;
  if (name !== "word") return name === "sentence" ? index : null;
  let end = Math.min(text.length, index + (Number.isInteger(length) && length > 0 ? length : String.fromCodePoint(text.codePointAt(index)!).length));
  // Some voices omit lengths or report a boundary inside a surrogate pair.
  if (end < text.length && /[\uDC00-\uDFFF]/.test(text[end])) end++;
  return end;
}
