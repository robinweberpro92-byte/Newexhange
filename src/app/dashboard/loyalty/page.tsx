import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { getUserLoyaltyData } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default async function DashboardLoyaltyPage() {
  const user = await requireUser();
  const data = await getUserLoyaltyData(user.id, user.email);
  if (!data) return null;

  const nextThreshold = data.nextTier?.thresholdPoints ?? data.user.loyaltyPoints;
  const progress = nextThreshold > 0 ? Math.min(100, Math.round((data.user.loyaltyPoints / nextThreshold) * 100)) : 100;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-3">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Current points</p>
          <p className="font-display text-4xl font-black text-text">{data.user.loyaltyPoints.toLocaleString()}</p>
          <p className="text-sm text-muted">{data.settings.description}</p>
        </Card>
        <Card className="space-y-3">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Current tier</p>
          <p className="font-display text-4xl font-black text-text">{data.user.loyaltyTier?.name ?? "Starter"}</p>
          <p className="text-sm text-muted">Multiplier {data.user.loyaltyTier ? Number(data.user.loyaltyTier.bonusMultiplier).toFixed(2) : "1.00"}x</p>
        </Card>
        <Card className="space-y-3">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Referral code</p>
          <p className="font-display text-2xl font-black text-text">{data.referralCode}</p>
          <p className="text-sm text-muted">Reusable referral placeholder, ready for future rewards logic.</p>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Tier progression</p>
            <h2 className="mt-2 font-display text-2xl font-black text-text">Towards {data.nextTier?.name ?? "top tier"}</h2>
          </div>
          <Badge tone="green">{progress}%</Badge>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-[linear-gradient(135deg,var(--brand-primary),var(--brand-secondary))]" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-sm text-muted">
          {data.nextTier ? `${data.nextTier.thresholdPoints - data.user.loyaltyPoints} points remaining before ${data.nextTier.name}.` : "No further tier available."}
        </p>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Points history</p>
          <h2 className="mt-2 font-display text-2xl font-black text-text">Latest loyalty events</h2>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Points</th>
                <th>Balance after</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {data.history.map((item) => (
                <tr key={item.id}>
                  <td>{formatDate(item.createdAt)}</td>
                  <td>{item.type}</td>
                  <td className={item.points >= 0 ? "text-emerald-300" : "text-red-200"}>{item.points}</td>
                  <td>{item.balanceAfter}</td>
                  <td>{item.note ?? item.transaction?.txReference ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
