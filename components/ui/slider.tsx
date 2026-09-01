"use client";
import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
function Slider({ className, value, defaultValue, min = 0, max = 100, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const values = value ?? defaultValue ?? [min];
  return (
    <SliderPrimitive.Root data-slot="slider" value={value} defaultValue={defaultValue} min={min} max={max} className={cn("relative flex h-11 w-full touch-none items-center select-none data-[disabled]:opacity-50", className)} {...props}>
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-input"><SliderPrimitive.Range className="absolute h-full bg-primary" /></SliderPrimitive.Track>
      {values.map((_, index) => <SliderPrimitive.Thumb key={index} aria-label={props["aria-label"]} aria-labelledby={props["aria-labelledby"]} aria-describedby={props["aria-describedby"]} className="relative block size-5 rounded-full border-2 border-primary bg-card outline-none before:absolute before:-inset-3 before:content-[''] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />)}
    </SliderPrimitive.Root>
  );
}
export { Slider };
