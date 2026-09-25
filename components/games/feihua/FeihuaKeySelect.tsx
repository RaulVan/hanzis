"use client";

import { forwardRef } from "react";
import { GameStars } from "@/components/games/GameStars";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { feihuaLinesFor } from "@/lib/feihua";
import { feihuaProgressKey, type FeihuaProgress } from "@/lib/feihuaProgress";
import type { FeihuaData, FeihuaTier } from "@/lib/feihuaTypes";

export const feihuaTierLabels: Record<FeihuaTier, string> = { basic: "入门", advanced: "进阶" };
const tierDescriptions: Record<FeihuaTier, string> = {
  basic: "诗句选自小学古诗词，每句挖掉一个字。",
  advanced: "诗句选自唐诗三百首、千家诗和初中古诗词，每句挖掉两个字。",
};

export const FeihuaKeySelect = forwardRef<HTMLHeadingElement, {
  data: FeihuaData;
  tier: FeihuaTier;
  progress: FeihuaProgress;
  onTierChange: (tier: FeihuaTier) => void;
  onStart: (key: string) => void;
}>(function FeihuaKeySelect({ data, tier, progress, onTierChange, onStart }, headingRef) {
  return (
    <section aria-labelledby="feihua-keys-title" className="study-panel flex min-w-0 flex-col gap-5 p-5 sm:p-6">
      <div className="flex flex-col gap-2">
        <h2 id="feihua-keys-title" ref={headingRef} tabIndex={-1} className="section-title">选一个字，开始行令</h2>
        <p className="text-muted-foreground">每轮 8 句诗都含有这个字。把挖掉的字补回去，答完就能看到出处，再去读整首诗。</p>
      </div>
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
      <ul aria-label={`${feihuaTierLabels[tier]}关键字`} className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {data.keys.map(key => {
          const stars = progress[feihuaProgressKey(tier, key)];
          const count = feihuaLinesFor(data, tier, key).length;
          return (
            <li key={key}>
              <Button
                variant="outline"
                onClick={() => onStart(key)}
                aria-label={`「${key}」字飞花令，${count} 句可选${stars ? `，已获得 ${stars} 颗星` : "，未完成"}`}
                className="h-auto w-full flex-col gap-1 px-2 py-3"
              >
                <span className="font-serif text-4xl font-normal leading-none">{key}</span>
                {stars ? <GameStars stars={stars} /> : <span className="text-xs font-normal text-muted-foreground">{count} 句</span>}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
});
