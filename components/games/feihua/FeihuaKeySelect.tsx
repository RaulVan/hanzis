"use client";

import { forwardRef } from "react";
import { GameStars } from "@/components/games/GameStars";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FEIHUA_THEMES, feihuaLinesFor, feihuaThemeLines, type FeihuaMode } from "@/lib/feihua";
import { feihuaProgressKey, type FeihuaProgress } from "@/lib/feihuaProgress";
import type { FeihuaData, FeihuaTier } from "@/lib/feihuaTypes";

export const feihuaTierLabels: Record<FeihuaTier, string> = { basic: "入门", advanced: "进阶" };
export const feihuaModeLabels: Record<FeihuaMode, string> = { fill: "填空", theme: "主题", recite: "对句" };
const tierDescriptions: Record<FeihuaTier, string> = {
  basic: "诗句选自小学古诗词。填空每句挖掉一个字。",
  advanced: "诗句选自唐诗三百首、千家诗和初中古诗词。填空每句挖掉两个字。",
};
const modeDescriptions: Record<FeihuaMode, string> = {
  fill: "每轮 8 句都含有你选的字。把挖掉的字补回去。",
  theme: "按春天、月夜、山水这类主题出句。主题字留在句中，挖掉的是别的字。",
  recite: "自己写一句五言或七言。词库里有的会接上，没有的提示未收录，然后系统再给一句。",
};

export const FeihuaKeySelect = forwardRef<HTMLHeadingElement, {
  data: FeihuaData;
  tier: FeihuaTier;
  mode: FeihuaMode;
  progress: FeihuaProgress;
  onTierChange: (tier: FeihuaTier) => void;
  onModeChange: (mode: FeihuaMode) => void;
  onStart: (id: string) => void;
}>(function FeihuaKeySelect({ data, tier, mode, progress, onTierChange, onModeChange, onStart }, headingRef) {
  const choices = mode === "theme"
    ? FEIHUA_THEMES.map(theme => ({ id: theme.id, label: theme.name, count: feihuaThemeLines(data, tier, theme.id).length, large: false }))
    : data.keys.map(key => ({ id: key, label: key, count: feihuaLinesFor(data, tier, key).length, large: true }));
  return (
    <section aria-labelledby="feihua-keys-title" className="study-panel flex min-w-0 flex-col gap-5 p-5 sm:p-6">
      <div className="flex flex-col gap-2">
        <h2 id="feihua-keys-title" ref={headingRef} tabIndex={-1} className="section-title">{mode === "theme" ? "选一个主题，开始行令" : "选一个字，开始行令"}</h2>
        <p className="text-muted-foreground">{modeDescriptions[mode]}答完就能看到出处，再去读整首诗。</p>
      </div>
      <ToggleGroup
        type="single"
        value={mode}
        onValueChange={value => { if (value) onModeChange(value as FeihuaMode); }}
        variant="outline"
        aria-label="选择玩法"
        className="w-full sm:w-fit"
      >
        {(["fill", "theme", "recite"] as const).map(item => <ToggleGroupItem key={item} value={item} className="min-h-11 flex-1 px-5 text-base sm:flex-none">{feihuaModeLabels[item]}</ToggleGroupItem>)}
      </ToggleGroup>
      <ToggleGroup
        type="single"
        value={tier}
        onValueChange={value => { if (value) onTierChange(value as FeihuaTier); }}
        variant="outline"
        aria-label="选择难度"
        className="w-full sm:w-fit"
      >
        {(["basic", "advanced"] as const).map(item => <ToggleGroupItem key={item} value={item} className="min-h-11 flex-1 px-5 text-base sm:flex-none">{feihuaTierLabels[item]}</ToggleGroupItem>)}
      </ToggleGroup>
      <p className="text-sm text-muted-foreground">{tierDescriptions[tier]}</p>
      <ul aria-label={mode === "theme" ? `${feihuaTierLabels[tier]}主题` : `${feihuaTierLabels[tier]}关键字`} className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {choices.map(choice => {
          const stars = progress[feihuaProgressKey(tier, choice.id, mode)];
          const name = mode === "theme" ? `${choice.label}主题飞花令` : mode === "recite" ? `「${choice.label}」字对句` : `「${choice.label}」字飞花令`;
          return (
            <li key={choice.id}>
              <Button
                variant="outline"
                onClick={() => onStart(choice.id)}
                aria-label={`${name}，${choice.count} 句可选${stars ? `，已获得 ${stars} 颗星` : "，未完成"}`}
                className="h-auto w-full flex-col gap-1 px-2 py-3"
              >
                <span className={choice.large ? "font-serif text-4xl font-normal leading-none" : "font-serif text-2xl font-normal leading-none"}>{choice.label}</span>
                {stars ? <GameStars stars={stars} /> : <span className="text-xs font-normal text-muted-foreground">{choice.count} 句</span>}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
});
