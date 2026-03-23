import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/app/stat-card";
import { getAdminOverviewData } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const data = await getAdminOverviewData();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={String(data.totalUsers)} meta={`${data.activeUsers} active`} />
        <StatCard label="Transactions" value={String(data.totalTransactions)} meta={formatCurrency(data.totalVolume)} />
        <StatCard label="Pending KYC" value={String(data.pendingKyc)} meta="Needs compliance review" />
        <StatCard label="Open tickets" value={String(data.openTickets)} meta={`${data.pendingReviews} pending reviews • ${data.activePayments} live payment methods`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <Card className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Latest transactions</p>
            <h2 className="mt-2 font-display text-2xl font-black text-text">Operations feed</h2>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="font-medium text-text">{tx.txReference}</td>
                    <td>{tx.user.email}</td>
                    <td>{tx.type}</td>
                    <td>{tx.status}</td>
                    <td>{tx.paymentMethod?.name ?? "—"}</td>
                    <td>{formatDate(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Recent admin logs</p>
            <h2 className="mt-2 font-display text-2xl font-black text-text">Traceability</h2>
          </div>
          <div className="space-y-3">
            {data.recentLogs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-line bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-text">{log.action}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">{formatDate(log.createdAt)}</p>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {log.admin.firstName} {log.admin.lastName} • {log.entityType}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
