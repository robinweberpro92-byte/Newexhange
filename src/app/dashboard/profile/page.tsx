import { changePasswordAction, updateProfileAction } from "@/actions/user";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireUser } from "@/lib/auth";

export default async function DashboardProfilePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser();
  const params = await searchParams;
  const notifications = (user.notificationPreferences as { marketing?: boolean; ticketEmails?: boolean; securityEmails?: boolean } | null) ?? {};

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Personal profile</p>
          <h2 className="mt-2 font-display text-2xl font-black text-text">User information</h2>
        </div>

        {params.updated === "1" ? (
          <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">Profile updated successfully.</p>
        ) : null}

        <form action={updateProfileAction} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-muted">First name</label>
            <Input name="firstName" defaultValue={user.firstName} required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Last name</label>
            <Input name="lastName" defaultValue={user.lastName} required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-muted">Email</label>
            <Input defaultValue={user.email} disabled />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Phone</label>
            <Input name="phone" defaultValue={user.phone ?? ""} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Country</label>
            <Input name="country" defaultValue={user.country ?? ""} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Language</label>
            <Select name="language" defaultValue={user.language}>
              <option value="fr">French</option>
              <option value="en">English</option>
            </Select>
          </div>
          <div className="space-y-3 rounded-2xl border border-line bg-white/5 p-4 md:col-span-2">
            <label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" name="marketingEmails" defaultChecked={Boolean(notifications.marketing)} /> Marketing emails</label>
            <label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" name="ticketEmails" defaultChecked={notifications.ticketEmails ?? true} /> Ticket updates</label>
            <label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" name="securityEmails" defaultChecked={notifications.securityEmails ?? true} /> Security alerts</label>
          </div>
          <div className="md:col-span-2">
            <SubmitButton label="Save profile" pendingLabel="Saving..." className="w-full" />
          </div>
        </form>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Security</p>
          <h2 className="mt-2 font-display text-2xl font-black text-text">Password and future 2FA</h2>
        </div>

        {params.passwordUpdated === "1" ? (
          <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">Password changed successfully.</p>
        ) : null}
        {params.passwordError === "1" ? (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">Current password is incorrect.</p>
        ) : null}

        <div className="rounded-2xl border border-line bg-white/5 p-4 text-sm text-muted">
          2FA is not enabled yet. The schema already includes `twoFactorEnabled` and `twoFactorSecret` for a future rollout.
        </div>

        <form action={changePasswordAction} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-muted">Current password</label>
            <Input type="password" name="currentPassword" required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">New password</label>
            <Input type="password" name="newPassword" required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Confirm new password</label>
            <Input type="password" name="confirmPassword" required />
          </div>
          <SubmitButton label="Change password" pendingLabel="Updating..." className="w-full" />
        </form>
      </Card>
    </div>
  );
}
