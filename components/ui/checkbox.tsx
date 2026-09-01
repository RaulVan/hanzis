"use client";
import * as React from "react";
import { Check } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return <CheckboxPrimitive.Root data-slot="checkbox" className={cn("peer relative flex size-5 shrink-0 items-center justify-center rounded border border-input bg-card before:absolute before:-inset-3 before:content-[''] focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className)} {...props}><CheckboxPrimitive.Indicator><Check className="size-4" /></CheckboxPrimitive.Indicator></CheckboxPrimitive.Root>;
}
export { Checkbox };
