import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Card } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n";

export default async function ForgotPasswordPage() {
  const dictionary = await getDictionary();

  return (
    <section className="container-app py-16 md:py-24">
      <div className="mx-auto max-w-xl">
        <Card className="space-y-6 p-8 md:p-10">
          <div className="space-y-3 text-center">
            <p className="text-sm uppercase tracking-[0.18em] text-muted">YasarPack</p>
            <h1 className="font-display text-3xl font-black text-text md:text-4xl">{dictionary.auth.forgotPasswordTitle}</h1>
            <p className="text-muted">We generate a secure reset token and store only a hash in database.</p>
          </div>
          <ForgotPasswordForm />
          <p className="text-center text-sm text-muted">
            Back to <Link href="/login" className="text-text hover:underline">login</Link>
          </p>
        </Card>
      </div>
    </section>
  );
}
