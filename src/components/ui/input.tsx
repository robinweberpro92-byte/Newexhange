import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-2xl border border-line bg-white/5 px-4 text-sm text-text outline-none transition placeholder:text-muted focus:border-[var(--brand-primary)] focus:bg-white/8",
        className
      )}
      {...props}
    />
  );
});
