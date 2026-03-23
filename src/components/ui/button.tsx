import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-[linear-gradient(135deg,var(--brand-primary),var(--brand-secondary))] text-slate-950 shadow-premium hover:-translate-y-0.5",
  secondary: "border border-line bg-white/5 text-text hover:bg-white/10",
  ghost: "text-muted hover:bg-white/5",
  danger: "border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20"
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4",
  lg: "h-12 px-5 text-base"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
