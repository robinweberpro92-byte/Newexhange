import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-2xl border border-line bg-white/5 px-4 text-sm text-text outline-none transition focus:border-[var(--brand-primary)] focus:bg-white/8",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
