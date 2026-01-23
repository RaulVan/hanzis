"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CharacterInfo } from "@/types";

interface StrokeInfoProps {
  char: string;
  info: CharacterInfo;
  isLoading?: boolean;
}

// Stroke name mapping
const strokeNameMap: Record<string, string> = {
  h: "横",
  s: "竖",
  p: "撇",
  n: "捺",
  d: "点",
  t: "提",
  z: "折",
  hg: "横钩",
  sg: "竖钩",
  wg: "弯钩",
  xg: "斜钩",
  hzg: "横折钩",
  hpg: "横撇弯钩",
  hz: "横折",
  hzz: "横折折",
  hzzg: "横折折钩",
  hzzzg: "横折折折钩",
  hzzp: "横折折撇",
  hzp: "横折撇",
  hzwg: "横折弯钩",
  hzw: "横折弯",
  hzzz: "横折折折",
  sp: "竖撇",
  sz: "竖折",
  szz: "竖折折",
  szzg: "竖折折钩",
  sw: "竖弯",
  swg: "竖弯钩",
  pg: "撇钩",
  pz: "撇折",
  pd: "撇点",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 w-16 shrink-0">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}

export function StrokeInfo({ char, info, isLoading }: StrokeInfoProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-400">
          加载中...
        </CardContent>
      </Card>
    );
  }

  // Format stroke names
  const strokeNames = info.strokeNames
    .map((name) => strokeNameMap[name] || name)
    .join("、");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">汉字信息</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        <InfoRow
          label="汉字"
          value={<span className="text-2xl font-serif">{char}</span>}
        />
        <InfoRow
          label="拼音"
          value={
            <span className="text-lg">
              {info.pinyinWithTone || info.pinyin}
            </span>
          }
        />
        <InfoRow label="笔画数" value={`${info.strokeCount} 画`} />
        <InfoRow
          label="部首"
          value={
            <span>
              <span className="text-lg font-serif">{info.radical}</span>
              {info.radicalStrokeCount > 0 && (
                <span className="text-gray-500 ml-2">
                  ({info.radicalStrokeCount}画)
                </span>
              )}
            </span>
          }
        />
        <InfoRow label="结构" value={info.struct || "独体字"} />
        <InfoRow
          label="笔顺"
          value={
            <span className="text-xs leading-relaxed break-all">
              {strokeNames || "暂无数据"}
            </span>
          }
        />
      </CardContent>
    </Card>
  );
}
