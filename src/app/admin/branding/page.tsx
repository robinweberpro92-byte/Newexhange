import { updateBrandingAction } from "@/actions/admin";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { getBrandSettings } from "@/lib/branding";

export default async function AdminBrandingPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const updated = params.updated === "1";
  const brand = await getBrandSettings();

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr,0.9fr]">
      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Brand control center</p>
          <h2 className="mt-2 font-display text-2xl font-black text-text">Global branding settings</h2>
        </div>

        {updated ? (
          <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Branding updated successfully across public pages and dashboards.
          </p>
        ) : null}

        <form action={updateBrandingAction} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-muted">Brand name</label>
            <Input name="brandName" defaultValue={brand.brandName} required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Short name</label>
            <Input name="shortName" defaultValue={brand.shortName} required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-muted">Legal name</label>
            <Input name="legalName" defaultValue={brand.legalName} required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-muted">Tagline</label>
            <Input name="tagline" defaultValue={brand.tagline} required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Support email</label>
            <Input name="supportEmail" defaultValue={brand.supportEmail} required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Support phone</label>
            <Input name="supportPhone" defaultValue={brand.supportPhone ?? ""} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Primary color</label>
            <Input name="primaryColor" defaultValue={brand.primaryColor} required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Secondary color</label>
            <Input name="secondaryColor" defaultValue={brand.secondaryColor} required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Accent color</label>
            <Input name="accentColor" defaultValue={brand.accentColor} required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Logo text</label>
            <Input name="logoText" defaultValue={brand.logoText} required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-muted">Favicon URL</label>
            <Input name="faviconUrl" defaultValue={brand.faviconUrl ?? ""} placeholder="https://..." />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-muted">Meta title</label>
            <Input name="metaTitle" defaultValue={brand.metaTitle} required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-muted">Meta description</label>
            <Textarea name="metaDescription" defaultValue={brand.metaDescription} className="min-h-[120px]" required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-muted">Footer text</label>
            <Textarea name="footerText" defaultValue={brand.footerText} className="min-h-[90px]" required />
          </div>
          <div className="md:col-span-2">
            <SubmitButton label="Update branding" pendingLabel="Saving..." className="w-full" />
          </div>
        </form>
      </Card>

      <div className="space-y-6">
        <Card className="space-y-4 overflow-hidden">
          <div className="rounded-[1.75rem] border border-line bg-[linear-gradient(135deg,rgba(22,196,127,0.18),rgba(73,162,255,0.12),rgba(246,181,84,0.08))] p-6">
            <div className="flex items-center gap-4">
              <div
                className="grid h-16 w-16 place-items-center rounded-3xl font-display text-xl font-black text-slate-950"
                style={{ background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.secondaryColor})` }}
              >
                {brand.logoText}
              </div>
              <div>
                <p className="font-display text-3xl font-black text-text">{brand.brandName}</p>
                <p className="mt-2 text-sm text-muted">{brand.tagline}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-muted">
                <p className="text-xs uppercase tracking-[0.16em]">Primary</p>
                <p className="mt-2 font-semibold text-text">{brand.primaryColor}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-muted">
                <p className="text-xs uppercase tracking-[0.16em]">Secondary</p>
                <p className="mt-2 font-semibold text-text">{brand.secondaryColor}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-muted">
                <p className="text-xs uppercase tracking-[0.16em]">Accent</p>
                <p className="mt-2 font-semibold text-text">{brand.accentColor}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Where it propagates</p>
            <h2 className="mt-2 font-display text-2xl font-black text-text">Brand surfaces</h2>
          </div>
          <div className="space-y-3 text-sm text-muted">
            <div className="rounded-2xl border border-line bg-white/5 p-4">Header, footer and public marketing pages inherit the latest brand name and logo text.</div>
            <div className="rounded-2xl border border-line bg-white/5 p-4">Metadata, auth pages and dashboard chrome reuse the same title, tagline and core colors.</div>
            <div className="rounded-2xl border border-line bg-white/5 p-4">Future emails and support workflows can consume the same BrandSetting model without duplicating configuration.</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
