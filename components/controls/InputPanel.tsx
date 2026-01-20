"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useWorksheetStore } from "@/stores/worksheetStore";
import { filterChineseCharacters } from "@/lib/utils";

export function InputPanel() {
  const { config, setInputText } = useWorksheetStore();
  const [localText, setLocalText] = React.useState(config.characters);

  // Sync local text with store
  React.useEffect(() => {
    setLocalText(config.characters);
  }, [config.characters]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setLocalText(text);
    // Filter and set only Chinese characters
    const filtered = filterChineseCharacters(text);
    setInputText(filtered);
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <Textarea
          placeholder="在此输入要练习的汉字..."
          value={localText}
          onChange={handleTextChange}
          className="min-h-[100px] resize-none border-gray-200 focus:border-gray-300"
        />
      </CardContent>
    </Card>
  );
}
