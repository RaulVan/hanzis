"use client";
import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
function Switch({ className, size = "default", ...props }: React.ComponentProps<typeof SwitchPrimitive.Root> & { size?: "sm" | "default" }) {
  return (
    <SwitchPrimitive.Root data-slot="switch" data-size={size} className={cn("peer group relative inline-flex h-11 w-12 shrink-0 items-center rounded-md p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}>
      <span aria-hidden="true" className="absolute left-0.5 right-0.5 h-6 rounded-full bg-input transition-colors group-data-[state=checked]:bg-primary" />
      <SwitchPrimitive.Thumb data-slot="switch-thumb" className="pointer-events-none relative block size-5 rounded-full bg-card shadow-sm transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
    </SwitchPrimitive.Root>
  );
}
export { Switch };
