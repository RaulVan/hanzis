import { cn } from "@/lib/utils";

const contours: Record<number, { path: string; label: string }> = {
  1: { path: "M 34 14 L 148 14", label: "第一声：高而平，调值 55" },
  2: { path: "M 34 54 L 148 14", label: "第二声：由中向高上扬，调值 35" },
  3: { path: "M 34 74 Q 67 98 88 94 Q 121 80 148 34", label: "第三声：先降后升，单读调值 214" },
  4: { path: "M 34 14 L 148 94", label: "第四声：由高快速下降，调值 51" },
  0: { path: "M 76 54 L 108 54", label: "轻声：音短而轻，实际音高受前一音节影响" },
};

export function TonePitchChart({ toneId, className }: { toneId: number; className?: string }) {
  const contour = contours[toneId] ?? contours[0];

  return (
    <svg
      viewBox="0 0 160 104"
      role="img"
      aria-label={contour.label}
      className={cn("h-auto w-full text-primary", className)}
    >
      <title>{contour.label}</title>
      <g className="text-border" stroke="currentColor" strokeWidth="1">
        <path d="M 30 14 H 152" />
        <path d="M 30 54 H 152" strokeDasharray="3 4" />
        <path d="M 30 94 H 152" />
      </g>
      <g className="fill-muted-foreground text-[8px]" aria-hidden="true">
        <text x="2" y="17">高 5</text>
        <text x="2" y="57">中 3</text>
        <text x="2" y="97">低 1</text>
      </g>
      <path
        d={contour.path}
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={toneId === 0 ? "5 5" : undefined}
        vectorEffect="non-scaling-stroke"
      />
      {toneId === 0 ? (
        <text x="92" y="43" textAnchor="middle" className="fill-accent-foreground text-[9px]" aria-hidden="true">
          短 · 轻
        </text>
      ) : null}
    </svg>
  );
}
