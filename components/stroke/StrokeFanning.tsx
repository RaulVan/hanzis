import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { HanziData } from "@/lib/hanziData";
import { getCumulativeStrokePaths, getStrokeName } from "@/lib/strokeLearning";

interface StrokeFanningProps {
  char: string;
  data: HanziData;
  strokeNames: string[];
}

export function StrokeFanning({ char, data, strokeNames }: StrokeFanningProps) {
  const stages = getCumulativeStrokePaths(data.strokes);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>逐笔分解</CardTitle>
            <CardDescription className="mt-2">每一格增加一笔，朱红色表示本格新写的笔画。</CardDescription>
          </div>
          <Badge variant="secondary">{stages.length} 步</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="grid min-w-0 grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6" aria-label={`“${char}”字的逐笔分解`}>
          {stages.map((paths, index) => (
            <li key={index} className="min-w-0">
              <figure className="space-y-2">
                <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-card">
                  <svg viewBox="0 0 1024 1024" className="size-full text-border" aria-hidden="true">
                    <path d="M512 0V1024M0 512H1024" fill="none" stroke="currentColor" strokeDasharray="20 20" strokeWidth="8" />
                    <g transform="translate(0 1024) scale(1 -1)" className="text-foreground">
                      {paths.map((path, pathIndex) => (
                        <path
                          key={pathIndex}
                          d={path}
                          fill="currentColor"
                          className={pathIndex === index ? "text-primary" : "text-foreground"}
                        />
                      ))}
                    </g>
                  </svg>
                  <span className="absolute left-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground" aria-hidden="true">{index + 1}</span>
                </div>
                <figcaption className="break-words text-center text-xs leading-5 text-muted-foreground">
                  {getStrokeName(strokeNames[index], index)}
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
