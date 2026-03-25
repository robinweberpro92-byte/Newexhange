import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { withFallback } from "@/lib/data-access";
import { estimateAssetAmount, pickTemplate } from "@/lib/exchange";

export const dynamic = "force-dynamic";

export default async function ExchangeLandingPage() {
  const methods = await withFallback(
    () => prisma.paymentMethod.findMany({ where: { active: true, displayInCheckout: true }, orderBy: [{ recommended: "desc" }, { sortOrder: "asc" }] }),
    [],
    "public exchange landing"
  );
  const featured = methods[0] ?? null;
  const estimate = featured ? estimateAssetAmount(500, "BTC", Number(featured.feePercent), Number(featured.feeFixed)) : null;
  const previewMessage = featured ? pickTemplate(featured, 1) : "Payment for your exchange request";

  return (
    <section className="container-app py-16 md:py-20">
      <div className="grid gap-8 lg:grid-cols-[1fr,0.9fr] lg:items-start">
        <div className="space-y-5">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Exchange preview</p>
          <h1 className="font-display text-4xl font-black text-text md:text-5xl">Preview a manual order before creating your account</h1>
          <p className="text-lg leading-8 text-muted">See fees, ETA, payment instructions and admin review logic before you start. You only need an account to submit the order.</p>
          <div className="grid gap-3 md:grid-cols-2">
            <Card className="space-y-2 p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Example order</p>
              <p className="font-semibold text-text">€500 → BTC</p>
              <p className="text-sm text-muted">Estimated output: {estimate ? estimate.assetAmount.toFixed(6) : "0.008100"} BTC</p>
              <p className="text-sm text-muted">Estimated fee: {featured ? `${featured.feePercent}% + €${featured.feeFixed}` : "Configured per method"}</p>
            </Card>
            <Card className="space-y-2 p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Instruction preview</p>
              <p className="font-semibold text-text">{featured?.recipientLabel || "Recipient"}</p>
              <p className="text-sm text-muted">{featured?.recipientValue || featured?.paymentLink || "Configured from admin"}</p>
              <p className="text-sm text-muted">Message/reference: {previewMessage}</p>
            </Card>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register"><Button size="lg">Create account to continue</Button></Link>
            <Link href="/payment-methods"><Button variant="secondary" size="lg">Browse payment methods</Button></Link>
          </div>
        </div>
        <Card className="space-y-4 p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">What happens next</p>
          <ol className="space-y-3 text-sm leading-7 text-muted">
            <li>1. Choose your method and target asset.</li>
            <li>2. Copy the recipient or payment link configured by admin.</li>
            <li>3. Submit the payment reference and proof if required.</li>
            <li>4. Your order enters the admin review queue.</li>
            <li>5. You can track status changes from your dashboard and contact support if needed.</li>
          </ol>
          <p className="text-sm text-muted">Operators can update fees, instructions, templates, logos, proofs and support links at any time from the admin panel.</p>
        </Card>
      </div>
    </section>
  );
}
