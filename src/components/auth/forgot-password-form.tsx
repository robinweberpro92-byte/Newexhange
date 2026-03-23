"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { passwordResetRequestSchema } from "@/lib/validators/auth";

type ForgotPasswordValues = z.infer<typeof passwordResetRequestSchema>;

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: { email: "" }
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/auth/password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const payload = await response.json();

    setMessage(payload.message ?? "If the account exists, a reset flow has been created.");
    if (payload.resetUrl) {
      setMessage(`${payload.message} ${payload.resetUrl}`);
    }
    setLoading(false);
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-sm text-muted">Email</label>
        <Input type="email" {...form.register("email")} />
        {form.formState.errors.email ? <p className="text-sm text-red-300">{form.formState.errors.email.message}</p> : null}
      </div>
      {message ? <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}
