"use client";
import { useTranslate } from "@/components/i18n/LanguageProvider";

import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  const t = useTranslate();
  return (
    <Loader2Icon
      role="status"
      aria-label={t("正在加载")}
      className={cn("size-4 animate-spin", className)}
      {...props}
   />
  )
}

export { Spinner }
