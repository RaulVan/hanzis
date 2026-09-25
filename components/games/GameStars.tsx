import { Star } from "lucide-react";
import { MAX_STARS } from "@/lib/gameStars";
import { cn } from "@/lib/utils";

export function GameStars({ stars, className }: { stars: number; className?: string }) {
  return (
    <span role="img" aria-label={`获得 ${stars} 颗星，共 ${MAX_STARS} 颗`} className={cn("inline-flex items-center gap-0.5", className)}>
      {Array.from({ length: MAX_STARS }, (_, index) => (
        <Star key={index} aria-hidden="true" className={cn("size-4", index < stars ? "fill-primary text-primary" : "text-muted-foreground/50")} />
      ))}
    </span>
  );
}
