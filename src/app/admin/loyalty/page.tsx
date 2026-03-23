import Link from "next/link";
import { deleteLoyaltyTierAction, updateLoyaltySettingsAction, upsertLoyaltyTierAction } from "@/actions/admin";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { getLoyaltySettings } from "@/lib/cms";
import { prisma } from "@/lib/prisma";
import { formatDate, toNumber } from "@/lib/utils";

export default async function AdminLoyaltyPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const editId = typeof params.edit === "string" ? params.edit : undefined;

  const [settings, tiers, recentHistory, topUsers] = await Promise.all([
    getLoyaltySettings(),
    prisma.loyaltyTier.findMany({
      orderBy: [{ sortOrder: "asc" }, { thresholdPoints: "asc" }]
    }),
    prisma.loyaltyPointHistory.findMany({
      include: {
        user: true,
        transaction: true
      },
      orderBy: { createdAt: "desc" },
      take: 10
    }),
    prisma.user.findMany({
      include: { loyaltyTier: true },
      orderBy: [{ loyaltyPoints: "desc" }, { createdAt: "asc" }],
      take: 6
    })
  ]);

  const selected = tiers.find((tier) => tier.id === editId) ?? null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Program status</p>
          <p className="mt-3 font-display text-3xl font-black text-text">{settings.enabled ? "ON" : "OFF"}</p>
          <p className="mt-2 text-sm text-muted">Base rate: {settings.baseRate} pt / EUR.</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Tier mode</p>
          <p className="mt-3 font-display text-3xl font-black text-text">{settings.tierMode}</p>
          <p className="mt-2 text-sm text-muted">Payment bonuses {settings.paymentMethodBonusEnabled ? "enabled" : "disabled"}.</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Defined tiers</p>
          <p className="mt-3 font-display text-3xl font-black text-text">{tiers.length}</p>
          <p className="mt-2 text-sm text-muted">Adjust users manually from the dedicated user detail pages.</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <div className="space-y-6">
          <Card className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Global rules</p>
              <h2 className="mt-2 font-display text-2xl font-black text-text">Loyalty settings</h2>
            </div>

            <form action={updateLoyaltySettingsAction} className="space-y-4">
              <div className="rounded-3xl border border-line bg-white/5 p-4">
                <label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" name="enabled" defaultChecked={settings.enabled} /> Enable loyalty program</label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-muted">Base rate</label>
                  <Input name="baseRate" type="number" min="0" max="100" step="0.1" defaultValue={settings.baseRate} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-muted">Tier mode</label>
                  <Select name="tierMode" defaultValue={settings.tierMode}>
                    <option value="BALANCE">Balance</option>
                    <option value="TOTAL_EARNED">Total earned</option>
                  </Select>
                </div>
              </div>
              <div className="rounded-3xl border border-line bg-white/5 p-4">
                <label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" name="paymentMethodBonusEnabled" defaultChecked={settings.paymentMethodBonusEnabled} /> Apply payment method bonus points</label>
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted">Description</label>
                <Textarea name="description" defaultValue={settings.description} className="min-h-[120px]" />
              </div>
              <SubmitButton label="Update loyalty settings" pendingLabel="Saving..." className="w-full" />
            </form>
          </Card>

          <Card className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted">Tier editor</p>
                <h2 className="mt-2 font-display text-2xl font-black text-text">{selected ? `Edit ${selected.name}` : "Create a loyalty tier"}</h2>
              </div>
              {selected ? (
                <Link href="/admin/loyalty" className="text-sm font-semibold text-[var(--brand-secondary)] hover:underline">
                  Clear selection
                </Link>
              ) : null}
            </div>

            <form action={upsertLoyaltyTierAction} className="grid gap-4 md:grid-cols-2">
              {selected ? <input type="hidden" name="id" value={selected.id} /> : null}
              <div>
                <label className="mb-2 block text-sm text-muted">Name</label>
                <Input name="name" defaultValue={selected?.name ?? ""} required />
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted">Slug</label>
                <Input name="slug" defaultValue={selected?.slug ?? ""} placeholder="auto-generated if empty" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted">Color</label>
                <Input name="colorHex" defaultValue={selected?.colorHex ?? "#16c47f"} required />
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted">Threshold points</label>
                <Input name="thresholdPoints" type="number" min="0" step="1" defaultValue={selected?.thresholdPoints ?? 0} required />
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted">Bonus multiplier</label>
                <Input name="bonusMultiplier" type="number" min="1" max="5" step="0.01" defaultValue={toNumber(selected?.bonusMultiplier) || 1} required />
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted">Sort order</label>
                <Input name="sortOrder" type="number" min="0" step="1" defaultValue={selected?.sortOrder ?? tiers.length} required />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-muted">Description</label>
                <Textarea name="description" defaultValue={selected?.description ?? ""} className="min-h-[90px]" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-muted">Perks (comma separated)</label>
                <Input
                  name="perks"
                  defaultValue={Array.isArray(selected?.perks) ? (selected?.perks as string[]).join(", ") : ""}
                  placeholder="Priority support, lower fees, exclusive desk"
                />
              </div>
              <div className="rounded-3xl border border-line bg-white/5 p-4 md:col-span-2">
                <div className="flex flex-wrap gap-5">
                  <label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" name="isDefault" defaultChecked={selected?.isDefault ?? false} /> Default tier</label>
                  <label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" name="isActive" defaultChecked={selected?.isActive ?? true} /> Active</label>
                </div>
              </div>
              <div className="md:col-span-2">
                <SubmitButton label={selected ? "Update tier" : "Create tier"} pendingLabel="Saving..." className="w-full" />
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Tier catalogue</p>
              <h2 className="mt-2 font-display text-2xl font-black text-text">Configured tiers</h2>
            </div>
            <div className="space-y-3">
              {tiers.map((tier) => (
                <div key={tier.id} className="rounded-3xl border border-line bg-white/5 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="h-4 w-4 rounded-full" style={{ backgroundColor: tier.colorHex }} />
                        <p className="font-display text-xl font-black text-text">{tier.name}</p>
                        {tier.isDefault ? <Badge tone="blue">DEFAULT</Badge> : null}
                        <Badge tone={tier.isActive ? "green" : "red"}>{tier.isActive ? "ACTIVE" : "DISABLED"}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted">{tier.description ?? "No description provided."}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/loyalty?edit=${tier.id}`} className="rounded-full border border-line px-3 py-2 text-sm text-text transition hover:bg-white/10">
                        Edit
                      </Link>
                      <form action={deleteLoyaltyTierAction}>
                        <input type="hidden" name="id" value={tier.id} />
                        <SubmitButton label="Delete" pendingLabel="Deleting..." variant="danger" size="sm" />
                      </form>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm">
                    <div className="rounded-2xl border border-line bg-black/10 p-3 text-muted">
                      <p className="text-xs uppercase tracking-[0.16em]">Threshold</p>
                      <p className="mt-2 font-semibold text-text">{tier.thresholdPoints.toLocaleString()} pts</p>
                    </div>
                    <div className="rounded-2xl border border-line bg-black/10 p-3 text-muted">
                      <p className="text-xs uppercase tracking-[0.16em]">Multiplier</p>
                      <p className="mt-2 font-semibold text-text">x{toNumber(tier.bonusMultiplier)}</p>
                    </div>
                    <div className="rounded-2xl border border-line bg-black/10 p-3 text-muted">
                      <p className="text-xs uppercase tracking-[0.16em]">Updated</p>
                      <p className="mt-2 font-semibold text-text">{formatDate(tier.updatedAt)}</p>
                    </div>
                  </div>

                  {Array.isArray(tier.perks) && (tier.perks as string[]).length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(tier.perks as string[]).map((perk) => (
                        <Badge key={perk} tone="slate">{perk}</Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted">Recent point activity</p>
                <h2 className="mt-2 font-display text-2xl font-black text-text">History</h2>
              </div>
              <div className="space-y-3">
                {recentHistory.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-line bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-text">{entry.user.email}</p>
                      <Badge tone={entry.points >= 0 ? "green" : "red"}>{entry.points >= 0 ? `+${entry.points}` : entry.points} pts</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted">{entry.type} • balance after {entry.balanceAfter.toLocaleString()}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted">{formatDate(entry.createdAt)}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted">Top users</p>
                <h2 className="mt-2 font-display text-2xl font-black text-text">Leaderboard</h2>
              </div>
              <div className="space-y-3">
                {topUsers.map((user) => (
                  <div key={user.id} className="rounded-2xl border border-line bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-text">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-muted">{user.email}</p>
                      </div>
                      <Badge tone="blue">{user.loyaltyPoints.toLocaleString()} pts</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted">
                      <span>{user.loyaltyTier?.name ?? "No tier"}</span>
                      <Link href={`/admin/users/${user.id}`} className="font-semibold text-[var(--brand-secondary)] hover:underline">
                        Adjust user
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
