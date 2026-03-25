import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/app/stat-card";
import { requireUser } from "@/lib/auth";
import { getUserOverviewData } from "@/lib/queries";
import { formatCurrency, formatDate, toNumber } from "@/lib/utils";

function kycTone(status?: string) {
  if (status === "APPROVED") return "green" as const;
  if (status === "REJECTED") return "red" as const;
  if (status === "PENDING") return "amber" as const;
  return "slate" as const;
}

export default async function DashboardOverviewPage() {
  const user = await requireUser();
  const data = await getUserOverviewData(user.id);
  if (!data) return null;

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Quick actions</p>
          <h2 className="mt-2 font-display text-2xl font-black text-text">Start a new order or continue an existing one</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/exchange"><Button size="sm">New exchange</Button></Link>
          <Link href="/dashboard/transactions"><Button size="sm" variant="secondary">Track orders</Button></Link>
          <Link href="/dashboard/support"><Button size="sm" variant="secondary">Need help</Button></Link>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Estimated wallet" value={formatCurrency(data.wallet.totalEstimatedValue)} meta="Computed from completed transactions" />
        <StatCard label="Loyalty points" value={data.user.loyaltyPoints.toLocaleString()} meta={data.user.loyaltyTier?.name ?? "No tier yet"} />
        <StatCard label="Open tickets" value={String(data.openTicketCount)} meta="Support requests needing attention" />
        <StatCard label="KYC status" value={data.user.kycStatus.replaceAll("_", " ")} meta={data.latestKyc?.documentType ?? "No submission yet"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Recent transactions</p>
              <h2 className="mt-2 font-display text-2xl font-black text-text">Latest activity</h2>
            </div>
            <Link href="/dashboard/transactions">
              <Button variant="secondary" size="sm">View all</Button>
            </Link>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Asset</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="font-medium text-text">{tx.txReference}</td>
                    <td>{tx.type}</td>
                    <td>{tx.asset}</td>
                    <td>
                      <Badge tone={tx.status === "COMPLETED" ? "green" : tx.status === "PENDING" ? "amber" : tx.status === "UNDER_REVIEW" ? "blue" : "red"}>
                        {tx.status}
                      </Badge>
                    </td>
                    <td>{toNumber(tx.amount)} {tx.asset}</td>
                    <td>{formatDate(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Loyalty progress</p>
            <div>
              <h3 className="font-display text-2xl font-black text-text">{data.user.loyaltyTier?.name ?? "Starter"}</h3>
              <p className="mt-2 text-sm text-muted">Current balance: {data.user.loyaltyPoints.toLocaleString()} points.</p>
            </div>
            {data.nextTier ? (
              <div className="rounded-2xl border border-line bg-white/5 p-4 text-sm text-muted">
                {data.nextTier.thresholdPoints - data.user.loyaltyPoints} pts to reach <span className="font-semibold text-text">{data.nextTier.name}</span>
              </div>
            ) : (
              <div className="rounded-2xl border border-line bg-white/5 p-4 text-sm text-muted">Top tier already reached.</div>
            )}
            <Link href="/dashboard/loyalty">
              <Button size="sm">Open loyalty space</Button>
            </Link>
          </Card>

          <Card className="space-y-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Compliance</p>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-black text-text">KYC</h3>
                <p className="mt-2 text-sm text-muted">Latest submission and review state.</p>
              </div>
              <Badge tone={kycTone(data.user.kycStatus)}>{data.user.kycStatus.replaceAll("_", " ")}</Badge>
            </div>
            <p className="text-sm text-muted">{data.latestKyc?.adminComment ?? "No rejection note from admin."}</p>
            <div className="flex gap-3">
              <Link href="/dashboard/kyc">
                <Button variant="secondary" size="sm">Manage KYC</Button>
              </Link>
              <Link href="/dashboard/support">
                <Button size="sm">Open support</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
