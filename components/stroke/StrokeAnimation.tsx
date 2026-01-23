"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

interface StrokeAnimationProps {
  char: string;
  size?: number;
}

export function StrokeAnimation({ char, size = 200 }: StrokeAnimationProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const writerRef = React.useRef<unknown>(null);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [isQuizMode, setIsQuizMode] = React.useState(false);
  const [quizResult, setQuizResult] = React.useState<string | null>(null);

  // Initialize HanziWriter
  React.useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous instance
    containerRef.current.innerHTML = "";
    writerRef.current = null;
    setIsAnimating(false);
    setIsQuizMode(false);
    setQuizResult(null);

    // Dynamic import hanzi-writer
    import("hanzi-writer").then((mod) => {
      const HanziWriter = mod.default || mod;

      if (!containerRef.current) return;

      const writer = HanziWriter.create(containerRef.current, char, {
        width: size,
        height: size,
        padding: 10,
        strokeColor: "#333",
        outlineColor: "#ddd",
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 300,
        showCharacter: true,
        showOutline: true,
        radicalColor: "#ef4444",
      });

      writerRef.current = writer;
    });

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [char, size]);

  // Play animation
  const handleAnimate = () => {
    const writer = writerRef.current as {
      animateCharacter: (opts?: { onComplete?: () => void }) => void;
      hideCharacter: () => void;
    } | null;

    if (!writer) return;

    setIsAnimating(true);
    setQuizResult(null);
    writer.hideCharacter();

    writer.animateCharacter({
      onComplete: () => {
        setIsAnimating(false);
      },
    });
  };

  // Start quiz mode
  const handleQuiz = () => {
    const writer = writerRef.current as {
      quiz: (opts: {
        onComplete?: (data: { totalMistakes: number }) => void;
        showHintAfterMisses?: number;
      }) => void;
      hideCharacter: () => void;
    } | null;

    if (!writer) return;

    setIsQuizMode(true);
    setQuizResult(null);
    writer.hideCharacter();

    writer.quiz({
      showHintAfterMisses: 3,
      onComplete: (data) => {
        setIsQuizMode(false);
        if (data.totalMistakes === 0) {
          setQuizResult("完美！一次通过");
        } else {
          setQuizResult(`完成！错误 ${data.totalMistakes} 次`);
        }
      },
    });
  };

  // Cancel quiz
  const handleCancelQuiz = () => {
    const writer = writerRef.current as {
      cancelQuiz: () => void;
      showCharacter: () => void;
    } | null;

    if (!writer) return;

    writer.cancelQuiz();
    writer.showCharacter();
    setIsQuizMode(false);
  };

  return (
    <div className="space-y-4">
      {/* Animation container */}
      <div className="flex justify-center">
        <div
          ref={containerRef}
          className="border-2 border-gray-200 rounded-lg bg-white"
          style={{ width: size, height: size }}
        />
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2">
        <Button
          onClick={handleAnimate}
          disabled={isAnimating || isQuizMode}
          variant="outline"
        >
          {isAnimating ? "播放中..." : "播放动画"}
        </Button>

        {isQuizMode ? (
          <Button onClick={handleCancelQuiz} variant="outline">
            取消练习
          </Button>
        ) : (
          <Button onClick={handleQuiz} disabled={isAnimating}>
            笔顺练习
          </Button>
        )}
      </div>

      {/* Quiz result */}
      {quizResult && (
        <div className="text-center text-sm text-gray-600">{quizResult}</div>
      )}

      {/* Quiz hint */}
      {isQuizMode && (
        <div className="text-center text-sm text-gray-500">
          请按正确笔顺书写汉字，错误3次后会显示提示
        </div>
      )}
    </div>
  );
}
