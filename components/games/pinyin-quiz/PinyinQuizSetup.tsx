"use client";

import { forwardRef } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { PinyinQuizMode } from "@/data/pinyinQuizItems";
import { UNTIMED_QUESTION_COUNT, type PinyinQuizDuration, type PinyinToneMode } from "@/lib/pinyinQuiz";
import { pinyinQuizSettingsKey, type PinyinQuizProgress, type PinyinQuizSettings } from "@/lib/pinyinQuizProgress";

export const modeLabels: Record<PinyinQuizMode, string> = { character: "单字", word: "词语" };
export const toneModeLabels: Record<PinyinToneMode, string> = { plain: "不标调", toned: "标声调" };
export const durationLabel = (duration: PinyinQuizDuration) => duration === 0 ? `不限时 ${UNTIMED_QUESTION_COUNT} 题` : `${duration} 秒`;

function Choice<T extends string | number>({ legend, value, options, label, onChange }: {
  legend: string;
  value: T;
  options: readonly T[];
  label: (option: T) => string;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-2 text-sm font-semibold">{legend}</legend>
      <ToggleGroup
        type="single"
        value={String(value)}
        onValueChange={next => { const option = options.find(item => String(item) === next); if (option !== undefined) onChange(option); }}
        variant="outline"
        aria-label={legend}
        className="w-full flex-wrap sm:w-fit"
      >
        {options.map(option => <ToggleGroupItem key={option} value={String(option)} className="min-h-11 flex-1 px-4 text-base sm:flex-none">{label(option)}</ToggleGroupItem>)}
      </ToggleGroup>
    </fieldset>
  );
}

export const PinyinQuizSetup = forwardRef<HTMLHeadingElement, {
  settings: PinyinQuizSettings;
  progress: PinyinQuizProgress;
  onChange: (settings: PinyinQuizSettings) => void;
  onStart: () => void;
}>(function PinyinQuizSetup({ settings, progress, onChange, onStart }, headingRef) {
  const best = progress[pinyinQuizSettingsKey(settings)];
  return (
    <section aria-labelledby="pinyin-quiz-setup-title" className="study-panel mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-6 p-5 sm:p-6">
      <div className="flex flex-col gap-2">
        <h2 id="pinyin-quiz-setup-title" ref={headingRef} tabIndex={-1} className="section-title">选择题型开始快答</h2>
        <p className="text-muted-foreground">看到汉字就写出拼音，按回车提交。答错可以再试，想不出来就跳过看答案。</p>
      </div>
      <Choice legend="题型" value={settings.mode} options={["character", "word"] as const} label={option => modeLabels[option]} onChange={mode => onChange({ ...settings, mode })} />
      <Choice legend="声调" value={settings.toneMode} options={["plain", "toned"] as const} label={option => toneModeLabels[option]} onChange={toneMode => onChange({ ...settings, toneMode })} />
      <Choice legend="时间" value={settings.duration} options={[90, 180, 0] as const} label={durationLabel} onChange={duration => onChange({ ...settings, duration })} />
      <p className="text-sm text-muted-foreground">
        {settings.toneMode === "toned" ? "标声调时用数字写在音节后，如 hao3；也可以直接输入 ā á ǎ à。轻声可以不写。" : "不标调时只看字母是否拼对。"}
        ü 可以输入 v，如 lv 表示 lü。
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <Button size="lg" onClick={onStart}>
          <Play data-icon="inline-start" aria-hidden="true" />
          开始
        </Button>
        <p className="text-sm text-muted-foreground">{best ? `这个设置的最好成绩：答对 ${best.score} 题，最长连对 ${best.bestStreak} 题` : "这个设置还没有成绩"}</p>
      </div>
    </section>
  );
});
