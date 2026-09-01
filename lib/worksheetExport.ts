import { drawWorksheetPage, type WorksheetDrawingOperation, WORKSHEET_FONTS } from "./worksheetDrawing";
import type { WorksheetDocument } from "./worksheetLayout";

type ProgressCallback = (completed: number, total: number) => void;
let clearPreviousPrint: (() => void) | null = null;

export async function loadWorksheetFonts(worksheet: WorksheetDocument) {
  const sample = `${worksheet.config.title}姓名日期汉字网认真写字慢慢成长部首笔画暂无笔顺数据${worksheet.characters.map((item) => item.char).join("")}`;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('400 16px "Noto Sans SC"', sample + "āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ"),
        document.fonts.load('400 64px "Noto Serif SC"', sample),
      ]).then(() => document.fonts.ready),
      new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error("字体加载超时，请检查连接后重试。")), 15000); }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function paint(context: CanvasRenderingContext2D, operation: WorksheetDrawingOperation) {
  context.save();
  context.fillStyle = operation.color;
  context.strokeStyle = operation.color;
  context.globalAlpha = operation.opacity ?? 1;
  if (operation.kind === "line") {
    context.lineWidth = operation.width;
    context.setLineDash(operation.dash ?? []);
    context.beginPath();
    context.moveTo(operation.x1, operation.y1);
    context.lineTo(operation.x2, operation.y2);
    context.stroke();
  } else if (operation.kind === "rect") {
    if (operation.fill) context.fillRect(operation.x, operation.y, operation.width, operation.height);
    else {
      context.lineWidth = operation.lineWidth;
      context.strokeRect(operation.x, operation.y, operation.width, operation.height);
    }
  } else if (operation.kind === "path") {
    context.translate(operation.x, operation.y + operation.size * 900 / 1024);
    context.scale(operation.size / 1024, -operation.size / 1024);
    context.fill(new Path2D(operation.path));
  } else {
    context.font = `400 ${operation.size}px ${operation.font || WORKSHEET_FONTS.serif}`;
    context.textAlign = operation.align ?? "left";
    context.textBaseline = "middle";
    if (operation.outline) {
      context.lineWidth = Math.max(0.6, operation.size / 60);
      context.strokeText(operation.text, operation.x, operation.y, operation.maxWidth);
    } else {
      context.fillText(operation.text, operation.x, operation.y, operation.maxWidth);
    }
  }
  context.restore();
}

export function renderWorksheetCanvas(worksheet: WorksheetDocument, pageIndex: number): HTMLCanvasElement {
  if (worksheet.exceedsPageLimit || worksheet.exceedsCharacterLimit || !worksheet.pages[pageIndex]) {
    throw new Error("字帖超出安全导出范围，请减少文字或调整排版。" );
  }
  const canvas = document.createElement("canvas");
  // Bound peak canvas memory while keeping A4 output close to 288 DPI.
  const scale = Math.min(3, Math.sqrt(8_000_000 / (worksheet.width * worksheet.height)));
  canvas.width = Math.ceil(worksheet.width * scale);
  canvas.height = Math.ceil(worksheet.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("当前浏览器无法生成图片，请换用现代浏览器后重试。" );
  context.scale(canvas.width / worksheet.width, canvas.height / worksheet.height);
  drawWorksheetPage(worksheet, pageIndex).forEach((operation) => paint(context, operation));
  return canvas;
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => {
    if (blob) resolve(blob);
    else reject(new Error("图片生成失败，请减少页数后重试。"));
  }, "image/png"));
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export async function exportWorksheetPDF(worksheet: WorksheetDocument, onProgress: ProgressCallback) {
  await loadWorksheetFonts(worksheet);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: worksheet.config.orientation, unit: "mm", format: [worksheet.widthMm, worksheet.heightMm], compress: true });
  pdf.setProperties({ title: worksheet.config.title || "汉字书写练习", creator: "Hanzis" });
  for (let page = 0; page < worksheet.pages.length; page += 1) {
    const canvas = renderWorksheetCanvas(worksheet, page);
    try {
      if (page > 0) pdf.addPage([worksheet.widthMm, worksheet.heightMm], worksheet.config.orientation);
      pdf.addImage(canvas, "PNG", 0, 0, worksheet.widthMm, worksheet.heightMm, undefined, "FAST");
    } finally {
      canvas.width = 0;
      canvas.height = 0;
    }
    onProgress(page + 1, worksheet.pages.length);
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
  const date = new Date();
  const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  pdf.save(`汉字字帖-${localDate}.pdf`);
}

export async function exportWorksheetPNG(worksheet: WorksheetDocument, pageIndex: number) {
  await loadWorksheetFonts(worksheet);
  const canvas = renderWorksheetCanvas(worksheet, pageIndex);
  try {
    const blob = await canvasBlob(canvas);
    saveBlob(blob, `汉字字帖-第${pageIndex + 1}页.png`);
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

/** An isolated print document contains every physical page, independent of the on-screen pagination. */
export async function printWorksheet(worksheet: WorksheetDocument, onProgress: ProgressCallback) {
  await loadWorksheetFonts(worksheet);
  clearPreviousPrint?.();
  const urls: string[] = [];
  const frame = document.createElement("iframe");
  frame.title = "字帖打印";
  frame.setAttribute("aria-hidden", "true");
  Object.assign(frame.style, { position: "fixed", width: "1px", height: "1px", opacity: "0", pointerEvents: "none" });
  const cleanup = () => {
    urls.forEach((url) => URL.revokeObjectURL(url));
    frame.remove();
    if (clearPreviousPrint === cleanup) clearPreviousPrint = null;
  };
  clearPreviousPrint = cleanup;
  try {
    const loaded = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("打印页面准备超时，请重试或导出 PDF。")), 15000);
      frame.onload = () => { clearTimeout(timeout); resolve(); };
      frame.onerror = () => { clearTimeout(timeout); reject(new Error("打印页面加载失败，请重试。")); };
    });
    frame.srcdoc = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>汉字字帖</title><style>@page{size:${worksheet.widthMm}mm ${worksheet.heightMm}mm;margin:0}html,body{margin:0;padding:0}img{display:block;width:${worksheet.widthMm}mm;height:${worksheet.heightMm}mm;break-after:page;page-break-after:always}img:last-child{break-after:auto;page-break-after:auto}</style></head><body></body></html>`;
    document.body.append(frame);
    await loaded;
    if (!frame.contentDocument || !frame.contentWindow) throw new Error("打印窗口未能打开，请使用 PDF 导出。" );
    for (let page = 0; page < worksheet.pages.length; page += 1) {
      const canvas = renderWorksheetCanvas(worksheet, page);
      const blob = await canvasBlob(canvas);
      canvas.width = 0;
      canvas.height = 0;
      const url = URL.createObjectURL(blob);
      urls.push(url);
      const image = frame.contentDocument.createElement("img");
      image.alt = `字帖第 ${page + 1} 页`;
      image.src = url;
      frame.contentDocument.body.append(image);
      await image.decode();
      onProgress(page + 1, worksheet.pages.length);
    }
    frame.contentWindow.addEventListener("afterprint", cleanup, { once: true });
    frame.contentWindow.focus();
    frame.contentWindow.print();
  } catch (error) {
    cleanup();
    throw error;
  }
}
