"use client";

import * as React from "react";
import type HanziWriter from "hanzi-writer";
import {
  CheckCircle2,
  CircleAlert,
  Lightbulb,
  Pause,
  PencilLine,
  Play,
  RotateCcw,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { HanziData } from "@/lib/hanziData";
import { createLocalStrokeDataLoader } from "@/lib/strokeDataLoader";
import { getStrokeSpeed, STROKE_SPEEDS, type StrokeSpeedId } from "@/lib/strokeLearning";

interface StrokeAnimationProps {
  char: string;
  data: HanziData;
  strokeCount: number;
}

type EngineState = "loading" | "ready" | "error";
type ActivityState = "idle" | "playing" | "paused" | "quiz" | "quiz-complete";

function readDesignToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function useCanvasSize() {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState(300);

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const update = (width: number) => setSize(Math.max(240, Math.min(360, Math.floor(width))));
    update(stage.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => update(entries[0]?.contentRect.width ?? 300));
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  return { stageRef, size };
}

export function StrokeAnimation({ char, data, strokeCount }: StrokeAnimationProps) {
  const writerContainerRef = React.useRef<HTMLDivElement>(null);
  const writerRef = React.useRef<HanziWriter | null>(null);
  const { stageRef, size } = useCanvasSize();
  const [speedId, setSpeedId] = React.useState<StrokeSpeedId>("normal");
  const [engineState, setEngineState] = React.useState<EngineState>("loading");
  const [engineError, setEngineError] = React.useState("");
  const [engineRevision, setEngineRevision] = React.useState(0);
  const [activity, setActivity] = React.useState<ActivityState>("idle");
  const [mistakes, setMistakes] = React.useState(0);
  const [completedStrokes, setCompletedStrokes] = React.useState(0);
  const [quizMessage, setQuizMessage] = React.useState("");
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const speed = getStrokeSpeed(speedId);

  React.useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    const container = writerContainerRef.current;
    if (!container) return;
    let active = true;
    let writer: HanziWriter | null = null;
    container.replaceChildren();
    setEngineState("loading");
    setEngineError("");
    setActivity("idle");
    setMistakes(0);
    setCompletedStrokes(0);
    setQuizMessage("");

    void import("hanzi-writer").then(async (module) => {
      if (!active) return;
      const styles = {
        foreground: readDesignToken("--foreground"),
        primary: readDesignToken("--primary"),
        border: readDesignToken("--border"),
      };
      writer = module.default.create(container, char, {
        width: size,
        height: size,
        padding: Math.max(16, Math.round(size * 0.07)),
        renderer: "svg",
        showCharacter: true,
        showOutline: true,
        strokeColor: styles.foreground,
        drawingColor: styles.foreground,
        outlineColor: styles.border,
        radicalColor: styles.primary,
        highlightColor: styles.primary,
        highlightCompleteColor: styles.primary,
        strokeAnimationSpeed: speed.animationSpeed,
        delayBetweenStrokes: speed.delayBetweenStrokes,
        strokeFadeDuration: reducedMotion ? 0 : 400,
        drawingFadeDuration: reducedMotion ? 0 : 300,
        charDataLoader: createLocalStrokeDataLoader(char, data),
        onLoadCharDataError: () => {
          if (active) {
            setEngineState("error");
            setEngineError("书写画布没有正确读取笔顺数据，请重新加载画布。");
          }
        },
      });
      writerRef.current = writer;
      const character = await writer.getCharacterData();
      if (!active || !character) return;
      // Hanzi Writer captures the current URL before client navigation can finish.
      // Keep masks local so later query changes cannot break stroke clipping.
      for (const path of container.querySelectorAll("path[clip-path]")) {
        const id = path.getAttribute("clip-path")?.match(/#([^"')]+)["']?\)$/)?.[1];
        if (id && container.querySelector(`clipPath[id="${CSS.escape(id)}"]`)) {
          path.setAttribute("clip-path", `url(#${id})`);
        }
      }
      setEngineState("ready");
    }).catch(() => {
      if (active) {
        setEngineState("error");
        setEngineError("书写画布暂时无法启动，请重新加载画布。");
      }
    });

    return () => {
      active = false;
      writer?.cancelQuiz();
      void writer?.pauseAnimation();
      if (writerRef.current === writer) writerRef.current = null;
      container.replaceChildren();
    };
  }, [char, data, engineRevision, reducedMotion, size, speed.animationSpeed, speed.delayBetweenStrokes]);

  function playAnimation() {
    const writer = writerRef.current;
    if (!writer || engineState !== "ready") return;
    writer.cancelQuiz();
    setActivity("playing");
    setQuizMessage("");
    void writer.animateCharacter({
      onComplete: ({ canceled }) => {
        if (!canceled) setActivity("idle");
      },
    });
  }

  function pauseAnimation() {
    const writer = writerRef.current;
    if (!writer) return;
    setActivity("paused");
    void writer.pauseAnimation();
  }

  function resumeAnimation() {
    const writer = writerRef.current;
    if (!writer) return;
    setActivity("playing");
    void writer.resumeAnimation();
  }

  function startQuiz() {
    const writer = writerRef.current;
    if (!writer || engineState !== "ready") return;
    writer.cancelQuiz();
    setActivity("quiz");
    setMistakes(0);
    setCompletedStrokes(0);
    setQuizMessage("请在字格中按正确顺序写出每一笔。");
    void writer.quiz({
      showHintAfterMisses: 3,
      highlightOnComplete: true,
      onMistake: ({ totalMistakes }) => {
        setMistakes(totalMistakes);
        setQuizMessage("这一笔还不对，再看清起笔位置和方向。");
      },
      onCorrectStroke: ({ strokeNum }) => {
        setCompletedStrokes(strokeNum + 1);
        setQuizMessage("这一笔正确，继续下一笔。");
      },
      onComplete: ({ totalMistakes }) => {
        setMistakes(totalMistakes);
        setCompletedStrokes(strokeCount);
        setActivity("quiz-complete");
        setQuizMessage(totalMistakes === 0 ? "全部写对了，笔顺准确。" : `练习完成，共修正 ${totalMistakes} 次。`);
      },
    });
  }

  function showHint() {
    const writer = writerRef.current;
    if (!writer || activity !== "quiz") return;
    setQuizMessage("已示范当前一笔，请沿着提示继续写。");
    void writer.highlightStroke(completedStrokes);
  }

  function leaveQuiz() {
    const writer = writerRef.current;
    if (!writer) return;
    writer.cancelQuiz();
    void writer.showCharacter({ duration: 0 });
    setActivity("idle");
    setQuizMessage("");
  }

  const activityLabel = activity === "playing"
    ? "动画正在播放"
    : activity === "paused"
      ? "动画已暂停"
      : activity === "quiz"
        ? `书写测验进行中，已完成 ${completedStrokes} / ${strokeCount} 笔，修正 ${mistakes} 次。 ${quizMessage}`
        : activity === "quiz-complete"
          ? quizMessage
          : "画布已准备好";

  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>笔顺动画与书写练习</CardTitle>
            <CardDescription className="mt-2">先看清每一笔，再在同一个字格中亲手练习。</CardDescription>
          </div>
          <Badge variant="outline">{strokeCount} 画</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-6 xl:grid-cols-[minmax(260px,360px)_minmax(0,1fr)] xl:items-start">
        <div className="mx-auto w-full max-w-[360px]">
          <div
            ref={stageRef}
            role="group"
            aria-label={`“${char}”字的笔顺动画和书写区域`}
            aria-describedby="stroke-canvas-help"
            className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-card text-border"
          >
            <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 size-full" aria-hidden="true">
              <path d="M50 0V100M0 50H100" fill="none" stroke="currentColor" strokeDasharray="2 2" />
              <path d="M0 0L100 100M100 0L0 100" fill="none" stroke="currentColor" strokeDasharray="1 3" opacity="0.5" />
            </svg>
            <div ref={writerContainerRef} className="absolute inset-0 touch-none [&>svg]:block [&>svg]:size-full" aria-hidden="true" />
            {engineState === "loading" && <div className="absolute inset-0 grid place-items-center bg-card/80"><Skeleton className="size-32 rounded-xl" /></div>}
          </div>
          <p id="stroke-canvas-help" className="mt-3 text-center text-xs leading-6 text-muted-foreground">
            书写测验支持鼠标、触控板和触摸屏；键盘用户可使用“提示下一笔”逐步查看。
          </p>
        </div>

        <div className="min-w-0 space-y-5">
          {engineState === "error" ? (
            <Alert variant="destructive">
              <CircleAlert aria-hidden="true" />
              <AlertTitle>书写画布加载失败</AlertTitle>
              <AlertDescription>
                <p>{engineError}</p>
                <Button className="mt-3" variant="outline" onClick={() => setEngineRevision((value) => value + 1)}>重新加载画布</Button>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <fieldset className="space-y-2" disabled={engineState !== "ready" || activity === "playing" || activity === "paused" || activity === "quiz"}>
                <legend className="text-sm font-medium">播放速度</legend>
                <div className="flex flex-wrap gap-2">
                  {STROKE_SPEEDS.map((preset) => (
                    <Button
                      key={preset.id}
                      type="button"
                      variant={speedId === preset.id ? "default" : "outline"}
                      aria-pressed={speedId === preset.id}
                      onClick={() => setSpeedId(preset.id)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </fieldset>

              <section className="space-y-3" aria-labelledby="animation-controls-title">
                <h3 id="animation-controls-title" className="text-sm font-medium">动画控制</h3>
                <div className="flex flex-wrap gap-2">
                  {activity === "playing" ? (
                    <Button variant="outline" onClick={pauseAnimation}><Pause aria-hidden="true" />暂停</Button>
                  ) : activity === "paused" ? (
                    <Button onClick={resumeAnimation}><Play aria-hidden="true" />继续播放</Button>
                  ) : (
                    <Button onClick={playAnimation} disabled={engineState !== "ready" || activity === "quiz"}><Play aria-hidden="true" />播放动画</Button>
                  )}
                  <Button variant="outline" onClick={playAnimation} disabled={engineState !== "ready" || activity === "quiz"}><RotateCcw aria-hidden="true" />重放</Button>
                </div>
              </section>

              <Separator />

              <section className="space-y-3" aria-labelledby="quiz-controls-title">
                <div>
                  <h3 id="quiz-controls-title" className="text-sm font-medium">书写测验</h3>
                  <p className="mt-1 text-sm leading-7 text-muted-foreground">写错三次会自动显示当前笔画；也可以主动查看提示。</p>
                </div>
                {activity === "quiz" ? (
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={showHint}><Lightbulb aria-hidden="true" />提示下一笔</Button>
                    <Button variant="outline" onClick={startQuiz}><RotateCcw aria-hidden="true" />重新开始</Button>
                    <Button variant="ghost" onClick={leaveQuiz}>退出练习</Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={startQuiz} disabled={engineState !== "ready" || activity === "playing" || activity === "paused"}><PencilLine aria-hidden="true" />{activity === "quiz-complete" ? "再练一次" : "开始书写测验"}</Button>
                    {activity === "quiz-complete" && <Button variant="outline" onClick={playAnimation}><Play aria-hidden="true" />再看动画</Button>}
                  </div>
                )}
              </section>

              <div className="rounded-lg bg-muted px-4 py-3 text-sm leading-7" role="status" aria-live="polite">
                <div className="flex items-start gap-2">
                  {activity === "quiz-complete" && <CheckCircle2 className="mt-1 size-4 shrink-0 text-success" aria-hidden="true" />}
                  <span>{activityLabel}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
