"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleAlert, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getCharacterInfo, loadCnchar } from "@/lib/cncharHelper";
import { loadHanziData, type HanziData } from "@/lib/hanziData";
import {
  DEFAULT_STROKE_CHARACTER,
  extractFirstStrokeCharacter,
  getStrokeLoadErrorMessage,
} from "@/lib/strokeLearning";
import type { CharacterInfo } from "@/types";
import { StrokeAnimation } from "./StrokeAnimation";
import { StrokeFanning } from "./StrokeFanning";
import { StrokeInfo } from "./StrokeInfo";

const commonCharacterGroups = [
  { label: "基础", characters: "一二三四五六七八九十" },
  { label: "自然", characters: "天地日月水火山川风雨" },
  { label: "日常", characters: "人大小学习读写看听说" },
] as const;

type DataState =
  | { status: "loading" }
  | { status: "ready"; data: HanziData }
  | { status: "error"; message: string };

function StrokeLoadingState() {
  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]" role="status" aria-label="正在加载汉字笔顺">
      <div className="space-y-6">
        <Skeleton className="h-[610px] w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
      <Skeleton className="h-[420px] w-full" />
    </div>
  );
}

export function StrokeViewer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryValue = searchParams.get("char");
  const queryCharacter = extractFirstStrokeCharacter(queryValue);
  const [currentChar, setCurrentChar] = React.useState(queryCharacter ?? DEFAULT_STROKE_CHARACTER);
  const [input, setInput] = React.useState(queryCharacter ?? DEFAULT_STROKE_CHARACTER);
  const [inputError, setInputError] = React.useState("");
  const [dataState, setDataState] = React.useState<DataState>({ status: "loading" });
  const [characterInfo, setCharacterInfo] = React.useState<CharacterInfo | null>(null);
  const [infoStatus, setInfoStatus] = React.useState<"loading" | "ready" | "unavailable">("loading");
  const [retryRevision, setRetryRevision] = React.useState(0);

  React.useEffect(() => {
    const next = extractFirstStrokeCharacter(queryValue) ?? DEFAULT_STROKE_CHARACTER;
    setCurrentChar(next);
    setInput(next);
    setInputError("");
  }, [queryValue]);

  React.useEffect(() => {
    let active = true;
    setDataState({ status: "loading" });
    setCharacterInfo(null);
    setInfoStatus("loading");

    void loadHanziData(currentChar).then(
      (data) => {
        if (active) setDataState({ status: "ready", data });
      },
      (problem) => {
        if (active) setDataState({ status: "error", message: getStrokeLoadErrorMessage(problem) });
      },
    );

    void loadCnchar().then((cnchar) => {
      if (!active) return;
      if (cnchar) {
        setCharacterInfo(getCharacterInfo(currentChar));
        setInfoStatus("ready");
      } else {
        setInfoStatus("unavailable");
      }
    });

    return () => {
      active = false;
    };
  }, [currentChar, retryRevision]);

  function selectCharacter(char: string) {
    setCurrentChar(char);
    setInput(char);
    setInputError("");
    router.replace(`/stroke/?char=${encodeURIComponent(char)}`, { scroll: false });
  }

  function submitCharacter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const char = extractFirstStrokeCharacter(input);
    if (!char) {
      setInputError("请输入至少一个汉字；查询会使用输入中的第一个汉字。");
      return;
    }
    selectCharacter(char);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>选一个字开始</CardTitle>
          <CardDescription>输入多个字时，只查询其中第一个汉字。当前字会保存在网址中，方便再次打开。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={submitCharacter} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field data-invalid={Boolean(inputError)} className="min-w-0 flex-1">
              <FieldLabel htmlFor="stroke-character">要学习的汉字</FieldLabel>
              <Input
                id="stroke-character"
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                  if (inputError) setInputError("");
                }}
                aria-invalid={Boolean(inputError)}
                aria-describedby={inputError ? "stroke-character-error" : "stroke-character-help"}
                autoComplete="off"
                inputMode="text"
                maxLength={32}
                placeholder="例如：永"
                className="font-serif text-xl"
              />
              {inputError ? <FieldError id="stroke-character-error">{inputError}</FieldError> : <FieldDescription id="stroke-character-help">支持常用汉字与扩展区汉字；未收录时会明确提示。</FieldDescription>}
            </Field>
            <Button type="submit" className="w-full sm:mb-[28px] sm:w-auto"><Search aria-hidden="true" />查询笔顺</Button>
          </form>

          <div className="space-y-3">
            <p className="text-sm font-medium">常用字</p>
            {commonCharacterGroups.map((group) => (
              <div key={group.label} className="grid min-w-0 gap-2 sm:grid-cols-[56px_minmax(0,1fr)] sm:items-start">
                <span className="pt-2 text-sm text-muted-foreground">{group.label}</span>
                <div className="flex min-w-0 flex-wrap gap-2">
                  {Array.from(group.characters).map((char) => (
                    <Button
                      key={char}
                      type="button"
                      size="icon"
                      variant={currentChar === char ? "default" : "outline"}
                      aria-pressed={currentChar === char}
                      aria-label={`学习“${char}”字`}
                      onClick={() => selectCharacter(char)}
                      className="font-serif text-lg"
                    >
                      {char}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {dataState.status === "loading" ? <StrokeLoadingState /> : dataState.status === "error" ? (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>无法打开“{currentChar}”的笔顺</AlertTitle>
          <AlertDescription>
            <p>{dataState.message}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setRetryRevision((value) => value + 1)}>重新加载</Button>
              <Button variant="outline" onClick={() => selectCharacter(DEFAULT_STROKE_CHARACTER)}>改学“{DEFAULT_STROKE_CHARACTER}”字</Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <div className="min-w-0 space-y-6">
            <StrokeAnimation char={currentChar} data={dataState.data} strokeCount={dataState.data.strokes.length} />
            <StrokeFanning char={currentChar} data={dataState.data} strokeNames={characterInfo?.strokeNames ?? []} />
          </div>
          <StrokeInfo char={currentChar} info={characterInfo} infoStatus={infoStatus} strokeCount={dataState.data.strokes.length} />
        </div>
      )}
    </div>
  );
}
