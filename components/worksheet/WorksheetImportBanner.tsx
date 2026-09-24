"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { extractWorksheetCharacters, MAX_WORKSHEET_CHARACTERS, MAX_WORKSHEET_INPUT_LENGTH } from "@/lib/worksheetConfig";
import { useWorksheetStore } from "@/stores/worksheetStore";

export function WorksheetImportBanner({ disabled = false }: { disabled?: boolean }) {
  const search = useSearchParams();
  const incoming = search.get("text");
  const router = useRouter();
  const applied = React.useRef<string | null>(null);
  const [dismissed, setDismissed] = React.useState<string | null>(null);
  const { config, setInputText, hasHydrated } = useWorksheetStore();
  const count = extractWorksheetCharacters(incoming ?? "").length;
  const direct = search.get("generate") === "poetry" && count > 0 && count <= MAX_WORKSHEET_CHARACTERS && Array.from(incoming ?? "").length <= MAX_WORKSHEET_INPUT_LENGTH;
  React.useEffect(() => {
    if (!direct) { applied.current = null; return; }
    if (!incoming || !hasHydrated || disabled || applied.current === incoming) return;
    applied.current = incoming;
    const previous = useWorksheetStore.getState().config.characters;
    setInputText(incoming);
    useWorksheetStore.getState().setCurrentPage(0);
    // Consume the request so refreshing after editing cannot restore the previous poem.
    const remaining = new URLSearchParams(search.toString());
    remaining.delete("text"); remaining.delete("generate");
    router.replace(remaining.size ? `/?${remaining}` : "/", { scroll: false });
    toast("正在生成诗词字帖", { action: { label: "撤销", onClick: () => setInputText(previous) } });
  }, [direct, incoming, hasHydrated, disabled, search, router, setInputText]);
  if (!incoming || incoming === dismissed || !hasHydrated || direct) return null;
  return (
    <Alert>
      <AlertTitle>有一段文字可以用来练习</AlertTitle>
      <AlertDescription>
        <p className="break-all">{Array.from(incoming).slice(0, 100).join("")}{Array.from(incoming).length > 100 ? "……" : ""}</p>
        <p>{count ? `${count} 个汉字；只有确认后才会替换当前练习内容。` : "这段文字没有可生成字帖的汉字，当前内容不会改变。"}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button disabled={disabled || count === 0} onClick={() => {
            const previous = config.characters;
            setInputText(incoming);
            setDismissed(incoming);
            toast("已导入练习内容", { action: { label: "撤销", onClick: () => setInputText(previous) } });
          }}>使用这段文字</Button>
          <Button variant="outline" disabled={disabled} onClick={() => setDismissed(incoming)}>保留当前内容</Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
