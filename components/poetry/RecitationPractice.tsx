"use client";

import { useRef, useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import type { Poem } from "@/data/poems";
import { filterChineseCharacters } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function RecitationPractice({ poem, onClose }: { poem: Poem; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [score, setScore] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const finished = index === poem.lines.length;

  function check(event: React.FormEvent) {
    event.preventDefault();
    if (!answer.trim() || finished || result === "correct") return;
    const correct = filterChineseCharacters(answer) === filterChineseCharacters(poem.lines[index].text);
    setResult(correct ? "correct" : "incorrect");
    if (correct && !attempted && !revealed) setScore(value => value + 1);
    setAttempted(true);
  }

  function next() { setIndex(value => value + 1); setAnswer(""); setResult(null); setRevealed(false); setAttempted(false); input.current?.focus(); }
  function restart() { setIndex(0); setAnswer(""); setResult(null); setRevealed(false); setAttempted(false); setScore(0); }

  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}><DialogContent>
    <DialogHeader><DialogTitle>背诵练习 · {poem.title}</DialogTitle><DialogDescription>逐句默写，只检查汉字，标点和空格不影响结果。首次答对才计入成绩。</DialogDescription></DialogHeader>
    {finished ? <div className="flex flex-col items-center gap-4 py-6 text-center"><CheckCircle2 className="size-10 text-success" aria-hidden="true" /><h3 className="text-xl font-semibold">这首诗练完了</h3><p>首次答对 {score} / {poem.lines.length} 句</p><div className="flex flex-wrap justify-center gap-3"><Button variant="outline" onClick={restart}><RotateCcw aria-hidden="true" />再练一遍</Button><Button onClick={onClose}>回到诗词</Button></div></div> : <form onSubmit={check} className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">第 {index + 1} / {poem.lines.length} 句{index > 0 && <> · 上一句：{poem.lines[index - 1].text}</>}</p>
      <Field><FieldLabel htmlFor="recitation-answer">默写第 {index + 1} 句</FieldLabel><Input ref={input} id="recitation-answer" value={answer} onChange={event => { setAnswer(event.target.value); setResult(null); }} maxLength={80} autoComplete="off" placeholder="在这里写下诗句" aria-invalid={result === "incorrect"} aria-describedby="recitation-feedback" /><FieldDescription>想不起来时可以先看提示，再继续练习。</FieldDescription></Field>
      <div id="recitation-feedback" role="status" aria-live="polite">{result && <Alert variant={result === "incorrect" ? "destructive" : "default"}><AlertDescription>{result === "correct" ? "答对了！可以继续下一句。" : "还有字不一样，再想一想，也可以查看这一句。"}</AlertDescription></Alert>}{revealed && <p className="mt-3 rounded-md bg-muted p-3 font-serif text-xl">{poem.lines[index].text}</p>}</div>
      <div className="flex flex-wrap gap-3"><Button type="submit" disabled={!answer.trim() || result === "correct"}>检查答案</Button><Button type="button" variant="outline" onClick={() => setRevealed(true)} disabled={revealed}>查看这一句</Button>{(result === "correct" || revealed) && <Button type="button" variant="secondary" onClick={next}>{index === poem.lines.length - 1 ? "查看结果" : "下一句"}</Button>}</div>
    </form>}
  </DialogContent></Dialog>;
}
