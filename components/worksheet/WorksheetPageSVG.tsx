import { drawWorksheetPage } from "@/lib/worksheetDrawing";
import type { WorksheetDocument } from "@/lib/worksheetLayout";

export function WorksheetPageSVG({ document, pageIndex }: { document: WorksheetDocument; pageIndex: number }) {
  const operations = drawWorksheetPage(document, pageIndex);
  const text = document.pages[pageIndex]?.filter((row) => !row.empty).map((row) => row.character?.char).join("、");
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${document.width} ${document.height}`}
      className="worksheet-page block h-auto w-full" role="img"
      aria-label={`${document.config.title || "汉字书写练习"}，第 ${pageIndex + 1} 页，共 ${document.pages.length} 页`}
      style={{ aspectRatio: `${document.widthMm} / ${document.heightMm}` }}>
      <desc>{text ? `本页练习：${text}。` : "空白练习字格。"}纸张尺寸 {document.widthMm} × {document.heightMm} 毫米。</desc>
      {operations.map((operation, index) => {
        if (operation.kind === "line") return <line key={index} x1={operation.x1} y1={operation.y1} x2={operation.x2} y2={operation.y2} stroke={operation.color} strokeWidth={operation.width} strokeDasharray={operation.dash?.join(" ")} opacity={operation.opacity} />;
        if (operation.kind === "rect") return <rect key={index} x={operation.x} y={operation.y} width={operation.width} height={operation.height} fill={operation.fill ? operation.color : "none"} stroke={operation.fill ? "none" : operation.color} strokeWidth={operation.lineWidth} />;
        if (operation.kind === "path") return <path key={index} d={operation.path} fill={operation.color} transform={`translate(${operation.x}, ${operation.y + operation.size * 900 / 1024}) scale(${operation.size / 1024}, ${-operation.size / 1024})`} />;
        return <text key={index} x={operation.x} y={operation.y} fontFamily={operation.font} fontSize={operation.size}
          textAnchor={operation.align === "center" ? "middle" : operation.align === "right" ? "end" : "start"}
          dominantBaseline="middle" fill={operation.outline ? "none" : operation.color}
          stroke={operation.outline ? operation.color : "none"} strokeWidth={operation.outline ? Math.max(0.6, operation.size / 60) : undefined}
          opacity={operation.opacity}>{operation.text}</text>;
      })}
    </svg>
  );
}
