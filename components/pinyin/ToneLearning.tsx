"use client";

import { useState } from "react";
import { Info, Square, Volume2 } from "lucide-react";
import { AudioFeedback } from "@/components/pinyin/AudioFeedback";
import { TonePitchChart } from "@/components/pinyin/TonePitchChart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { tones } from "@/data/pinyin";
import { usePronunciation } from "@/hooks/usePronunciation";

interface ToneExample {
  char: string;
  pinyin: string;
  meaning: string;
}

interface ToneDetail {
  instruction: string;
  note: string;
  examples: ToneExample[];
}

const toneDetails: Record<number, ToneDetail> = {
  1: {
    instruction: "从高音区起音，保持平稳，不上扬也不下降。",
    note: "调值 55：起点和终点都在五度标记法的最高处。",
    examples: [
      { char: "妈", pinyin: "mā", meaning: "母亲" },
      { char: "天", pinyin: "tiān", meaning: "天空" },
      { char: "书", pinyin: "shū", meaning: "书本" },
    ],
  },
  2: {
    instruction: "从中音区起音，声音连续向高处上扬。",
    note: "调值 35：从中部的 3 上升到高处的 5。",
    examples: [
      { char: "麻", pinyin: "má", meaning: "麻布" },
      { char: "人", pinyin: "rén", meaning: "人们" },
      { char: "国", pinyin: "guó", meaning: "国家" },
    ],
  },
  3: {
    instruction: "单独读时先下降到低处，再向上回升；在词语中常会发生变调。",
    note: "单读调值 214：从较低处下降，再回升到中高处。",
    examples: [
      { char: "马", pinyin: "mǎ", meaning: "马匹" },
      { char: "你", pinyin: "nǐ", meaning: "你我" },
      { char: "水", pinyin: "shuǐ", meaning: "水流" },
    ],
  },
  4: {
    instruction: "从高音区起音，短促有力地快速下降。",
    note: "调值 51：从最高的 5 直接下降到最低的 1。",
    examples: [
      { char: "骂", pinyin: "mà", meaning: "责骂" },
      { char: "大", pinyin: "dà", meaning: "大小" },
      { char: "去", pinyin: "qù", meaning: "来去" },
    ],
  },
  0: {
    instruction: "读得短而轻，不标声调符号；实际音高会受前一个音节影响。",
    note: "轻声没有固定调值，因此曲线只表示短促，不把它画成固定的一声。",
    examples: [
      { char: "吗", pinyin: "ma", meaning: "语气词" },
      { char: "的", pinyin: "de", meaning: "结构助词" },
      { char: "了", pinyin: "le", meaning: "动态助词" },
    ],
  },
};

export function ToneLearning() {
  const [selectedToneId, setSelectedToneId] = useState(1);
  const audio = usePronunciation();
  const selectedTone = tones.find((tone) => tone.id === selectedToneId) ?? tones[0];
  const detail = toneDetails[selectedTone.id];
  const selectedAudioKey = `tone-${selectedTone.id}`;

  function selectTone(value: string) {
    if (!value) return;
    const toneId = Number(value);
    if (!toneDetails[toneId]) return;
    audio.stop();
    setSelectedToneId(toneId);
  }

  function playSelectedTone() {
    if (audio.activeKey === selectedAudioKey) {
      audio.stop();
      return;
    }
    void audio.play(selectedAudioKey, [selectedTone.example]);
  }

  return (
    <section aria-labelledby="tone-learning-title" className="flex min-w-0 flex-col gap-6">
      <h2 id="tone-learning-title" className="sr-only">四声与轻声学习</h2>

      <Alert>
        <Info aria-hidden="true" />
        <AlertTitle>声调标注口诀</AlertTitle>
        <AlertDescription>
          <p>有 a 先标 a；没有 a 找 o、e；i、u 并列标后一个；轻声不标调号。</p>
        </AlertDescription>
      </Alert>

      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,1fr)]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>听懂声调的高低变化</CardTitle>
            <CardDescription>选择一种声调，先看曲线，再跟着例字读。</CardDescription>
          </CardHeader>
          <CardContent>
            <ToggleGroup
              type="single"
              value={String(selectedToneId)}
              onValueChange={selectTone}
              variant="outline"
              spacing={3}
              aria-label="选择声调"
              className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
            >
              {tones.map((tone) => (
                <ToggleGroupItem
                  key={tone.id}
                  value={String(tone.id)}
                  aria-label={`${tone.name}，${tone.description}${tone.pitch === "-" ? "" : `，调值 ${tone.pitch}`}`}
                  className="h-auto min-h-40 w-full flex-col whitespace-normal p-4"
                >
                  <span className="flex w-full items-center justify-between gap-2 text-base">
                    <span>{tone.name}</span>
                    <span className="font-serif text-2xl" aria-hidden="true">{tone.symbol || "轻"}</span>
                  </span>
                  <TonePitchChart toneId={tone.id} className="max-h-24" />
                  <span className="text-xs text-muted-foreground">
                    {tone.pitch === "-" ? "短而轻，无固定调值" : `${tone.description} · 调值 ${tone.pitch}`}
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">曲线纵轴从低 1 到高 5；第三声展示单独朗读时的完整调形。</p>
          </CardFooter>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle>{selectedTone.name}</CardTitle>
              <Badge variant="secondary">
                {selectedTone.pitch === "-" ? "无固定调值" : `调值 ${selectedTone.pitch}`}
              </Badge>
            </div>
            <CardDescription>{detail.instruction}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <TonePitchChart toneId={selectedTone.id} className="mx-auto max-w-sm" />
            <p className="text-sm text-muted-foreground">{detail.note}</p>
            <Button onClick={playSelectedTone} className="w-full">
              {audio.activeKey === selectedAudioKey ? <Square data-icon="inline-start" aria-hidden="true" /> : <Volume2 data-icon="inline-start" aria-hidden="true" />}
              {audio.activeKey === selectedAudioKey ? "停止播放" : `播放 ${selectedTone.example.pinyin}`}
            </Button>
            <Separator />
            <div className="flex flex-col gap-3">
              <h3 className="text-base font-medium">跟着例字读</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {detail.examples.map((example) => {
                  const key = `tone-example-${selectedTone.id}-${example.char}`;
                  return (
                    <Button
                      key={example.char}
                      variant="outline"
                      className="h-auto min-w-0 flex-col gap-1 whitespace-normal py-3"
                      aria-label={`播放 ${example.char}，${example.pinyin}，${example.meaning}`}
                      onClick={() => void audio.play(key, [example])}
                    >
                      <span className="font-serif text-3xl font-normal">{example.char}</span>
                      <span className="text-base font-normal">{example.pinyin}</span>
                      <span className="text-xs font-normal text-muted-foreground">{example.meaning}</span>
                      {audio.activeKey === key ? <Spinner data-icon="inline-end" /> : <Volume2 data-icon="inline-end" aria-hidden="true" />}
                    </Button>
                  );
                })}
              </div>
            </div>
            <AudioFeedback {...audio} />
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              {selectedTone.id === 0
                ? "轻声示例使用设备的系统中文语音，不会拿一声录音代替。"
                : "一至四声优先播放站内本地录音；播放失败时可直接重试。"}
            </p>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
