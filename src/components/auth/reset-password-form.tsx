"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPasswordSchema } from "@/lib/validators/auth";

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  async function onSubmit(values: ResetPasswordValues) {
    setLoading(true);
    setMessage(null);

    const response = await fetch(`/api/auth/password-reset/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to reset password.");
      setLoading(false);
      return;
    }

    router.push("/login?reset=1");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-sm text-muted">New password</label>
        <Input type="password" {...form.register("password")} />
        {form.formState.errors.password ? <p className="text-sm text-red-300">{form.formState.errors.password.message}</p> : null}
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted">Confirm new password</label>
        <Input type="password" {...form.register("confirmPassword")} />
        {form.formState.errors.confirmPassword ? <p className="text-sm text-red-300">{form.formState.errors.confirmPassword.message}</p> : null}
      </div>
      {message ? <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{message}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
