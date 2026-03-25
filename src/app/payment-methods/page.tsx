import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { withFallback } from "@/lib/data-access";
import { formatSupportedAssets, getMethodFeeSummary } from "@/lib/exchange";

export const dynamic = "force-dynamic";

export default async function PaymentMethodsPage() {
  const methods = (await withFallback(
    () => prisma.paymentMethod.findMany({ where: { active: true }, orderBy: [{ recommended: "desc" }, { sortOrder: "asc" }] }),
    [],
    "payment methods page"
  )) || [];

  const effectiveMethods = methods.length ? methods : [
    { id: "paypal", name: "PayPal", description: "Manual or semi-manual order flow with admin review.", recommended: true, maintenanceMode: false, feePercent: 1.9, feeFixed: 0, estimatedDelay: "Instant to 15 min", instructionsTitle: "Send the PayPal payment", instructionsBody: "Copy the admin-configured PayPal email or payment link, use the provided reference, then upload proof if required.", recipientLabel: "PayPal email", recipientValue: "payments@yasarpack.com", paymentLink: "https://paypal.me/yasarpack", referenceLabel: "Reference", referenceValue: "Use your order ID", requiresProof: true, proofHelpText: "A screenshot can help the admin validate faster.", supportedAssets: ["BTC","LTC","ETH","USDT"] },
    { id: "paysafecard", name: "Paysafecard", description: "Code submission reviewed manually by an operator.", recommended: false, maintenanceMode: false, feePercent: 2.5, feeFixed: 0, estimatedDelay: "Manual review", instructionsTitle: "Submit your code", instructionsBody: "Enter the code securely, then wait for manual validation.", recipientLabel: "Verification", recipientValue: "Handled by admin", requiresProof: false, supportedAssets: ["BTC","LTC","ETH","USDT"] }
  ] as any;

  return (
    <section className="container-app py-16 md:py-20">
      <div className="max-w-4xl space-y-4">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">Payment rails</p>
        <h1 className="font-display text-4xl font-black text-text md:text-5xl">Payment methods and manual order instructions</h1>
        <p className="text-lg leading-8 text-muted">Every method exposes fees, supported assets, instructions, proof requirements, and support links before the user submits an order.</p>
      </div>
      <div className="mt-10 space-y-4">
        {effectiveMethods.map((method) => (
          <Card key={method.id} className="space-y-5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-2xl font-black text-text">{method.name}</h2>
                  {method.recommended ? <Badge tone="blue">Recommended</Badge> : null}
                  {method.maintenanceMode ? <Badge tone="amber">Maintenance</Badge> : <Badge tone="green">Live</Badge>}
                </div>
                <p className="text-sm text-muted">{method.description || method.trustMessage || "Configured from the admin panel."}</p>
              </div>
              <Link href="/dashboard/exchange">
                <Button size="sm">Use this method</Button>
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="p-4"><p className="text-xs uppercase tracking-[0.16em] text-muted">Fees</p><p className="mt-2 font-semibold text-text">{getMethodFeeSummary(method)}</p></Card>
              <Card className="p-4"><p className="text-xs uppercase tracking-[0.16em] text-muted">Delay</p><p className="mt-2 font-semibold text-text">{method.estimatedDelay || "Configured in admin"}</p></Card>
              <Card className="p-4"><p className="text-xs uppercase tracking-[0.16em] text-muted">Assets</p><p className="mt-2 font-semibold text-text">{formatSupportedAssets(method)}</p></Card>
              <Card className="p-4"><p className="text-xs uppercase tracking-[0.16em] text-muted">Proof</p><p className="mt-2 font-semibold text-text">{method.requiresProof ? "Required" : "Optional"}</p></Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="space-y-2 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted">Instructions</p>
                <p className="font-semibold text-text">{method.instructionsTitle || "How to complete the payment"}</p>
                <p className="whitespace-pre-wrap text-sm leading-7 text-muted">{method.instructionsBody || "The admin can configure detailed instructions, copyable fields, proof requirements, and support fallbacks for this method."}</p>
              </Card>
              <Card className="space-y-2 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted">Copyable fields</p>
                <p className="text-sm text-muted">{method.recipientLabel || "Recipient"}</p>
                <p className="font-semibold text-text">{method.recipientValue || method.paymentLink || "Configured in admin"}</p>
                {method.referenceLabel && method.referenceValue ? <p className="text-sm text-muted">{method.referenceLabel}: <span className="font-semibold text-text">{method.referenceValue}</span></p> : null}
                {method.proofHelpText ? <p className="text-xs text-muted">{method.proofHelpText}</p> : null}
              </Card>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
