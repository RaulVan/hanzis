"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { extractWorksheetCharacters } from "@/lib/worksheetConfig";
import { useWorksheetStore } from "@/stores/worksheetStore";

export function WorksheetImportBanner({ disabled = false }: { disabled?: boolean }) {
  const search = useSearchParams();
  const incoming = search.get("text");
  const [dismissed, setDismissed] = React.useState<string | null>(null);
  const { config, setInputText, hasHydrated } = useWorksheetStore();
  if (!incoming || incoming === dismissed || !hasHydrated) return null;
  const count = extractWorksheetCharacters(incoming).length;
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
