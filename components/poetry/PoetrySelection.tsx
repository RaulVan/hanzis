"use client";
import { useEffect, useState } from "react";
import { getPoem, type Poem } from "@/data/poems";
import { getHaitangPoem } from "@/lib/haitangData";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PoemReader } from "./PoemReader";

function ImportedPoem({ slug }: { slug: string }) {
  const [poem, setPoem] = useState<Poem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    getHaitangPoem(slug).then(value => { if (active) setPoem(value); }).catch(error => {
      if (active) setError(error instanceof Error && error.name !== "AbortError" ? error.message : "诗词加载超时，请重试。");
    });
    return () => { active = false; };
  }, [slug, revision]);
  if (error) return <Alert variant="destructive"><AlertDescription>{error}<Button variant="outline" onClick={() => { setError(null); setRevision(value => value + 1); }}>重新加载诗词</Button></AlertDescription></Alert>;
  if (!poem) return <div className="study-panel p-8" role="status" aria-label="正在加载诗词"><Skeleton className="h-96" /></div>;
  return <PoemReader key={slug} poem={poem} />;
}
export function PoetrySelection({ slug }: { slug: string }) {
  const curated = getPoem(slug);
  return curated ? <PoemReader key={slug} poem={curated} /> : <ImportedPoem key={slug} slug={slug} />;
}
