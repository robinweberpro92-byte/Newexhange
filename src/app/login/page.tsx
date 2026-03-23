import Link from "next/link";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentSession } from "@/lib/auth";
import { getDictionary, getLocale } from "@/lib/i18n";
import { redirect } from "next/navigation";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [session, locale, dictionary, query] = await Promise.all([getCurrentSession(), getLocale(), getDictionary(), searchParams]);
  if (session?.user?.id) {
    redirect(session.user.role === "ADMIN" ? "/admin/overview" : "/dashboard/overview");
  }

  const next = typeof query.next === "string" ? query.next : undefined;

  return (
    <section className="container-app py-16 md:py-24">
      <div className="mx-auto max-w-xl">
        <Card className="space-y-6 p-8 md:p-10">
          <div className="space-y-3 text-center">
            <p className="text-sm uppercase tracking-[0.18em] text-muted">YasarPack</p>
            <h1 className="font-display text-3xl font-black text-text md:text-4xl">{dictionary.auth.loginTitle}</h1>
            <p className="text-muted">Locale active: {locale.toUpperCase()}</p>
          </div>

          {query.registered === "1" ? (
            <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">Account created. You can sign in now.</p>
          ) : null}

          {query.reset === "1" ? (
            <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">Password updated successfully.</p>
          ) : null}

          <LoginForm next={next} />

          <div className="space-y-2 text-sm text-muted">
            <p>
              Demo admin: <span className="text-text">admin@yasarpack.com / Admin123!</span>
            </p>
            <p>
              Demo user: <span className="text-text">user@yasarpack.com / User123!</span>
            </p>
          </div>

          <div className="flex flex-wrap justify-between gap-3 text-sm text-muted">
            <Link href="/forgot-password" className="hover:text-text">Forgot password?</Link>
            <Link href="/register" className="hover:text-text">Create an account</Link>
          </div>
        </Card>
      </div>
    </section>
  );
}
