import Link from "next/link";
import { BookOpen, Grid2X2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getStrokeName } from "@/lib/strokeLearning";
import type { CharacterInfo } from "@/types";

interface StrokeInfoProps {
  char: string;
  info: CharacterInfo | null;
  infoStatus: "loading" | "ready" | "unavailable";
  strokeCount: number;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 border-b border-border py-3 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-sm font-medium">{children}</dd>
    </div>
  );
}

export function StrokeInfo({ char, info, infoStatus, strokeCount }: StrokeInfoProps) {
  const names = info?.strokeNames.map((name, index) => getStrokeName(name, index)).filter(Boolean) ?? [];

  return (
    <Card className="min-w-0 lg:sticky lg:top-24">
      <CardHeader>
        <CardTitle>汉字信息</CardTitle>
        <CardDescription>读音和结构供识字参考，笔画数以当前笔顺数据为准。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="relative mx-auto grid aspect-square w-full max-w-48 place-items-center overflow-hidden border border-border bg-card">
          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full text-border" aria-hidden="true">
            <path d="M50 0V100M0 50H100M0 0L100 100M100 0L0 100" fill="none" stroke="currentColor" strokeDasharray="2 2" />
          </svg>
          <span className="relative font-serif text-8xl leading-none">{char}</span>
        </div>

        <dl>
          <InfoRow label="总笔画"><Badge variant="secondary">{strokeCount} 画</Badge></InfoRow>
          {infoStatus === "loading" ? (
            <>
              <InfoRow label="拼音"><Skeleton className="h-5 w-20" /></InfoRow>
              <InfoRow label="部首"><Skeleton className="h-5 w-14" /></InfoRow>
              <InfoRow label="结构"><Skeleton className="h-5 w-24" /></InfoRow>
            </>
          ) : (
            <>
              <InfoRow label="拼音">{info?.pinyinWithTone || "暂未收录"}</InfoRow>
              <InfoRow label="部首">{info?.radical || "暂未收录"}</InfoRow>
              <InfoRow label="结构">{info?.struct || "暂未收录"}</InfoRow>
              <InfoRow label="笔画名称">{names.length ? names.join("、") : "暂未收录"}</InfoRow>
            </>
          )}
        </dl>

        {infoStatus === "unavailable" && <Alert><AlertDescription>读音和结构资料暂时不可用，笔顺动画与书写练习仍可正常使用。</AlertDescription></Alert>}
      </CardContent>
      <CardFooter className="flex-col items-stretch">
        <Button asChild><Link href={`/?text=${encodeURIComponent(char)}`}><Grid2X2 aria-hidden="true" />用“{char}”生成字帖</Link></Button>
        <Button asChild variant="outline"><Link href={`/dictionary/?q=${encodeURIComponent(char)}`}><BookOpen aria-hidden="true" />查“{char}”的释义</Link></Button>
      </CardFooter>
    </Card>
  );
}
