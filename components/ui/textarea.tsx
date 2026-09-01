import * as React from "react";
import { cn } from "@/lib/utils";
const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(({ className, ...props }, ref) => (
  <textarea ref={ref} data-slot="textarea" className={cn("flex min-h-24 w-full min-w-0 rounded-md border border-input bg-card px-3 py-3 text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive", className)} {...props} />
));
Textarea.displayName = "Textarea";
export { Textarea };
