import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { Card } from "@/components/ui/card";
import { getCurrentSession } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { isAdminRole } from "@/lib/rbac";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const [session, dictionary] = await Promise.all([getCurrentSession(), getDictionary()]);

  if (session?.user?.id) {
    redirect(isAdminRole(session.user.role) ? "/admin/overview" : "/dashboard/overview");
  }

  return (
    <section className="container-app py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <Card className="space-y-6 p-8 md:p-10">
          <div className="space-y-3 text-center">
            <p className="text-sm uppercase tracking-[0.18em] text-muted">YasarPack</p>
            <h1 className="font-display text-3xl font-black text-text md:text-4xl">{dictionary.auth.registerTitle}</h1>
            <p className="text-muted">Ouvrez votre compte en moins d'une minute. Vous completerez votre profil et votre verification plus tard, au bon moment.</p>
          </div>
          <RegisterForm />
          <p className="text-center text-sm text-muted">
            Vous avez deja un compte ? <Link href="/login" className="text-text hover:underline">Se connecter</Link>
          </p>
        </Card>
      </div>
    </section>
  );
}
