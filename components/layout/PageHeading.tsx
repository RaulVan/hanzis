"use client";
import { UiText } from "@/components/i18n/UiText";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeading({ title, description, children, className }: {
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("page-heading", className)}>
      <div>
        <h1><UiText>{title}</UiText></h1>
        <p><UiText>{description}</UiText></p>
      </div>
      {children}
    </div>
  );
}
