"use client";
import { UiText } from "@/components/i18n/UiText";
import { useTranslate } from "@/components/i18n/LanguageProvider";

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
  const t = useTranslate();
  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]" role="status" aria-label={t("正在加载汉字笔顺")}>
      <div className="space-y-6">
        <Skeleton className="h-[610px] w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
      <Skeleton className="h-[420px] w-full" />
    </div>
  );
}

export function StrokeViewer() {
  const t = useTranslate();
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
          <CardTitle><UiText text="选一个字开始" /></CardTitle>
          <CardDescription><UiText text="输入多个字时，只查询其中第一个汉字。当前字会保存在网址中，方便再次打开。" /></CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={submitCharacter} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field data-invalid={Boolean(inputError)} className="min-w-0 flex-1">
              <FieldLabel htmlFor="stroke-character"><UiText text="要学习的汉字" /></FieldLabel>
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
                placeholder={t("例如：永")}
                className="font-serif text-xl"
             />
              {inputError ? <FieldError id="stroke-character-error"><UiText>{inputError}</UiText></FieldError> : <FieldDescription id="stroke-character-help"><UiText text="支持常用汉字与扩展区汉字；未收录时会明确提示。" /></FieldDescription>}
            </Field>
            <Button type="submit" className="w-full sm:mb-[28px] sm:w-auto"><Search aria-hidden="true" /><UiText text="查询笔顺" /></Button>
          </form>

          <div className="space-y-3">
            <p className="text-sm font-medium"><UiText text="常用字" /></p>
            {commonCharacterGroups.map((group) => (
              <div key={group.label} className="grid min-w-0 gap-2 sm:grid-cols-[56px_minmax(0,1fr)] sm:items-start">
                <span className="pt-2 text-sm text-muted-foreground"><UiText>{group.label}</UiText></span>
                <div className="flex min-w-0 flex-wrap gap-2">
                  {Array.from(group.characters).map((char) => (
                    <Button
                      key={char}
                      type="button"
                      size="icon"
                      variant={currentChar === char ? "default" : "outline"}
                      aria-pressed={currentChar === char}
                      aria-label={t("学习“{0}”字", [char])}
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
          <AlertTitle><UiText text="无法打开“{0}”的笔顺" values={[currentChar]} /></AlertTitle>
          <AlertDescription>
            <p><UiText>{dataState.message}</UiText></p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setRetryRevision((value) => value + 1)}><UiText text="重新加载" /></Button>
              <Button variant="outline" onClick={() => selectCharacter(DEFAULT_STROKE_CHARACTER)}><UiText text="改学“{0}”字" values={[DEFAULT_STROKE_CHARACTER]} /></Button>
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
