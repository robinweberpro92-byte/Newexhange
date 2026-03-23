import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { Card } from "@/components/ui/card";
import { getCurrentSession } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const [session, dictionary] = await Promise.all([getCurrentSession(), getDictionary()]);

  if (session?.user?.id) {
    redirect(session.user.role === "ADMIN" ? "/admin/overview" : "/dashboard/overview");
  }

  return (
    <section className="container-app py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <Card className="space-y-6 p-8 md:p-10">
          <div className="space-y-3 text-center">
            <p className="text-sm uppercase tracking-[0.18em] text-muted">YasarPack</p>
            <h1 className="font-display text-3xl font-black text-text md:text-4xl">{dictionary.auth.registerTitle}</h1>
            <p className="text-muted">Create a secure account and enter the real product experience.</p>
          </div>
          <RegisterForm />
          <p className="text-center text-sm text-muted">
            Already registered? <Link href="/login" className="text-text hover:underline">Sign in</Link>
          </p>
        </Card>
      </div>
    </section>
  );
}
