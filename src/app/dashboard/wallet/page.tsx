import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/app/stat-card";
import { requireUser } from "@/lib/auth";
import { getWalletData } from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardWalletPage() {
  const user = await requireUser();
  const wallet = await getWalletData(user.id);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Estimated value" value={formatCurrency(wallet.totalEstimatedValue)} meta="Approximation based on completed operations" />
        <StatCard label="Tracked assets" value={String(wallet.rows.length)} meta="Distinct assets with balance" />
        <StatCard label="Portfolio mode" value="Derived" meta="Computed from transaction ledger" />
      </div>

      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Assets list</p>
          <h2 className="mt-2 font-display text-2xl font-black text-text">Wallet composition</h2>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Balance</th>
                <th>Estimated value</th>
                <th>Transactions</th>
              </tr>
            </thead>
            <tbody>
              {wallet.rows.map((asset) => (
                <tr key={asset.asset}>
                  <td className="font-semibold text-text">{asset.asset}</td>
                  <td>{asset.balance.toFixed(8).replace(/0+$/, "").replace(/\.$/, "")}</td>
                  <td>{formatCurrency(asset.estimatedValue)}</td>
                  <td>{asset.transactionCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
