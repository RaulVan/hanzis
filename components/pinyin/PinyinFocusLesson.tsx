"use client";

import { useState } from "react";
import Link from "next/link";
import { Volume2 } from "lucide-react";
import { UiText } from "@/components/i18n/UiText";
import { useTranslate } from "@/components/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { usePronunciation } from "@/hooks/usePronunciation";
import { AudioFeedback } from "./AudioFeedback";

const lessons = {
  aspiration: {
    title: "送气与不送气：比较 b/p、d/t、g/k",
    paragraphs: [
      "把手轻放在嘴前，成对读同一韵母、同一声调的音节，比较气流：b、d、g 不送气，p、t、k 送气。区别在气流，不在声音大小。",
      "下方播放的是完整音节。声母表中的 bō、pō 等是便于学习的呼读音；拼读 bà 时，不要把 bō 和 à 连成两个音节。",
    ],
    examples: [{ char: "八", pinyin: "bā" }, { char: "趴", pinyin: "pā" }, { char: "搭", pinyin: "dā" }, { char: "他", pinyin: "tā" }, { char: "哥", pinyin: "gē" }, { char: "科", pinyin: "kē" }],
    questions: [
      { prompt: "bā 和 pā 中，哪个音节的声母送气？", choices: ["bā", "pā"], answer: "pā", explanation: "p 送气，b 不送气。两个音节都用 ā，比较时重点体会开头的气流。" },
      { prompt: "下面哪一组声母都不送气？", choices: ["p、t、k", "b、d、g"], answer: "b、d、g", explanation: "b、d、g 不送气；与它们对应的 p、t、k 送气。" },
    ],
  },
  "u-spelling": {
    title: "ü 的拼写与键盘输入",
    paragraphs: [
      "ü 跟 j、q、x 相拼时省略两点，写作 ju、qu、xu；跟 n、l 相拼时保留两点，如 nǚ、lǜ。省略两点不代表把 ü 改读成 u。",
      "ü 自成音节时前面加 y 并省略两点，如 yú；同一组还有 yue、yuan、yun。这里的规则说明拼写，不把 y 当作与 j、q、x 相同的声母来讲解。",
      "本站拼音快答允许用 v 或 u: 代替 ü，例如带调模式可输入 nv3 表示 nǚ。这是键盘输入方式，书面拼音仍写 nǚ。课程小练习只选择规范拼写。",
    ],
    examples: [{ char: "女", pinyin: "nǚ" }, { char: "绿", pinyin: "lǜ" }, { char: "居", pinyin: "jū" }, { char: "去", pinyin: "qù" }, { char: "虚", pinyin: "xū" }, { char: "鱼", pinyin: "yú" }],
    questions: [
      { prompt: "“去”的规范拼音是哪一个？", choices: ["qǜ", "qù", "qv4"], answer: "qù", explanation: "ü 与 q 相拼省略两点，第四声标在 u 上，写作 qù。qv4 可以是程序接受的输入，但不是书面拼音。" },
      { prompt: "“女”的规范拼音是哪一个？", choices: ["nǔ", "nv3", "nǚ"], answer: "nǚ", explanation: "ü 与 n 相拼保留两点。nǔ 与 nǚ 的韵母不同；nv3 只是本站支持的键盘输入。" },
    ],
  },
} as const;

export function PinyinFocusLesson({ kind }: { kind: keyof typeof lessons }) {
  const lesson = lessons[kind];
  const t = useTranslate();
  const audio = usePronunciation();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  return <section id={kind} aria-labelledby={`${kind}-title`} className="study-panel mt-6 scroll-mt-24 space-y-5 p-5 sm:p-8">
    <h2 id={`${kind}-title`} className="section-title"><UiText>{lesson.title}</UiText></h2>
    {lesson.paragraphs.map(paragraph => <p key={paragraph} className="body-copy"><UiText>{paragraph}</UiText></p>)}
    <div className="flex flex-wrap gap-2">{lesson.examples.map(example => <Button key={example.pinyin} variant="outline" aria-label={t("播放例字 {0} {1}", [example.char, example.pinyin])} onClick={() => void audio.play(`${kind}:${example.pinyin}`, [example])}><Volume2 aria-hidden="true" /><span>{example.char} <span lang="zh-Latn">{example.pinyin}</span></span></Button>)}</div>
    <AudioFeedback {...audio} />
    <div className="space-y-4"><h3 className="font-medium"><UiText text="试一试，选出答案" /></h3>{lesson.questions.map((question, index) => <fieldset key={question.prompt} className="rounded-lg border p-4"><legend className="px-1 text-sm font-medium"><UiText>{question.prompt}</UiText></legend><div className="flex flex-wrap gap-3">{question.choices.map(choice => <label key={choice} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3"><input type="radio" name={`${kind}-${index}`} value={choice} checked={answers[index] === choice} onChange={() => setAnswers(previous => ({ ...previous, [index]: choice }))} />{choice}</label>)}</div>{answers[index] && <p role="status" className="mt-3 text-sm leading-7"><strong><UiText>{answers[index] === question.answer ? "答对了。" : "再比较一下。"}</UiText></strong> <UiText>{question.explanation}</UiText></p>}</fieldset>)}</div>
    <div className="flex flex-wrap items-center gap-3"><Button variant="outline" onClick={() => setAnswers({})}><UiText text="重新练习本单元" /></Button><Button asChild variant="ghost"><Link href="/games/pinyin-quiz/"><UiText text="进入拼音快答（综合练习）" /></Link></Button></div>
  </section>;
}
