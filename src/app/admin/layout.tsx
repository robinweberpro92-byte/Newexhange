import { AdminShell } from "@/components/app/admin-shell";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin();

  return (
    <AdminShell
      title="Admin dashboard"
      subtitle="Operate users, transactions, loyalty, support, branding and multilingual content from one back-office."
      adminName={`${admin.firstName} ${admin.lastName}`}
      adminEmail={admin.email}
    >
      {children}
    </AdminShell>
  );
}
