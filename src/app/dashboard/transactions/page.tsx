import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { requireUser } from "@/lib/auth";
import { getUserTransactionsData } from "@/lib/queries";
import { formatCurrency, formatDate, toNumber } from "@/lib/utils";

export default async function DashboardTransactionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser();
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : undefined;
  const type = typeof params.type === "string" ? params.type : undefined;
  const transactions = await getUserTransactionsData(user.id, { status, type });

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <form className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm text-muted">Status</label>
            <Select name="status" defaultValue={status ?? ""}>
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="UNDER_REVIEW">Under review</option>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Type</label>
            <Select name="type" defaultValue={type ?? ""}>
              <option value="">All</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
            </Select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="h-11 rounded-2xl border border-line bg-white/5 px-4 font-medium text-text hover:bg-white/10">
              Filter
            </button>
          </div>
        </form>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Ledger</p>
          <h2 className="mt-2 font-display text-2xl font-black text-text">Transaction history</h2>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>Asset</th>
                <th>Amount</th>
                <th>Fiat</th>
                <th>Fee</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="font-medium text-text">{tx.txReference}</td>
                  <td>{tx.type}</td>
                  <td>{tx.asset}</td>
                  <td>{toNumber(tx.amount)} {tx.asset}</td>
                  <td>{formatCurrency(toNumber(tx.fiatAmount), tx.fiatCurrency)}</td>
                  <td>{formatCurrency(toNumber(tx.feeAmount), tx.fiatCurrency)}</td>
                  <td>{tx.paymentMethod?.name ?? "—"}</td>
                  <td>
                    <Badge tone={tx.status === "COMPLETED" ? "green" : tx.status === "PENDING" ? "amber" : tx.status === "UNDER_REVIEW" ? "blue" : "red"}>
                      {tx.status}
                    </Badge>
                  </td>
                  <td>{formatDate(tx.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
