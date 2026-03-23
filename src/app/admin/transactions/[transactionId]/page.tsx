import { updateTransactionAction } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { getAdminTransactionDetail } from "@/lib/queries";
import { formatCurrency, formatDate, toNumber } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function AdminTransactionDetailPage({ params }: { params: Promise<{ transactionId: string }> }) {
  const { transactionId } = await params;
  const transaction = await getAdminTransactionDetail(transactionId);

  if (!transaction) {
    redirect("/admin/transactions");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Transaction detail</p>
            <h2 className="mt-2 font-display text-2xl font-black text-text">{transaction.txReference}</h2>
            <p className="mt-2 text-sm text-muted">User: {transaction.user.email}</p>
          </div>
          <Badge tone={transaction.status === "COMPLETED" ? "green" : transaction.status === "PENDING" ? "amber" : transaction.status === "UNDER_REVIEW" ? "blue" : "red"}>{transaction.status}</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Type</p>
            <p className="mt-2 font-semibold text-text">{transaction.type}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Payment method</p>
            <p className="mt-2 font-semibold text-text">{transaction.paymentMethod?.name ?? "—"}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Asset amount</p>
            <p className="mt-2 font-semibold text-text">{toNumber(transaction.amount)} {transaction.asset}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Fiat</p>
            <p className="mt-2 font-semibold text-text">{formatCurrency(toNumber(transaction.fiatAmount), transaction.fiatCurrency)}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Fee</p>
            <p className="mt-2 font-semibold text-text">{formatCurrency(toNumber(transaction.feeAmount), transaction.fiatCurrency)}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Created at</p>
            <p className="mt-2 font-semibold text-text">{formatDate(transaction.createdAt)}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-white/5 p-4 text-sm text-muted">
          Loyalty events linked to this transaction: {transaction.loyaltyEvents.length}
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Admin controls</p>
          <h3 className="mt-2 font-display text-2xl font-black text-text">Update status</h3>
        </div>
        <form action={updateTransactionAction} className="space-y-4">
          <input type="hidden" name="transactionId" value={transaction.id} />
          <Select name="status" defaultValue={transaction.status}>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="UNDER_REVIEW">Under review</option>
          </Select>
          <Textarea name="adminNote" defaultValue={transaction.adminNote ?? ""} placeholder="Admin note" />
          <SubmitButton label="Save transaction" pendingLabel="Saving..." />
        </form>
      </Card>
    </div>
  );
}
