"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema } from "@/lib/validators/auth";

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  async function onSubmit(values: RegisterFormValues) {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Impossible de creer le compte.");
      setLoading(false);
      return;
    }

    router.push("/login?registered=1");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-sm text-muted">Email</label>
        <Input type="email" placeholder="vous@entreprise.com" {...form.register("email")} />
        {form.formState.errors.email ? <p className="text-sm text-red-300">{form.formState.errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted">Mot de passe</label>
        <div className="relative">
          <Input type={showPassword ? "text" : "password"} placeholder="8 caracteres minimum" className="pr-12" {...form.register("password")} />
          <button type="button" className="absolute inset-y-0 right-3 inline-flex items-center text-muted transition hover:text-text" onClick={() => setShowPassword((value) => !value)}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {form.formState.errors.password ? <p className="text-sm text-red-300">{form.formState.errors.password.message}</p> : null}
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted">Confirmer le mot de passe</label>
        <div className="relative">
          <Input type={showConfirm ? "text" : "password"} placeholder="Retapez votre mot de passe" className="pr-12" {...form.register("confirmPassword")} />
          <button type="button" className="absolute inset-y-0 right-3 inline-flex items-center text-muted transition hover:text-text" onClick={() => setShowConfirm((value) => !value)}>
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {form.formState.errors.confirmPassword ? <p className="text-sm text-red-300">{form.formState.errors.confirmPassword.message}</p> : null}
      </div>
      <label className="flex items-start gap-3 rounded-2xl border border-line bg-white/5 px-4 py-3 text-sm text-muted">
        <input type="checkbox" required className="mt-1 h-4 w-4 accent-[var(--brand-primary)]" />
        <span>
          J'accepte les <Link href="/legal/terms" className="text-text underline underline-offset-4">conditions d'utilisation</Link> et la <Link href="/legal/privacy" className="text-text underline underline-offset-4">politique de confidentialite</Link>.
        </span>
      </label>
      <div className="rounded-[1.6rem] border border-line bg-white/5 p-4 text-sm text-muted">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-[var(--brand-primary)]" />
          <p>Inscription en moins d'une minute. Les informations de profil, de pays et de KYC seront demandees seulement au bon moment.</p>
        </div>
      </div>
      {error ? <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creation du compte..." : "Creer mon compte"}
      </Button>
    </form>
  );
}
