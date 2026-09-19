"use client";
import { useState } from "react";
import Link from "next/link";
import { Grid2X2 } from "lucide-react";
import { isChinese } from "@/lib/utils";
import { MAX_WORKSHEET_CHARACTERS } from "@/lib/worksheetConfig";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function PoemWorksheetAction({ text }: { text: string }) {
  const count = Array.from(text).filter(isChinese).length;
  const [open, setOpen] = useState(false);
  const [excerpt, setExcerpt] = useState(() => {
    let seen = 0;
    return Array.from(text).filter(char => { if (isChinese(char)) seen++; return seen <= MAX_WORKSHEET_CHARACTERS; }).join("");
  });
  const excerptCount = Array.from(excerpt).filter(isChinese).length;
  if (count <= MAX_WORKSHEET_CHARACTERS) return <Button asChild><Link href={`/?text=${encodeURIComponent(text)}`}><Grid2X2 aria-hidden="true" />生成诗词字帖</Link></Button>;
  return <><Button onClick={() => setOpen(true)}><Grid2X2 aria-hidden="true" />选段生成字帖</Button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>选择字帖练习片段</DialogTitle><DialogDescription>全文 {count.toLocaleString("zh-CN")} 个汉字，单次字帖最多 {MAX_WORKSHEET_CHARACTERS} 字。已填入开篇片段，可替换为想练习的诗句。</DialogDescription></DialogHeader>
      <Label htmlFor="poetry-excerpt">练习片段</Label><Textarea id="poetry-excerpt" rows={7} maxLength={2000} value={excerpt} onChange={event => setExcerpt(event.target.value)} aria-describedby="poetry-excerpt-count" />
      <p id="poetry-excerpt-count" className="text-sm text-muted-foreground" role="status">{excerptCount} / {MAX_WORKSHEET_CHARACTERS} 字{excerptCount > MAX_WORKSHEET_CHARACTERS ? "，请缩短片段" : ""}</p>
      {excerptCount > 0 && excerptCount <= MAX_WORKSHEET_CHARACTERS ? <Button asChild><Link href={`/?text=${encodeURIComponent(excerpt)}`}>用选段生成字帖</Link></Button> : <Button disabled>用选段生成字帖</Button>}
    </DialogContent></Dialog>
  </>;
}
