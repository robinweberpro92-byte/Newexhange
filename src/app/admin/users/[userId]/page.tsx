import { adjustUserPointsAction, reviewKycAction, setUserTierAction } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { getAdminUserDetail } from "@/lib/queries";
import { roleLabel } from "@/lib/rbac";
import { formatDate, formatCurrency, toNumber } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const [data, tiers] = await Promise.all([
    getAdminUserDetail(userId),
    prisma.loyaltyTier.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } })
  ]);

  if (!data.user) {
    redirect("/admin/users");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted">User profile</p>
              <h2 className="mt-2 font-display text-2xl font-black text-text">{data.user.firstName} {data.user.lastName}</h2>
              <p className="mt-2 text-sm text-muted">{data.user.email}</p>
            </div>
            <div className="flex gap-2">
              <Badge tone={data.user.isActive ? "green" : "red"}>{data.user.isActive ? "Active" : "Suspended"}</Badge>
              <Badge tone="blue">{roleLabel(data.user.role)}</Badge>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Country</p>
              <p className="mt-2 font-semibold text-text">{data.user.country ?? "—"}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Phone</p>
              <p className="mt-2 font-semibold text-text">{data.user.phone ?? "—"}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Loyalty points</p>
              <p className="mt-2 font-semibold text-text">{data.user.loyaltyPoints}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">KYC status</p>
              <p className="mt-2 font-semibold text-text">{data.user.kycStatus}</p>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="font-display text-xl font-black text-text">Tier assignment</h3>
            <form action={setUserTierAction} className="space-y-4">
              <input type="hidden" name="userId" value={data.user.id} />
              <Select name="loyaltyTierId" defaultValue={data.user.loyaltyTierId ?? ""}>
                <option value="">No tier</option>
                {tiers.map((tier) => (
                  <option key={tier.id} value={tier.id}>{tier.name}</option>
                ))}
              </Select>
              <SubmitButton label="Save tier" pendingLabel="Saving..." />
            </form>
          </Card>

          <Card className="space-y-4">
            <h3 className="font-display text-xl font-black text-text">Adjust points</h3>
            <form action={adjustUserPointsAction} className="space-y-4">
              <input type="hidden" name="userId" value={data.user.id} />
              <Input name="points" type="number" placeholder="Use negative values to subtract" required />
              <Input name="note" placeholder="Reason for manual adjustment" required />
              <SubmitButton label="Apply points" pendingLabel="Applying..." />
            </form>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <Card className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Recent transactions</p>
            <h3 className="mt-2 font-display text-2xl font-black text-text">Ledger</h3>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Fiat</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="font-medium text-text">{tx.txReference}</td>
                    <td>{tx.type}</td>
                    <td>{tx.status}</td>
                    <td>{formatCurrency(toNumber(tx.fiatAmount), tx.fiatCurrency)}</td>
                    <td>{formatDate(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Latest KYC</p>
            <h3 className="mt-2 font-display text-2xl font-black text-text">Review</h3>
          </div>
          {data.latestKyc ? (
            <form action={reviewKycAction} className="space-y-4">
              <input type="hidden" name="submissionId" value={data.latestKyc.id} />
              <div className="rounded-2xl border border-line bg-white/5 p-4 text-sm text-muted">
                <p>Document type: <span className="font-semibold text-text">{data.latestKyc.documentType}</span></p>
                <p className="mt-2">Submitted at: <span className="font-semibold text-text">{formatDate(data.latestKyc.submittedAt)}</span></p>
                <p className="mt-2">Current status: <span className="font-semibold text-text">{data.latestKyc.status}</span></p>
              </div>
              <Select name="status" defaultValue={data.latestKyc.status}>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </Select>
              <Textarea name="adminComment" defaultValue={data.latestKyc.adminComment ?? ""} placeholder="Admin review note" />
              <SubmitButton label="Save KYC review" pendingLabel="Saving..." />
            </form>
          ) : (
            <p className="rounded-2xl border border-line bg-white/5 p-4 text-sm text-muted">No KYC submission found.</p>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        <Card className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Loyalty history</p>
            <h3 className="mt-2 font-display text-2xl font-black text-text">Points events</h3>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Points</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {data.loyaltyHistory.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDate(entry.createdAt)}</td>
                    <td>{entry.type}</td>
                    <td>{entry.points}</td>
                    <td>{entry.balanceAfter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Support tickets</p>
            <h3 className="mt-2 font-display text-2xl font-black text-text">Customer support</h3>
          </div>
          <div className="space-y-3">
            {data.tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-2xl border border-line bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-text">{ticket.number}</p>
                    <p className="text-sm text-muted">{ticket.subject}</p>
                  </div>
                  <Badge tone={ticket.status === "OPEN" ? "amber" : ticket.status === "CLOSED" || ticket.status === "RESOLVED" ? "green" : "blue"}>{ticket.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
