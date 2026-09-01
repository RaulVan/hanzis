"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useWorksheetStore } from "@/stores/worksheetStore";
import { extractWorksheetCharacters, MAX_WORKSHEET_CHARACTERS, MAX_WORKSHEET_INPUT_LENGTH } from "@/lib/worksheetConfig";
import { defaultWorksheetConfig } from "@/types";

export function InputPanel() {
  const { config, setInputText, setComposing } = useWorksheetStore();
  const [localText, setLocalText] = React.useState(config.characters);
  const composing = React.useRef(false);
  const count = extractWorksheetCharacters(localText).length;
  const overLimit = count > MAX_WORKSHEET_CHARACTERS;

  React.useEffect(() => {
    if (!composing.current) setLocalText(config.characters);
  }, [config.characters]);

  const replaceText = (text: string, message: string) => {
    const previous = config.characters;
    setLocalText(text);
    setInputText(text);
    toast(message, { action: { label: "撤销", onClick: () => setInputText(previous) } });
  };

  return (
    <FieldGroup className="gap-2">
      <Field data-invalid={overLimit || undefined} className="gap-2">
        <FieldLabel htmlFor="worksheet-text" className="sr-only">练习内容</FieldLabel>
        <Textarea id="worksheet-text" value={localText} maxLength={MAX_WORKSHEET_INPUT_LENGTH}
          placeholder="输入汉字或粘贴一段诗文……" className="min-h-24 resize-y"
          aria-invalid={overLimit || undefined} aria-describedby="worksheet-text-help worksheet-text-count"
          onCompositionStart={() => { composing.current = true; setComposing(true); }}
          onCompositionEnd={(event) => {
            composing.current = false;
            setLocalText(event.currentTarget.value);
            setInputText(event.currentTarget.value);
            setComposing(false);
          }}
          onChange={(event) => {
            const text = event.target.value;
            setLocalText(text);
            if (!composing.current && !(event.nativeEvent as InputEvent).isComposing) setInputText(text);
          }}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span id="worksheet-text-count" className="text-sm tabular-nums text-muted-foreground">{count} 个汉字</span>
          <span className="text-xs text-muted-foreground">最多 {MAX_WORKSHEET_CHARACTERS} 字</span>
        </div>
        {overLimit ? <FieldError>超出 {count - MAX_WORKSHEET_CHARACTERS} 字，请删减后导出。预览仅显示前 {MAX_WORKSHEET_CHARACTERS} 字。</FieldError> : null}
        <FieldDescription id="worksheet-text-help" className="sr-only">原文中的标点、空格和换行会保留；字帖只提取汉字，每个字练习一行。</FieldDescription>
      </Field>
      <div className="grid grid-cols-3 gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => replaceText("一二三四五六七八九十", "已载入基础汉字")}>基础汉字</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => replaceText(defaultWorksheetConfig.characters, "已载入《春晓》诗句")}>古诗练习</Button>
        <Button type="button" variant="outline" size="sm" disabled={!localText} onClick={() => replaceText("", "已清空，仍可导出空白字格")}>
          <Trash2 data-icon="inline-start" />清空
        </Button>
      </div>
    </FieldGroup>
  );
}
