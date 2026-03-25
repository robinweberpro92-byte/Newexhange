import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentSession } from "@/lib/auth";
import { isAdminRole } from "@/lib/rbac";

export default async function AdminLoginPage() {
  const session = await getCurrentSession();
  if (session?.user?.id && isAdminRole(session.user.role)) {
    redirect("/admin/overview");
  }

  return (
    <section className="container-app py-16 md:py-24">
      <div className="mx-auto max-w-xl">
        <Card className="space-y-6 p-8 md:p-10">
          <div className="space-y-3 text-center">
            <p className="text-sm uppercase tracking-[0.18em] text-muted">Secure admin portal</p>
            <h1 className="font-display text-3xl font-black text-text md:text-4xl">Connexion back-office</h1>
            <p className="text-muted">Portail reserve aux operations, au support et a la moderation. Activez la 2FA avant toute mise en production.</p>
          </div>
          <LoginForm mode="admin" next="/admin/overview" />
          <p className="text-center text-sm text-muted">
            Portail utilisateur standard ? <Link href="/login" className="text-text hover:underline">Retour a la connexion client</Link>
          </p>
        </Card>
      </div>
    </section>
  );
}
