"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

type LogoutButtonProps = {
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function LogoutButton({ className, variant = "ghost" }: LogoutButtonProps) {
  return (
    <Button
      variant={variant}
      size="sm"
      className={className}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Logout
    </Button>
  );
}
