import Link from "next/link";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentSession } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { isAdminRole } from "@/lib/rbac";
import { redirect } from "next/navigation";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [session, dictionary, query] = await Promise.all([getCurrentSession(), getDictionary(), searchParams]);
  if (session?.user?.id) {
    redirect(isAdminRole(session.user.role) ? "/admin/overview" : "/dashboard/overview");
  }

  const next = typeof query.next === "string" ? query.next : undefined;

  return (
    <section className="container-app py-16 md:py-24">
      <div className="mx-auto max-w-xl">
        <Card className="space-y-6 p-8 md:p-10">
          <div className="space-y-3 text-center">
            <p className="text-sm uppercase tracking-[0.18em] text-muted">YasarPack</p>
            <h1 className="font-display text-3xl font-black text-text md:text-4xl">{dictionary.auth.loginTitle}</h1>
            <p className="text-muted">Accedez a votre espace securise pour suivre vos exchanges, votre KYC et vos tickets support.</p>
          </div>

          {query.registered === "1" ? (
            <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">Compte cree avec succes. Connectez-vous pour completer votre profil.</p>
          ) : null}

          {query.reset === "1" ? (
            <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">Mot de passe mis a jour avec succes.</p>
          ) : null}

          <LoginForm next={next} />

          <div className="flex flex-wrap justify-between gap-3 text-sm text-muted">
            <Link href="/forgot-password" className="hover:text-text">Mot de passe oublie ?</Link>
            <Link href="/register" className="hover:text-text">Creer un compte</Link>
          </div>
        </Card>
      </div>
    </section>
  );
}
