"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StrokeAnimation } from "./StrokeAnimation";
import { StrokeFanning } from "./StrokeFanning";
import { StrokeInfo } from "./StrokeInfo";
import { loadCnchar, getCharacterInfo } from "@/lib/cncharHelper";
import { filterChineseCharacters } from "@/lib/utils";
import type { CharacterInfo } from "@/types";

// Common characters for quick selection
const commonChars = [
  { label: "常用字", chars: "一二三四五六七八九十" },
  { label: "人物", chars: "人大小天地日月水火山" },
  { label: "动作", chars: "走跑跳飞看听说写读画" },
];

export function StrokeViewer() {
  const [input, setInput] = React.useState("");
  const [currentChar, setCurrentChar] = React.useState<string | null>(null);
  const [charInfo, setCharInfo] = React.useState<CharacterInfo | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Initialize cnchar
  React.useEffect(() => {
    loadCnchar().then(() => {
      setIsInitialized(true);
    });
  }, []);

  // Handle character search
  const handleSearch = React.useCallback(() => {
    if (!isInitialized || !input.trim()) return;

    const filtered = filterChineseCharacters(input);
    if (!filtered) return;

    // Take only the first character
    const char = filtered[0];
    setCurrentChar(char);
    setIsLoading(true);

    try {
      const info = getCharacterInfo(char);
      setCharInfo(info);
    } catch (error) {
      console.error("Failed to get character info:", error);
      setCharInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [input, isInitialized]);

  // Handle quick select
  const handleQuickSelect = (char: string) => {
    setInput(char);
    setCurrentChar(char);
    setIsLoading(true);

    try {
      const info = getCharacterInfo(char);
      setCharInfo(info);
    } catch (error) {
      console.error("Failed to get character info:", error);
      setCharInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-400">正在加载...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      {/* Left: Animation & Fanning */}
      <div className="space-y-6">
        {/* Search Input */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入要查询的汉字..."
                className="text-lg"
                maxLength={10}
              />
              <Button onClick={handleSearch} disabled={!input.trim()}>
                查询
              </Button>
            </div>

            {/* Quick select */}
            <div className="mt-4 space-y-2">
              {commonChars.map((group) => (
                <div key={group.label} className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500 w-12">{group.label}</span>
                  <div className="flex flex-wrap gap-1">
                    {group.chars.split("").map((char) => (
                      <button
                        key={char}
                        onClick={() => handleQuickSelect(char)}
                        className="w-8 h-8 rounded border border-gray-200 text-sm font-medium hover:border-rose-300 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        {char}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Animation Display */}
        {currentChar && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span>笔顺动画</span>
                <span className="text-3xl font-normal">{currentChar}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StrokeAnimation char={currentChar} />
            </CardContent>
          </Card>
        )}

        {/* Stroke Fanning */}
        {currentChar && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">笔画分解</CardTitle>
            </CardHeader>
            <CardContent>
              <StrokeFanning char={currentChar} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right: Character Info */}
      <div className="space-y-6">
        {currentChar && charInfo && (
          <StrokeInfo char={currentChar} info={charInfo} isLoading={isLoading} />
        )}

        {!currentChar && (
          <Card>
            <CardContent className="p-6 text-center text-gray-400">
              <p>请输入或选择一个汉字</p>
              <p className="text-sm mt-1">查看笔顺动画和详细信息</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
