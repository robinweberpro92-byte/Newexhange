import Link from "next/link";
import { deleteTranslationAction, upsertTranslationAction } from "@/actions/admin";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminTranslationsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const locale = typeof params.locale === "string" && ["fr", "en"].includes(params.locale) ? params.locale : "fr";
  const editId = typeof params.edit === "string" ? params.edit : undefined;

  const translations = await prisma.translation.findMany({
    where: { locale },
    orderBy: [{ namespace: "asc" }, { key: "asc" }]
  });

  const selected = translations.find((translation) => translation.id === editId) ?? null;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Dictionary overrides</p>
            <h2 className="mt-2 font-display text-2xl font-black text-text">{selected ? "Edit translation" : "Create translation override"}</h2>
          </div>
          <form>
            <label className="mb-2 block text-sm text-muted">Locale</label>
            <div className="flex gap-2">
              <Select name="locale" defaultValue={locale}>
                <option value="fr">French</option>
                <option value="en">English</option>
              </Select>
              <button type="submit" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-text transition hover:bg-white/10">
                Switch
              </button>
            </div>
          </form>
        </div>

        <form action={upsertTranslationAction} className="space-y-4">
          {selected ? <input type="hidden" name="id" value={selected.id} /> : null}
          <input type="hidden" name="locale" value={locale} />
          <div>
            <label className="mb-2 block text-sm text-muted">Namespace</label>
            <Input name="namespace" defaultValue={selected?.namespace ?? "common"} required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Key</label>
            <Input name="key" defaultValue={selected?.key ?? ""} required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Value</label>
            <Textarea name="value" defaultValue={selected?.value ?? ""} className="min-h-[180px]" required />
          </div>
          <SubmitButton label={selected ? "Update translation" : "Save translation"} pendingLabel="Saving..." className="w-full" />
          {selected ? (
            <Link href={`/admin/translations?locale=${locale}`} className="block text-center text-sm font-semibold text-[var(--brand-secondary)] hover:underline">
              Clear selection
            </Link>
          ) : null}
        </form>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Locale catalogue</p>
          <h2 className="mt-2 font-display text-2xl font-black text-text">Translation overrides ({locale.toUpperCase()})</h2>
        </div>
        <div className="space-y-3">
          {translations.map((translation) => (
            <div key={translation.id} className="rounded-3xl border border-line bg-white/5 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-text">{translation.namespace}.{translation.key}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted">{translation.value}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/translations?locale=${locale}&edit=${translation.id}`} className="rounded-full border border-line px-3 py-2 text-sm text-text transition hover:bg-white/10">
                    Edit
                  </Link>
                  <form action={deleteTranslationAction}>
                    <input type="hidden" name="id" value={translation.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <SubmitButton label="Delete" pendingLabel="Deleting..." variant="danger" size="sm" />
                  </form>
                </div>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted">Updated {formatDate(translation.updatedAt)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
