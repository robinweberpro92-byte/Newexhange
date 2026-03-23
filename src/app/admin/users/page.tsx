import Link from "next/link";
import { changeUserRoleAction, toggleUserActiveAction } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { getAdminUsersData } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const role = typeof params.role === "string" ? params.role : "";
  const active = typeof params.active === "string" ? params.active : "";
  const kyc = typeof params.kyc === "string" ? params.kyc : "";
  const users = await getAdminUsersData({ q, role, active, kyc });

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <form className="grid gap-4 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-muted">Search</label>
            <Input name="q" defaultValue={q} placeholder="email or name" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Role</label>
            <Select name="role" defaultValue={role}>
              <option value="">All</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Active</label>
            <Select name="active" defaultValue={active}>
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">KYC</label>
            <Select name="kyc" defaultValue={kyc}>
              <option value="">All</option>
              <option value="NOT_SUBMITTED">Not submitted</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </Select>
          </div>
          <div className="md:col-span-5">
            <button type="submit" className="h-11 rounded-2xl border border-line bg-white/5 px-4 font-medium text-text hover:bg-white/10">Filter users</button>
          </div>
        </form>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Users management</p>
          <h2 className="mt-2 font-display text-2xl font-black text-text">Accounts</h2>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Active</th>
                <th>KYC</th>
                <th>Points</th>
                <th>Tier</th>
                <th>Stats</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <Link href={`/admin/users/${user.id}`} className="font-semibold text-text hover:underline">
                      {user.firstName} {user.lastName}
                    </Link>
                    <div className="text-sm text-muted">{user.email}</div>
                  </td>
                  <td>{user.role}</td>
                  <td>
                    <Badge tone={user.isActive ? "green" : "red"}>{user.isActive ? "Active" : "Suspended"}</Badge>
                  </td>
                  <td>{user.kycStatus}</td>
                  <td>{user.loyaltyPoints}</td>
                  <td>{user.loyaltyTier?.name ?? "—"}</td>
                  <td>{user._count.transactions} tx • {user._count.tickets} tickets</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td className="space-y-2">
                    <form action={toggleUserActiveAction} className="flex gap-2">
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="role" value={user.role} />
                      <input type="hidden" name="isActive" value={String(!user.isActive)} />
                      <SubmitButton label={user.isActive ? "Suspend" : "Reactivate"} pendingLabel="Saving..." variant="secondary" size="sm" />
                    </form>
                    <form action={changeUserRoleAction} className="flex gap-2">
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="role" value={user.role === "ADMIN" ? "USER" : "ADMIN"} />
                      <SubmitButton label={user.role === "ADMIN" ? "Make user" : "Make admin"} pendingLabel="Saving..." size="sm" />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
