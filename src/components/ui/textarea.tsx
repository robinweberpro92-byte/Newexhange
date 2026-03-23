import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[120px] w-full rounded-2xl border border-line bg-white/5 px-4 py-3 text-sm text-text outline-none transition placeholder:text-muted focus:border-[var(--brand-primary)] focus:bg-white/8",
        className
      )}
      {...props}
    />
  );
});
