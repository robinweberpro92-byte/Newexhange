import Link from "next/link";
import { deletePaymentMethodAction, upsertPaymentMethodAction } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma";
import { formatDate, toNumber } from "@/lib/utils";

export default async function AdminPaymentsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const editId = typeof params.edit === "string" ? params.edit : undefined;

  const paymentMethods = await prisma.paymentMethod.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });

  const activeCount = paymentMethods.filter((method) => method.active).length;
  const recommendedCount = paymentMethods.filter((method) => method.recommended).length;
  const maintenanceCount = paymentMethods.filter((method) => method.maintenanceMode).length;
  const selected = paymentMethods.find((method) => method.id === editId) ?? null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Live methods</p>
          <p className="mt-3 font-display text-3xl font-black text-text">{activeCount}</p>
          <p className="mt-2 text-sm text-muted">Currently visible for at least one operational surface.</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Recommended</p>
          <p className="mt-3 font-display text-3xl font-black text-text">{recommendedCount}</p>
          <p className="mt-2 text-sm text-muted">Methods promoted for conversion on hero or checkout.</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Maintenance mode</p>
          <p className="mt-3 font-display text-3xl font-black text-text">{maintenanceCount}</p>
          <p className="mt-2 text-sm text-muted">Methods temporarily blocked with custom unavailable messaging.</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Payment method editor</p>
              <h2 className="mt-2 font-display text-2xl font-black text-text">
                {selected ? `Edit ${selected.name}` : "Create a payment method"}
              </h2>
            </div>
            {selected ? (
              <Link href="/admin/payments" className="text-sm font-semibold text-[var(--brand-secondary)] hover:underline">
                Clear selection
              </Link>
            ) : null}
          </div>

          <form action={upsertPaymentMethodAction} className="grid gap-4 md:grid-cols-2">
            {selected ? <input type="hidden" name="id" value={selected.id} /> : null}

            <div>
              <label className="mb-2 block text-sm text-muted">Name</label>
              <Input name="name" defaultValue={selected?.name ?? ""} required />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Slug</label>
              <Input name="slug" defaultValue={selected?.slug ?? ""} placeholder="auto-generated if empty" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-muted">Logo URL</label>
              <Input name="logoUrl" defaultValue={selected?.logoUrl ?? ""} placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-muted">Description</label>
              <Textarea name="description" defaultValue={selected?.description ?? ""} className="min-h-[110px]" />
            </div>

            <div>
              <label className="mb-2 block text-sm text-muted">Estimated delay</label>
              <Input name="estimatedDelay" defaultValue={selected?.estimatedDelay ?? ""} placeholder="Instant / 1-2 business days" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Country restrictions</label>
              <Input
                name="countryRestrictions"
                defaultValue={selected?.countryRestrictions.join(", ") ?? ""}
                placeholder="FR, BE, CA"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Supported assets</label>
              <Input
                name="supportedAssets"
                defaultValue={selected?.supportedAssets?.join(", ") ?? "BTC, LTC, ETH, USDT"}
                placeholder="BTC, LTC, ETH, USDT"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-muted">Fixed fee (EUR)</label>
              <Input name="feeFixed" type="number" min="0" step="0.01" defaultValue={toNumber(selected?.feeFixed)} required />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Fee percent</label>
              <Input name="feePercent" type="number" min="0" max="100" step="0.01" defaultValue={toNumber(selected?.feePercent)} required />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Sort order</label>
              <Input name="sortOrder" type="number" min="0" step="1" defaultValue={selected?.sortOrder ?? paymentMethods.length} required />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Loyalty bonus points</label>
              <Input
                name="loyaltyBonusPoints"
                type="number"
                min="0"
                step="1"
                defaultValue={selected?.loyaltyBonusPoints ?? 0}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-muted">Trust message</label>
              <Textarea name="trustMessage" defaultValue={selected?.trustMessage ?? ""} className="min-h-[90px]" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-muted">Unavailable message</label>
              <Textarea name="unavailableMessage" defaultValue={selected?.unavailableMessage ?? ""} className="min-h-[90px]" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Instructions title</label>
              <Input name="instructionsTitle" defaultValue={selected?.instructionsTitle ?? ""} placeholder="How to send your payment" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Payment link</label>
              <Input name="paymentLink" defaultValue={selected?.paymentLink ?? ""} placeholder="https://..." />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Recipient label</label>
              <Input name="recipientLabel" defaultValue={selected?.recipientLabel ?? ""} placeholder="PayPal email / wallet address" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Recipient value</label>
              <Input name="recipientValue" defaultValue={selected?.recipientValue ?? ""} placeholder="payments@example.com" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Reference label</label>
              <Input name="referenceLabel" defaultValue={selected?.referenceLabel ?? ""} placeholder="Message to include" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Reference value</label>
              <Input name="referenceValue" defaultValue={selected?.referenceValue ?? ""} placeholder="Order code / transfer reference" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-muted">Instructions body</label>
              <Textarea name="instructionsBody" defaultValue={selected?.instructionsBody ?? ""} className="min-h-[150px]" placeholder="Explain clearly how the user must pay, what to copy, what proof to upload, and what happens next." />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-muted">Message templates (comma or new line separated)</label>
              <Textarea
                name="messageTemplatesRaw"
                defaultValue={Array.isArray(selected?.messageTemplates) ? selected?.messageTemplates.join("
") : ""}
                className="min-h-[140px]"
                placeholder="Template 1
Template 2
Template 3"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Support Discord URL</label>
              <Input name="supportDiscordUrl" defaultValue={selected?.supportDiscordUrl ?? ""} placeholder="https://discord.gg/..." />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Support Telegram URL</label>
              <Input name="supportTelegramUrl" defaultValue={selected?.supportTelegramUrl ?? ""} placeholder="https://t.me/..." />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Proof help text</label>
              <Input name="proofHelpText" defaultValue={selected?.proofHelpText ?? ""} placeholder="Upload a screenshot after payment" />
            </div>

            <div className="rounded-3xl border border-line bg-white/5 p-4 md:col-span-2">
              <p className="mb-3 text-sm font-semibold text-text">Operational toggles</p>
              <div className="grid gap-3 md:grid-cols-3">
                <label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" name="active" defaultChecked={selected?.active ?? true} /> Active</label>
                <label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" name="recommended" defaultChecked={selected?.recommended ?? false} /> Recommended</label>
                <label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" name="maintenanceMode" defaultChecked={selected?.maintenanceMode ?? false} /> Maintenance</label>
                <label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" name="supportBuy" defaultChecked={selected?.supportBuy ?? true} /> Buy</label>
                <label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" name="supportSell" defaultChecked={selected?.supportSell ?? true} /> Sell</label>
                <label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" name="supportDeposit" defaultChecked={selected?.supportDeposit ?? true} /> Deposit</label>
                <label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" name="supportWithdrawal" defaultChecked={selected?.supportWithdrawal ?? true} /> Withdrawal</label>
                <label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" name="requiresProof" defaultChecked={selected?.requiresProof ?? false} /> Proof required</label>
                <label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" name="displayInHero" defaultChecked={selected?.displayInHero ?? true} /> Hero</label>
                <label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" name="displayInCheckout" defaultChecked={selected?.displayInCheckout ?? true} /> Checkout</label>
                <label className="flex items-center gap-3 text-sm text-muted md:col-span-3"><input type="checkbox" name="displayInFooter" defaultChecked={selected?.displayInFooter ?? true} /> Footer</label>
              </div>
            </div>

            <div className="md:col-span-2">
              <SubmitButton label={selected ? "Update method" : "Create method"} pendingLabel="Saving..." className="w-full" />
            </div>
          </form>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Current catalogue</p>
            <h2 className="mt-2 font-display text-2xl font-black text-text">Payment methods list</h2>
          </div>

          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="rounded-3xl border border-line bg-white/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-xl font-black text-text">{method.name}</p>
                      <Badge tone={method.maintenanceMode ? "amber" : method.active ? "green" : "red"}>
                        {method.maintenanceMode ? "MAINTENANCE" : method.active ? "LIVE" : "DISABLED"}
                      </Badge>
                      {method.recommended ? <Badge tone="blue">RECOMMENDED</Badge> : null}
                    </div>
                    <p className="text-sm text-muted">{method.slug}</p>
                    <p className="max-w-2xl text-sm text-muted">{method.description ?? method.trustMessage ?? "No description provided."}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/payments?edit=${method.id}`} className="rounded-full border border-line px-3 py-2 text-sm text-text transition hover:bg-white/10">
                      Edit
                    </Link>
                    <form action={deletePaymentMethodAction}>
                      <input type="hidden" name="id" value={method.id} />
                      <SubmitButton label="Delete" pendingLabel="Deleting..." variant="danger" size="sm" />
                    </form>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
                  <div className="rounded-2xl border border-line bg-black/10 p-3 text-muted">
                    <p className="text-xs uppercase tracking-[0.16em]">Fees</p>
                    <p className="mt-2 font-semibold text-text">{toNumber(method.feePercent)}% + {toNumber(method.feeFixed)}€</p>
                  </div>
                  <div className="rounded-2xl border border-line bg-black/10 p-3 text-muted">
                    <p className="text-xs uppercase tracking-[0.16em]">Delay</p>
                    <p className="mt-2 font-semibold text-text">{method.estimatedDelay ?? "Not set"}</p>
                  </div>
                  <div className="rounded-2xl border border-line bg-black/10 p-3 text-muted">
                    <p className="text-xs uppercase tracking-[0.16em]">Display surfaces</p>
                    <p className="mt-2 font-semibold text-text">
                      {[method.displayInHero && "Hero", method.displayInCheckout && "Checkout", method.displayInFooter && "Footer"].filter(Boolean).join(" • ") || "Hidden"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-line bg-black/10 p-3 text-muted">
                    <p className="text-xs uppercase tracking-[0.16em]">Updated</p>
                    <p className="mt-2 font-semibold text-text">{formatDate(method.updatedAt)}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm">
                  <div className="rounded-2xl border border-line bg-black/10 p-3 text-muted">
                    <p className="text-xs uppercase tracking-[0.16em]">Instruction target</p>
                    <p className="mt-2 font-semibold text-text">{method.recipientLabel && method.recipientValue ? `${method.recipientLabel}: ${method.recipientValue}` : method.paymentLink ?? "Configured in admin"}</p>
                    {method.referenceLabel && method.referenceValue ? <p className="mt-2 text-xs text-muted">{method.referenceLabel}: {method.referenceValue}</p> : null}
                  </div>
                  <div className="rounded-2xl border border-line bg-black/10 p-3 text-muted">
                    <p className="text-xs uppercase tracking-[0.16em]">Manual review</p>
                    <p className="mt-2 font-semibold text-text">{method.requiresProof ? "Proof upload required" : "Proof optional"}</p>
                    <p className="mt-2 text-xs text-muted">{method.proofHelpText ?? method.instructionsTitle ?? "Admins can validate the payment and update the order timeline."}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em] text-muted">
                  {method.supportBuy ? <Badge tone="slate">BUY</Badge> : null}
                  {method.supportSell ? <Badge tone="slate">SELL</Badge> : null}
                  {method.supportDeposit ? <Badge tone="slate">DEPOSIT</Badge> : null}
                  {method.supportWithdrawal ? <Badge tone="slate">WITHDRAWAL</Badge> : null}
                  {method.requiresProof ? <Badge tone="amber">PROOF</Badge> : null}
                  {method.supportedAssets?.map((asset) => <Badge key={asset} tone="blue">{asset}</Badge>)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
