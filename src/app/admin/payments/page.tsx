import Link from "next/link";
import { deletePaymentMethodAction, upsertPaymentMethodAction } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma";
import { formatDate, toNumber } from "@/lib/utils";

export default async function AdminPaymentsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const editId = typeof params.edit === "string" ? params.edit : undefined;

  const paymentMethods = await prisma.paymentMethod.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });

  const activeCount = paymentMethods.filter((method) => method.active).length;
  const recommendedCount = paymentMethods.filter((method) => method.recommended).length;
  const maintenanceCount = paymentMethods.filter((method) => method.maintenanceMode).length;
  const selected = paymentMethods.find((method) => method.id === editId) ?? null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Live methods</p>
          <p className="mt-3 font-display text-3xl font-black text-text">{activeCount}</p>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Recommended</p>
          <p className="mt-3 font-display text-3xl font-black text-text">{recommendedCount}</p>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Maintenance</p>
          <p className="mt-3 font-display text-3xl font-black text-text">{maintenanceCount}</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card className="space-y-4">
          <form action={upsertPaymentMethodAction} className="grid gap-4 md:grid-cols-2">

            {selected && <input type="hidden" name="id" value={selected.id} />}

            <Input name="name" defaultValue={selected?.name ?? ""} required />
            <Input name="slug" defaultValue={selected?.slug ?? ""} />

            <Textarea
              name="description"
              defaultValue={selected?.description ?? ""}
            />

            {/* 🔥 FIX ICI */}
            <Textarea
              name="messageTemplatesRaw"
              defaultValue={
                Array.isArray(selected?.messageTemplates)
                  ? selected.messageTemplates.join("\n")
                  : ""
              }
              className="min-h-[140px]"
              placeholder={"Template 1\nTemplate 2\nTemplate 3"}
            />

            <SubmitButton label="Save" pendingLabel="Saving..." />

          </form>
        </Card>

        <Card>
          {paymentMethods.map((method) => (
            <div key={method.id}>
              <p>{method.name}</p>
              <p>{formatDate(method.updatedAt)}</p>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}