"use client";

import { ToggleGroupItem } from "@/components/ui/toggle-group";

export function PinyinCard({ letter }: { letter: string }) {
  return <ToggleGroupItem value={letter} aria-label={letter}
    className="min-h-20 w-full rounded-lg text-3xl font-normal data-[state=on]:border-primary data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
    {letter}
  </ToggleGroupItem>;
}
