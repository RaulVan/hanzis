"use client";
import { UiText } from "@/components/i18n/UiText";
import { useTranslate } from "@/components/i18n/LanguageProvider";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, RotateCcw, Trophy } from "lucide-react";
import { PinyinPracticeQuestion } from "@/components/pinyin/PinyinPracticeQuestion";
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
import { usePronunciation } from "@/hooks/usePronunciation";
import {
  createPracticeRound,
  getPracticeResultMessage,
  gradePracticeAnswer,
  PRACTICE_QUESTION_COUNT,
} from "@/lib/pinyinPractice";

export function PinyinPractice() {
  const t = useTranslate();
  const [round, setRound] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);
  const audio = usePronunciation();
  const questions = useMemo(() => createPracticeRound(round), [round]);
  const question = questions[questionIndex];
  const result = selectedOptionId ? gradePracticeAnswer(question, selectedOptionId) : null;
  const completedCount = questionIndex + (result ? 1 : 0);

  function answer(optionId: string) {
    if (selectedOptionId) return;
    const answerResult = gradePracticeAnswer(question, optionId);
    audio.stop();
    setSelectedOptionId(optionId);
    if (answerResult.correct) setScore((current) => current + 1);
  }

  function playQuestion() {
    if (audio.activeKey === `practice-${question.id}`) {
      audio.stop();
      return;
    }
    void audio.play(`practice-${question.id}`, [{ char: question.char, pinyin: question.pinyin }]);
  }

  function goNext() {
    if (!result) return;
    audio.stop();
    if (questionIndex === questions.length - 1) {
      setComplete(true);
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelectedOptionId("");
  }

  function restart() {
    audio.stop();
    setRound((current) => current + 1);
    setQuestionIndex(0);
    setSelectedOptionId("");
    setScore(0);
    setComplete(false);
  }

  if (complete) {
    return (
      <section aria-labelledby="practice-result-title" className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader className="items-center text-center">
            <Trophy aria-hidden="true" />
            <CardTitle id="practice-result-title"><UiText text="本轮练习完成" /></CardTitle>
            <CardDescription><UiText text="十道题已经全部作答，结果只保留在当前页面。" /></CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 text-center" aria-live="polite">
            <p className="font-serif text-6xl leading-none">
              {score}<span className="text-2xl text-muted-foreground"> / {questions.length}</span>
            </p>
            <p className="max-w-lg text-muted-foreground"><UiText>{getPracticeResultMessage(score, questions.length)}</UiText></p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button onClick={restart}>
              <RotateCcw data-icon="inline-start" aria-hidden="true" />
              <UiText text="再练一轮" /></Button>
            <Button asChild variant="outline">
              <Link href="/pinyin/tones/">
                <BookOpen data-icon="inline-start" aria-hidden="true" />
                <UiText text="回到声调学习" /></Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    );
  }

  return (
    <section aria-labelledby="practice-title" className="mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-5">
      <div className="flex min-w-0 flex-col gap-3" aria-label={t("练习进度")}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="practice-title" className="text-lg font-semibold"><UiText text="拼音综合练习" /></h2>
            <Badge variant="outline"><UiText text="第 {0} 轮" values={[round + 1]} /></Badge>
          </div>
          <p className="text-sm text-muted-foreground"><UiText text="已答对 {0} 题" values={[score]} /></p>
        </div>
        <progress
          max={PRACTICE_QUESTION_COUNT}
          value={completedCount}
          aria-label={t("已完成 {0} 道，共 {1} 道", [completedCount, PRACTICE_QUESTION_COUNT])}
          className="h-2 w-full accent-primary"
       />
        <p className="text-sm text-muted-foreground">
          <UiText text="每轮固定 10 题：5 道看字选拼音与 5 道听音辨调交替出现。" /></p>
      </div>

      <PinyinPracticeQuestion
        question={question}
        questionNumber={questionIndex + 1}
        total={questions.length}
        selectedOptionId={selectedOptionId}
        result={result}
        audio={audio}
        onAnswer={answer}
        onPlay={playQuestion}
        onNext={goNext}
     />

      <p className="text-center text-sm text-muted-foreground">
        <UiText text="一至四声使用站内本地录音；轻声使用设备的系统中文语音，不会用一声录音代替。" /></p>
    </section>
  );
}
