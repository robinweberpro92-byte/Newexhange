import { DashboardShell } from "@/components/app/dashboard-shell";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();

  return (
    <DashboardShell
      title="User dashboard"
      subtitle="Track transactions, KYC, loyalty and support from one premium workspace."
      userName={`${user.firstName} ${user.lastName}`}
      userEmail={user.email}
      tier={user.loyaltyTier?.name}
    >
      {children}
    </DashboardShell>
  );
}
