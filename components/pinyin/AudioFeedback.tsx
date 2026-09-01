"use client";

import { CircleAlert, RefreshCw, Square } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function AudioFeedback({ activeKey, source, error, retry, stop }: {
  activeKey: string | null;
  source: string;
  error: string | null;
  retry: () => void;
  stop: () => void;
}) {
  if (error) return <Alert variant="destructive">
    <CircleAlert aria-hidden="true" /><AlertTitle>声音暂时无法播放</AlertTitle>
    <AlertDescription><p>{error}</p><Button size="sm" variant="outline" onClick={retry}><RefreshCw aria-hidden="true" />重试播放</Button></AlertDescription>
  </Alert>;
  return <div className="flex min-h-11 items-center justify-center gap-3 text-sm text-muted-foreground">
    <span className="flex items-center gap-2" role="status">{activeKey ? <><Spinner />正在播放 · {source}</> : "点击字母或播放按钮听发音"}</span>
    {activeKey ? <Button variant="ghost" size="sm" onClick={stop}><Square aria-hidden="true" />停止</Button> : null}
  </div>;
}
