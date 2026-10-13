"use client";
import { useTranslate } from "@/components/i18n/LanguageProvider";
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  const t = useTranslate();
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-accent", className)}
      {...props}
      aria-label={t(props["aria-label"])}
    />
  )
}

export { Skeleton }
