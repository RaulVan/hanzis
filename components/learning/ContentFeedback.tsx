"use client";

import { useId, useState } from "react";
import { useTranslate } from "@/components/i18n/LanguageProvider";
import { UiText } from "@/components/i18n/UiText";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const feedbackEmail = "f35j10@gmail.com";

/** A user-reviewed mail draft, never an automatic upload or submission. */
export function ContentFeedback({ contentId }: { contentId: string }) {
  const t = useTranslate();
  const draftId = useId();
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("");

  function prepare() {
    // Omit query parameters: worksheet URLs may contain the user's input text.
    setDraft(`${t("页面")}：https://hanzis.com${window.location.pathname}\n${t("内容标识")}：${contentId}\n${t("问题类型（读音、释义或功能）")}：\n${t("问题描述")}：\n`);
    setStatus("");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(draft);
      setStatus("已复制反馈文本，尚未发送。");
    } catch {
      setStatus("无法自动复制，请选中文本手动复制。");
    }
  }

  return <Dialog>
    <DialogTrigger asChild><Button variant="outline" size="sm" onClick={prepare}><UiText text="报告问题" /></Button></DialogTrigger>
    <DialogContent className="max-h-[85dvh] overflow-y-auto">
      <DialogHeader><DialogTitle><UiText text="内容反馈" /></DialogTitle><DialogDescription><UiText text="检查并补充下面的内容，再打开邮件草稿发送。也可以复制文本；本站不会自动发送反馈。" /></DialogDescription></DialogHeader>
      <label htmlFor={draftId} className="text-sm font-medium"><UiText text="反馈文本" /></label>
      <Textarea id={draftId} value={draft} onChange={event => { setDraft(event.target.value); setStatus(""); }} rows={8} maxLength={4000} />
      <p className="break-all text-sm text-muted-foreground"><UiText text="接收邮箱" />：{feedbackEmail}</p>
      <div className="flex flex-wrap gap-3">
        <Button asChild><a href={`mailto:${feedbackEmail}?subject=${encodeURIComponent(t("汉字网内容反馈"))}&body=${encodeURIComponent(draft)}`}><UiText text="打开邮件草稿" /></a></Button>
        <Button variant="outline" onClick={() => void copy()}><UiText text="复制反馈文本" /></Button>
      </div>
      <p role="status" className="text-sm text-muted-foreground"><UiText>{status || "尚未发送，请在邮件应用中确认发送。"}</UiText></p>
    </DialogContent>
  </Dialog>;
}
