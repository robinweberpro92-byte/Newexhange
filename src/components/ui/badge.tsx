import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "green" | "blue" | "amber" | "red" | "slate";
};

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  blue: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  red: "border-red-500/30 bg-red-500/10 text-red-200",
  slate: "border-white/10 bg-white/5 text-slate-200"
};

export function Badge({ className, tone = "slate", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
