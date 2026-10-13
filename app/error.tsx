"use client";
import { UiText } from "@/components/i18n/UiText";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Alert variant="destructive" className="my-12">
      <AlertTriangle />
      <AlertTitle><UiText text="页面暂时没有准备好"  /></AlertTitle>
      <AlertDescription>
        <p><UiText text="你的本地设置不会因此删除。请重试，或刷新页面。"  /></p>
        <Button variant="outline" onClick={reset}><RefreshCw data-icon="inline-start" /><UiText text="重新加载"  /></Button>
      </AlertDescription>
    </Alert>
  );
}
