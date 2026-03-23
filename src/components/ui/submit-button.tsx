"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type SubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function SubmitButton({ label, pendingLabel = "Saving...", variant = "primary", size = "md", className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} size={size} disabled={pending} className={className}>
      {pending ? pendingLabel : label}
    </Button>
  );
}
