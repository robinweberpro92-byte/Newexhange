"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  title: string;
  subtitle?: string;
  adminName: string;
  adminEmail: string;
  children: React.ReactNode;
};

const items = [
  { href: "/admin/overview", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/transactions", label: "Transactions" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/loyalty", label: "Loyalty" },
  { href: "/admin/support", label: "Support" },
  { href: "/admin/cms", label: "CMS" },
  { href: "/admin/branding", label: "Branding" },
  { href: "/admin/translations", label: "Translations" }
];

export function AdminShell({ title, subtitle, adminName, adminEmail, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="container-app grid gap-6 py-10 lg:grid-cols-[280px,1fr]">
      <aside className="space-y-4">
        <Card className="space-y-3">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Back-office</p>
          <div>
            <p className="font-display text-xl font-bold text-text">{adminName}</p>
            <p className="text-sm text-muted">{adminEmail}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white/5 px-4 py-3 text-sm text-muted">
            You are managing users, payments, loyalty, reviews, support and branding.
          </div>
        </Card>
        <Card className="space-y-2 p-3">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-2xl px-4 py-3 text-sm font-medium transition",
                  active ? "bg-white/10 text-text" : "text-muted hover:bg-white/5 hover:text-text"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </Card>
      </aside>
      <section className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-text md:text-4xl">{title}</h1>
          {subtitle ? <p className="mt-2 text-base text-muted">{subtitle}</p> : null}
        </div>
        {children}
      </section>
    </div>
  );
}
