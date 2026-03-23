import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Card } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n";

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const [{ token }, dictionary] = await Promise.all([params, getDictionary()]);

  return (
    <section className="container-app py-16 md:py-24">
      <div className="mx-auto max-w-xl">
        <Card className="space-y-6 p-8 md:p-10">
          <div className="space-y-3 text-center">
            <p className="text-sm uppercase tracking-[0.18em] text-muted">YasarPack</p>
            <h1 className="font-display text-3xl font-black text-text md:text-4xl">{dictionary.auth.resetPasswordTitle}</h1>
            <p className="text-muted">Choose a new password for your secure session.</p>
          </div>
          <ResetPasswordForm token={token} />
        </Card>
      </div>
    </section>
  );
}
