"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { registerSchema } from "@/lib/validators/auth";

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      language: "fr",
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
    <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-sm text-muted">First name</label>
        <Input {...form.register("firstName")} />
        {form.formState.errors.firstName ? <p className="text-sm text-red-300">{form.formState.errors.firstName.message}</p> : null}
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted">Last name</label>
        <Input {...form.register("lastName")} />
        {form.formState.errors.lastName ? <p className="text-sm text-red-300">{form.formState.errors.lastName.message}</p> : null}
      </div>
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm text-muted">Email</label>
        <Input type="email" {...form.register("email")} />
        {form.formState.errors.email ? <p className="text-sm text-red-300">{form.formState.errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted">Phone</label>
        <Input {...form.register("phone")} />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted">Country</label>
        <Input {...form.register("country")} />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted">Language</label>
        <Select {...form.register("language")}>
          <option value="fr">French</option>
          <option value="en">English</option>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted">Password</label>
        <Input type="password" {...form.register("password")} />
        {form.formState.errors.password ? <p className="text-sm text-red-300">{form.formState.errors.password.message}</p> : null}
      </div>
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm text-muted">Confirm password</label>
        <Input type="password" {...form.register("confirmPassword")} />
        {form.formState.errors.confirmPassword ? <p className="text-sm text-red-300">{form.formState.errors.confirmPassword.message}</p> : null}
      </div>
      {error ? <p className="md:col-span-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creation..." : "Create account"}
        </Button>
      </div>
    </form>
  );
}
