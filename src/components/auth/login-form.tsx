"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/validators/auth";

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginFormProps = {
  next?: string;
};

export function LoginForm({ next }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: LoginFormValues) {
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false
    });

    if (result?.error) {
      setError("Identifiants invalides ou compte inactif.");
      setLoading(false);
      return;
    }

    const sessionResponse = await fetch("/api/auth/session");
    const session = await sessionResponse.json();
    const target = next || (session?.user?.role === "ADMIN" ? "/admin/overview" : "/dashboard/overview");
    router.push(target);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-sm text-muted">Email</label>
        <Input type="email" placeholder="user@yasarpack.com" {...form.register("email")} />
        {form.formState.errors.email ? <p className="text-sm text-red-300">{form.formState.errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted">Password</label>
        <Input type="password" placeholder="********" {...form.register("password")} />
        {form.formState.errors.password ? <p className="text-sm text-red-300">{form.formState.errors.password.message}</p> : null}
      </div>
      {error ? <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Connexion..." : "Connexion"}
      </Button>
    </form>
  );
}
