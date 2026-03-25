"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isAdminRole } from "@/lib/rbac";
import { loginSchema } from "@/lib/validators/auth";

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginFormProps = {
  next?: string;
  mode?: "user" | "admin";
};

export function LoginForm({ next, mode = "user" }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true
    }
  });

  async function onSubmit(values: LoginFormValues) {
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      portal: mode
    });

    if (result?.error) {
      setError("Identifiants invalides, compte inactif ou acces non autorise.");
      setLoading(false);
      return;
    }

    const sessionResponse = await fetch("/api/auth/session");
    const session = await sessionResponse.json();

    if (mode === "admin" && !isAdminRole(session?.user?.role)) {
      setError("Ce portail est reserve a l'administration.");
      setLoading(false);
      return;
    }

    const target = next || (isAdminRole(session?.user?.role) ? "/admin/overview" : "/dashboard/overview");
    router.push(target);
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-sm text-muted">Email</label>
        <Input type="email" placeholder="name@email.com" {...form.register("email")} />
        {form.formState.errors.email ? <p className="text-sm text-red-300">{form.formState.errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm text-muted">Mot de passe</label>
          {mode === "user" ? (
            <Link href="/forgot-password" className="text-xs text-muted transition hover:text-text">
              Mot de passe oublie ?
            </Link>
          ) : null}
        </div>
        <div className="relative">
          <Input type={showPassword ? "text" : "password"} placeholder="Votre mot de passe" className="pr-12" {...form.register("password")} />
          <button
            type="button"
            className="absolute inset-y-0 right-3 inline-flex items-center text-muted transition hover:text-text"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {form.formState.errors.password ? <p className="text-sm text-red-300">{form.formState.errors.password.message}</p> : null}
      </div>
      <label className="flex items-center gap-3 rounded-2xl border border-line bg-white/5 px-4 py-3 text-sm text-muted">
        <input type="checkbox" className="h-4 w-4 accent-[var(--brand-primary)]" {...form.register("rememberMe")} />
        Rester connecte pendant 30 jours sur cet appareil
      </label>
      {error ? (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Connexion en cours..." : mode === "admin" ? "Acceder au back-office" : "Se connecter"}
      </Button>
      <div className="grid gap-3 rounded-[1.6rem] border border-line bg-white/5 p-4 text-sm text-muted md:grid-cols-2">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-[var(--brand-primary)]" />
          <p>Chiffrement SSL, sessions securisees et verification progressive des comptes.</p>
        </div>
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 h-4 w-4 text-[var(--brand-secondary)]" />
          <p>5 tentatives maximum par minute. Le support intervient 24/7 sur les acces sensibles.</p>
        </div>
      </div>
    </form>
  );
}
