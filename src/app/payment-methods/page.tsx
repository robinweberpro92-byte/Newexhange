import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { withFallback } from "@/lib/data-access";
import { formatSupportedAssets, getMethodFeeSummary } from "@/lib/exchange";

export const dynamic = "force-dynamic";

type PaymentMethod = {
  id: string;
  name: string;
  description?: string | null;
  recommended?: boolean;
  maintenanceMode?: boolean;
  feePercent?: number | null;
  feeFixed?: number | null;
  estimatedDelay?: string | null;
  instructionsTitle?: string | null;
  instructionsBody?: string | null;
  recipientLabel?: string | null;
  recipientValue?: string | null;
  paymentLink?: string | null;
  referenceLabel?: string | null;
  referenceValue?: string | null;
  requiresProof?: boolean;
  proofHelpText?: string | null;
  supportedAssets?: string[];
  trustMessage?: string | null;
};

export default async function PaymentMethodsPage() {
  const dbMethods =
    (await withFallback(
      () =>
        prisma.paymentMethod.findMany({
          where: { active: true },
          orderBy: [{ recommended: "desc" }, { sortOrder: "asc" }]
        }),
      [],
      "payment methods page"
    )) || [];

  const methods: PaymentMethod[] = dbMethods.map((method) => ({
    id: method.id,
    name: method.name,
    description: method.description,
    recommended: method.recommended,
    maintenanceMode: method.maintenanceMode,
    feePercent: method.feePercent != null ? Number(method.feePercent) : null,
    feeFixed: method.feeFixed != null ? Number(method.feeFixed) : null,
    estimatedDelay: method.estimatedDelay,
    instructionsTitle: method.instructionsTitle,
    instructionsBody: method.instructionsBody,
    recipientLabel: method.recipientLabel,
    recipientValue: method.recipientValue,
    paymentLink: method.paymentLink,
    referenceLabel: method.referenceLabel,
    referenceValue: method.referenceValue,
    requiresProof: method.requiresProof,
    proofHelpText: method.proofHelpText,
    supportedAssets: method.supportedAssets ?? [],
    trustMessage: method.trustMessage
  }));

  const effectiveMethods: PaymentMethod[] = methods.length
    ? methods
    : [
        {
          id: "paypal",
          name: "PayPal",
          description: "Manual or semi-manual order flow with admin review.",
          recommended: true,
          maintenanceMode: false,
          feePercent: 1.9,
          feeFixed: 0,
          estimatedDelay: "Instant to 15 min",
          instructionsTitle: "Send the PayPal payment",
          instructionsBody:
            "Copy the admin-configured PayPal email or payment link, then follow the displayed instructions.",
          recipientLabel: "PayPal email",
          recipientValue: "payments@yasarpack.com",
          paymentLink: "https://paypal.me/yasarpack",
          referenceLabel: "Reference",
          referenceValue: "Use your order ID",
          requiresProof: true,
          proofHelpText: "Upload a screenshot after payment.",
          supportedAssets: ["BTC", "LTC", "ETH", "USDT"]
        },
        {
          id: "paysafecard",
          name: "Paysafecard",
          description: "Code submission reviewed manually by an operator.",
          recommended: false,
          maintenanceMode: false,
          feePercent: 2.5,
          feeFixed: 0,
          estimatedDelay: "Manual review",
          instructionsTitle: "Submit your code",
          instructionsBody:
            "Enter your code securely and wait for manual validation by an admin.",
          recipientLabel: "Verification",
          recipientValue: "Handled by admin",
          requiresProof: false,
          supportedAssets: ["BTC", "LTC", "ETH", "USDT"]
        }
      ];

  return (
    <section className="container-app py-16 md:py-20">
      <div className="max-w-4xl space-y-4">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">
          Payment rails
        </p>
        <h1 className="font-display text-4xl font-black text-text md:text-5xl">
          Payment methods and manual order instructions
        </h1>
        <p className="text-lg leading-8 text-muted">
          Every method exposes fees, supported assets, instructions and proof requirements.
        </p>
      </div>

      <div className="mt-10 space-y-4">
        {effectiveMethods.map((method) => (
          <Card key={method.id} className="space-y-5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-2xl font-black text-text">
                    {method.name}
                  </h2>

                  {method.recommended && (
                    <Badge tone="blue">Recommended</Badge>
                  )}

                  {method.maintenanceMode ? (
                    <Badge tone="amber">Maintenance</Badge>
                  ) : (
                    <Badge tone="green">Live</Badge>
                  )}
                </div>

                <p className="text-sm text-muted">
                  {method.description ||
                    method.trustMessage ||
                    "Configured from admin"}
                </p>
              </div>

              <Link href="/dashboard/exchange">
                <Button size="sm">Use this method</Button>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card className="p-4">
                <p className="text-xs text-muted">Fees</p>
                <p className="mt-2 font-semibold">
                  {getMethodFeeSummary(method)}
                </p>
              </Card>

              <Card className="p-4">
                <p className="text-xs text-muted">Delay</p>
                <p className="mt-2 font-semibold">
                  {method.estimatedDelay || "Configured"}
                </p>
              </Card>

              <Card className="p-4">
                <p className="text-xs text-muted">Assets</p>
                <p className="mt-2 font-semibold">
                  {formatSupportedAssets(method)}
                </p>
              </Card>

              <Card className="p-4">
                <p className="text-xs text-muted">Proof</p>
                <p className="mt-2 font-semibold">
                  {method.requiresProof ? "Required" : "Optional"}
                </p>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-4">
                <p className="text-xs text-muted">Instructions</p>
                <p className="font-semibold">
                  {method.instructionsTitle || "How to pay"}
                </p>
                <p className="text-sm text-muted whitespace-pre-wrap">
                  {method.instructionsBody || "Configured in admin"}
                </p>
              </Card>

              <Card className="p-4">
                <p className="text-xs text-muted">Recipient</p>
                <p className="font-semibold">
                  {method.recipientValue || method.paymentLink || "Configured"}
                </p>

                {method.referenceLabel && method.referenceValue && (
                  <p className="text-sm">
                    {method.referenceLabel}: {method.referenceValue}
                  </p>
                )}

                {method.proofHelpText && (
                  <p className="text-xs text-muted">
                    {method.proofHelpText}
                  </p>
                )}
              </Card>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}