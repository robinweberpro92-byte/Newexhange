import Link from "next/link";
import { createExchangeRequestAction } from "@/actions/user";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { requireUser } from "@/lib/auth";
import { formatSupportedAssets, getMethodFeeSummary, pickTemplate } from "@/lib/exchange";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function DashboardExchangePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser();
  const params = await searchParams;
  const methods = await prisma.paymentMethod.findMany({
    where: { active: true, displayInCheckout: true },
    orderBy: [{ recommended: "desc" }, { sortOrder: "asc" }]
  });
  const recentRequests = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { paymentMethod: true },
    orderBy: { createdAt: "desc" },
    take: 6
  });
  const selectedMethodId = typeof params.method === "string" ? params.method : methods[0]?.id;
  const selectedMethod = methods.find((method) => method.id === selectedMethodId) ?? methods[0] ?? null;
  const createdId = typeof params.created === "string" ? params.created : undefined;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <Card className="space-y-5 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Create a manual exchange order</p>
            <h2 className="mt-2 font-display text-3xl font-black text-text">Exchange request form</h2>
            <p className="mt-2 text-sm leading-7 text-muted">Choose a method, enter the amount, copy the reference and submit your request. Admins can review, approve and complete the payout from the back office.</p>
          </div>

          {createdId ? (
            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-200">
              Exchange request created. Track it below or from <Link href="/dashboard/transactions" className="underline underline-offset-4">transactions</Link>.
            </div>
          ) : null}

          {params.error === "method" ? (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-200">Selected method is unavailable or in maintenance.</div>
          ) : null}

          <form action={createExchangeRequestAction} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-muted">Operation</label>
              <Select name="operation" defaultValue="BUY">
                <option value="BUY">Buy crypto</option>
                <option value="SELL">Sell crypto</option>
                <option value="DEPOSIT">Deposit</option>
                <option value="WITHDRAWAL">Withdrawal</option>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Payment method</label>
              <Select name="paymentMethodId" defaultValue={selectedMethod?.id}>
                {methods.map((method) => (
                  <option key={method.id} value={method.id}>{method.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Source amount</label>
              <Input name="sourceAmount" type="number" min="1" step="0.01" defaultValue="500" required />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Source currency</label>
              <Select name="sourceCurrency" defaultValue="EUR">
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Target asset</label>
              <Select name="targetAsset" defaultValue={selectedMethod?.supportedAssets?.[0] ?? "BTC"}>
                {(selectedMethod?.supportedAssets?.length ? selectedMethod.supportedAssets : ["BTC", "LTC", "ETH", "USDT"]).map((asset) => (
                  <option key={asset} value={asset}>{asset}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Destination details</label>
              <Input name="destinationDetails" placeholder="Wallet address, handle or destination note" required />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-muted">Reference / message to include</label>
              <Input name="referenceMessage" defaultValue={pickTemplate(selectedMethod, Date.now())} placeholder="Copy this reference in your payment if required" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-muted">Extra notes</label>
              <Textarea name="notes" className="min-h-[120px]" placeholder="Add a screenshot mention, order context or any detail you want the operator to see." />
            </div>
            <div className="md:col-span-2">
              <SubmitButton className="w-full" label="Submit exchange request" pendingLabel="Creating request..." />
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-3 p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Selected method instructions</p>
            <h2 className="font-display text-2xl font-black text-text">{selectedMethod?.name ?? "Choose a method"}</h2>
            <p className="text-sm text-muted">{selectedMethod?.description || selectedMethod?.trustMessage || "The admin can configure payment instructions, reference fields, templates and proof requirements for every method."}</p>
            <div className="rounded-2xl border border-line bg-white/5 p-4 text-sm text-muted">
              <p className="text-xs uppercase tracking-[0.16em]">Fees</p>
              <p className="mt-2 font-semibold text-text">{getMethodFeeSummary(selectedMethod)}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white/5 p-4 text-sm text-muted">
              <p className="text-xs uppercase tracking-[0.16em]">Supported assets</p>
              <p className="mt-2 font-semibold text-text">{formatSupportedAssets(selectedMethod)}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white/5 p-4 text-sm text-muted">
              <p className="text-xs uppercase tracking-[0.16em]">Instructions</p>
              <p className="mt-2 font-semibold text-text">{selectedMethod?.instructionsTitle || "How to complete the payment"}</p>
              <p className="mt-2 whitespace-pre-wrap leading-7">{selectedMethod?.instructionsBody || "Instructions are configurable from the admin panel. Users should see recipient info, copyable values, references and proof guidance before sending money."}</p>
              {selectedMethod?.recipientLabel && selectedMethod?.recipientValue ? <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted">{selectedMethod.recipientLabel}: <span className="font-semibold text-text normal-case tracking-normal">{selectedMethod.recipientValue}</span></p> : null}
              {selectedMethod?.referenceLabel && selectedMethod?.referenceValue ? <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted">{selectedMethod.referenceLabel}: <span className="font-semibold text-text normal-case tracking-normal">{selectedMethod.referenceValue}</span></p> : null}
              {selectedMethod?.proofHelpText ? <p className="mt-3 text-xs text-muted">{selectedMethod.proofHelpText}</p> : null}
            </div>
            <div className="rounded-2xl border border-line bg-white/5 p-4 text-sm text-muted">
              <p className="text-xs uppercase tracking-[0.16em]">Review timing</p>
              <p className="mt-2 leading-7">Your request may remain pending until an admin verifies the payment and confirms the payout. Support links can be configured per method.</p>
            </div>
          </Card>
        </div>
      </div>

      <Card className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Recent requests</p>
            <h2 className="mt-2 font-display text-2xl font-black text-text">Manual exchange timeline</h2>
          </div>
          <Link href="/dashboard/transactions" className="text-sm font-semibold text-[var(--brand-secondary)] hover:underline">View all transactions</Link>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Method</th>
                <th>Asset</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((tx) => (
                <tr key={tx.id}>
                  <td className="font-semibold text-text">{tx.txReference}</td>
                  <td>{tx.paymentMethod?.name ?? "Manual"}</td>
                  <td>{tx.asset}</td>
                  <td>{tx.status}</td>
                  <td>{tx.fiatAmount.toString()} {tx.fiatCurrency}</td>
                  <td>{formatDate(tx.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
