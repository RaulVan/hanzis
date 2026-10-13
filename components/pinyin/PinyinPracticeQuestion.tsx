"use client";
import { UiText } from "@/components/i18n/UiText";
import { useTranslate } from "@/components/i18n/LanguageProvider";

import { ArrowRight, CheckCircle2, CircleAlert, Ear, RefreshCw, Square, Volume2 } from "lucide-react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { PracticeOption, PracticeQuestion } from "@/lib/pinyinPractice";

interface AnswerResult {
  correct: boolean;
  correctOption: PracticeOption;
  selectedOption: PracticeOption | null;
}

interface PracticeAudioState {
  activeKey: string | null;
  error: string | null;
  retry: () => void;
}

interface PinyinPracticeQuestionProps {
  question: PracticeQuestion;
  questionNumber: number;
  total: number;
  selectedOptionId: string;
  result: AnswerResult | null;
  audio: PracticeAudioState;
  onAnswer: (optionId: string) => void;
  onPlay: () => void;
  onNext: () => void;
}

export function PinyinPracticeQuestion({
  question,
  questionNumber,
  total,
  selectedOptionId,
  result,
  audio,
  onAnswer,
  onPlay,
  onNext,
}: PinyinPracticeQuestionProps) {
  const t = useTranslate();
  const answered = result !== null;
  const audioKey = `practice-${question.id}`;
  const isPlaying = audio.activeKey === audioKey;
  const isLastQuestion = questionNumber === total;

  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary"><UiText text="第 {0} 题" values={[questionNumber]} /></Badge>
          <Badge variant="outline"><UiText>{question.kind === "sight" ? "看字选拼音" : "听音辨调"}</UiText></Badge>
        </div>
        <CardTitle><UiText>{question.prompt}</UiText></CardTitle>
        <CardDescription>
          <UiText>{question.kind === "sight"
            ? "观察汉字，选出声母、韵母和声调都正确的拼音。"
            : "先播放题目发音，再判断它属于哪一种声调。"}</UiText>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {question.kind === "sight" ? (
          <div className="flex min-h-32 items-center justify-center rounded-xl bg-muted p-5" aria-label={t("汉字 {0}", [question.char])}>
            <span className="font-serif text-7xl leading-none"><UiText>{question.char}</UiText></span>
          </div>
        ) : (
          <div className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl bg-muted p-5">
            <Ear aria-hidden="true" />
            <Button variant="outline" onClick={onPlay}>
              {isPlaying ? <Square data-icon="inline-start" aria-hidden="true" /> : <Volume2 data-icon="inline-start" aria-hidden="true" />}
              <UiText>{isPlaying ? "停止播放" : "播放题目发音"}</UiText>
            </Button>
            <p className="text-sm text-muted-foreground"><UiText text="可以重复播放，再选择答案。" /></p>
          </div>
        )}

        {question.kind === "audio-tone" && audio.error ? (
          <Alert variant="destructive">
            <CircleAlert aria-hidden="true" />
            <AlertTitle><UiText text="声音暂时无法播放" /></AlertTitle>
            <AlertDescription>
              <p><UiText>{audio.error}</UiText></p>
              <Button size="sm" variant="outline" onClick={audio.retry}>
                <RefreshCw data-icon="inline-start" aria-hidden="true" />
                <UiText text="重试播放" /></Button>
            </AlertDescription>
          </Alert>
        ) : null}

        <ToggleGroup
          type="single"
          value={selectedOptionId}
          onValueChange={(value) => { if (value && !answered) onAnswer(value); }}
          variant="outline"
          spacing={3}
          aria-label={t("选择答案")}
          className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {question.options.map((option) => (
            <ToggleGroupItem
              key={option.id}
              value={option.id}
              disabled={answered}
              aria-label={t("选择 {0}", [option.label])}
              className="h-auto min-h-14 w-full whitespace-normal px-4 py-3 text-base"
            >
              <UiText>{option.label}</UiText>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {result ? (
          <Alert variant={result.correct ? "default" : "destructive"}>
            {result.correct ? <CheckCircle2 aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}
            <AlertTitle><UiText>{result.correct ? "回答正确" : `回答有误，正确答案是 ${result.correctOption.label}`}</UiText></AlertTitle>
            <AlertDescription>
              <p><UiText>{question.explanation}</UiText></p>
              {question.kind === "audio-tone" ? (
                <p><UiText>{question.tone === 0 ? "本题轻声由系统中文语音朗读。" : "本题使用站内本地录音。"}</UiText></p>
              ) : null}
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>

      <CardFooter className="justify-between">
        <p className="text-sm text-muted-foreground">
          <UiText>{answered ? "已记录本题结果。" : "选择答案后才能进入下一题。"}</UiText>
        </p>
        <Button onClick={onNext} disabled={!answered}>
          <UiText>{isLastQuestion ? "查看成绩" : "下一题"}</UiText>
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Button>
      </CardFooter>
    </Card>
  );
}
