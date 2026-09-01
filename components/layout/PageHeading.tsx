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
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
