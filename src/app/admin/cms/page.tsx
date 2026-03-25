import { deleteFaqAction, updateAnnouncementAction, updateContactContentAction, updateFinalCtaAction, updateFooterContentAction, updateHeroContentAction, updateSocialLinksAction, updateTrustContentAction, upsertFaqAction } from "@/actions/admin";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { getAnnouncementContent, getContactContent, getFinalCtaContent, getFooterContent, getHeroContent, getSocialLinks, getTrustContent } from "@/lib/cms";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function AdminCmsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const locale = typeof params.locale === "string" && ["fr", "en"].includes(params.locale) ? (params.locale as "fr" | "en") : "fr";
  const editFaqId = typeof params.editFaq === "string" ? params.editFaq : undefined;

  const [hero, trust, finalCta, contact, footer, socials, announcement, faqs] = await Promise.all([
    getHeroContent(locale),
    getTrustContent(locale),
    getFinalCtaContent(locale),
    getContactContent(),
    getFooterContent(),
    getSocialLinks(),
    getAnnouncementContent(),
    prisma.faqItem.findMany({
      where: { locale },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    })
  ]);

  const selectedFaq = faqs.find((faq) => faq.id === editFaqId) ?? null;

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Homepage & site content</p>
            <h2 className="mt-2 font-display text-2xl font-black text-text">CMS management</h2>
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
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Hero content</p>
            <h2 className="mt-2 font-display text-2xl font-black text-text">Hero section ({locale.toUpperCase()})</h2>
          </div>
          <form action={updateHeroContentAction} className="space-y-4">
            <input type="hidden" name="locale" value={locale} />
            <div>
              <label className="mb-2 block text-sm text-muted">Badge</label>
              <Input name="badge" defaultValue={hero.badge} required />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Title</label>
              <Input name="title" defaultValue={hero.title} required />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Subtitle</label>
              <Textarea name="subtitle" defaultValue={hero.subtitle} className="min-h-[140px]" required />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-muted">Primary CTA</label>
                <Input name="primaryCtaLabel" defaultValue={hero.primaryCtaLabel} required />
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted">Secondary CTA</label>
                <Input name="secondaryCtaLabel" defaultValue={hero.secondaryCtaLabel} required />
              </div>
            </div>
            <SubmitButton label="Update hero" pendingLabel="Saving..." className="w-full" />
          </form>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Trust section</p>
            <h2 className="mt-2 font-display text-2xl font-black text-text">Trust stats & badges ({locale.toUpperCase()})</h2>
          </div>
          <form action={updateTrustContentAction} className="space-y-4">
            <input type="hidden" name="locale" value={locale} />
            {trust.stats.map((stat, index) => (
              <div key={index} className="grid gap-4 md:grid-cols-[1fr,140px]">
                <div>
                  <label className="mb-2 block text-sm text-muted">Stat {index + 1} label</label>
                  <Input name={`stat${index + 1}Label`} defaultValue={stat.label} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-muted">Value</label>
                  <Input name={`stat${index + 1}Value`} defaultValue={stat.value} required />
                </div>
              </div>
            ))}
            <div className="grid gap-4 md:grid-cols-3">
              {trust.badges.map((badge, index) => (
                <div key={index}>
                  <label className="mb-2 block text-sm text-muted">Badge {index + 1}</label>
                  <Input name={`badge${index + 1}`} defaultValue={badge} required />
                </div>
              ))}
            </div>
            <SubmitButton label="Update trust section" pendingLabel="Saving..." className="w-full" />
          </form>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Final CTA</p>
            <h2 className="mt-2 font-display text-2xl font-black text-text">Bottom conversion block ({locale.toUpperCase()})</h2>
          </div>
          <form action={updateFinalCtaAction} className="space-y-4">
            <input type="hidden" name="locale" value={locale} />
            <div>
              <label className="mb-2 block text-sm text-muted">Title</label>
              <Input name="title" defaultValue={finalCta.title} required />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Text</label>
              <Textarea name="text" defaultValue={finalCta.text} className="min-h-[120px]" required />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Button label</label>
              <Input name="buttonLabel" defaultValue={finalCta.buttonLabel} required />
            </div>
            <SubmitButton label="Update final CTA" pendingLabel="Saving..." className="w-full" />
          </form>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Global site info</p>
            <h2 className="mt-2 font-display text-2xl font-black text-text">Contact and footer</h2>
          </div>
          <form action={updateContactContentAction} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-muted">Support email</label>
              <Input name="email" defaultValue={contact.email} required />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Support phone</label>
              <Input name="phone" defaultValue={contact.phone} required />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Address</label>
              <Input name="address" defaultValue={contact.address} required />
            </div>
            <SubmitButton label="Update contact info" pendingLabel="Saving..." className="w-full" />
          </form>

          <div className="border-t border-white/10 pt-4" />

          <form action={updateFooterContentAction} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-muted">About text</label>
              <Textarea name="aboutText" defaultValue={footer.aboutText} className="min-h-[140px]" required />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Final note</label>
              <Textarea name="finalNote" defaultValue={footer.finalNote} className="min-h-[90px]" required />
            </div>
            <SubmitButton label="Update footer" pendingLabel="Saving..." className="w-full" />
          </form>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Support & community</p>
            <h2 className="mt-2 font-display text-2xl font-black text-text">Social links and support shortcuts</h2>
          </div>
          <form action={updateSocialLinksAction} className="grid gap-4 md:grid-cols-2">
            <div><label className="mb-2 block text-sm text-muted">Discord</label><Input name="discord" defaultValue={socials.discord ?? ""} placeholder="https://discord.gg/..." /></div>
            <div><label className="mb-2 block text-sm text-muted">Telegram</label><Input name="telegram" defaultValue={socials.telegram ?? ""} placeholder="https://t.me/..." /></div>
            <div><label className="mb-2 block text-sm text-muted">Twitter / X</label><Input name="twitter" defaultValue={socials.twitter ?? ""} placeholder="https://x.com/..." /></div>
            <div><label className="mb-2 block text-sm text-muted">Instagram</label><Input name="instagram" defaultValue={socials.instagram ?? ""} /></div>
            <div><label className="mb-2 block text-sm text-muted">Facebook</label><Input name="facebook" defaultValue={socials.facebook ?? ""} /></div>
            <div><label className="mb-2 block text-sm text-muted">LinkedIn</label><Input name="linkedin" defaultValue={socials.linkedin ?? ""} /></div>
            <div className="md:col-span-2"><label className="mb-2 block text-sm text-muted">YouTube</label><Input name="youtube" defaultValue={socials.youtube ?? ""} /></div>
            <div className="md:col-span-2"><SubmitButton label="Update social links" pendingLabel="Saving..." className="w-full" /></div>
          </form>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Announcements</p>
            <h2 className="mt-2 font-display text-2xl font-black text-text">Global notice / maintenance banner</h2>
          </div>
          <form action={updateAnnouncementAction} className="space-y-4">
            <div className="rounded-3xl border border-line bg-white/5 p-4"><label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" name="active" defaultChecked={announcement.active} /> Banner active</label></div>
            <div>
              <label className="mb-2 block text-sm text-muted">Tone</label>
              <Select name="tone" defaultValue={announcement.tone}>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="maintenance">Maintenance</option>
              </Select>
            </div>
            <div><label className="mb-2 block text-sm text-muted">Banner text</label><Textarea name="text" defaultValue={announcement.text} className="min-h-[120px]" required /></div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="mb-2 block text-sm text-muted">CTA label</label><Input name="ctaLabel" defaultValue={announcement.ctaLabel ?? ""} /></div>
              <div><label className="mb-2 block text-sm text-muted">CTA URL</label><Input name="ctaUrl" defaultValue={announcement.ctaUrl ?? ""} /></div>
            </div>
            <SubmitButton label="Update announcement" pendingLabel="Saving..." className="w-full" />
          </form>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted">FAQ editor</p>
              <h2 className="mt-2 font-display text-2xl font-black text-text">{selectedFaq ? "Edit FAQ item" : `Create FAQ item (${locale.toUpperCase()})`}</h2>
            </div>
            {selectedFaq ? (
              <Link href={`/admin/cms?locale=${locale}`} className="text-sm font-semibold text-[var(--brand-secondary)] hover:underline">
                Clear selection
              </Link>
            ) : null}
          </div>
          <form action={upsertFaqAction} className="space-y-4">
            {selectedFaq ? <input type="hidden" name="id" value={selectedFaq.id} /> : null}
            <input type="hidden" name="locale" value={locale} />
            <div>
              <label className="mb-2 block text-sm text-muted">Question</label>
              <Input name="question" defaultValue={selectedFaq?.question ?? ""} required />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted">Answer</label>
              <Textarea name="answer" defaultValue={selectedFaq?.answer ?? ""} className="min-h-[180px]" required />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-muted">Category</label>
                <Input name="category" defaultValue={selectedFaq?.category ?? ""} />
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted">Sort order</label>
                <Input name="sortOrder" type="number" min="0" step="1" defaultValue={selectedFaq?.sortOrder ?? faqs.length} required />
              </div>
            </div>
            <div className="rounded-3xl border border-line bg-white/5 p-4">
              <label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" name="active" defaultChecked={selectedFaq?.active ?? true} /> Visible on homepage</label>
            </div>
            <SubmitButton label={selectedFaq ? "Update FAQ" : "Create FAQ"} pendingLabel="Saving..." className="w-full" />
          </form>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Current FAQ list</p>
            <h2 className="mt-2 font-display text-2xl font-black text-text">FAQ items ({locale.toUpperCase()})</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className="rounded-3xl border border-line bg-white/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-text">{faq.question}</p>
                    <p className="mt-2 text-sm text-muted">{faq.category ?? "General"} • {faq.active ? "Visible" : "Hidden"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/cms?locale=${locale}&editFaq=${faq.id}`} className="rounded-full border border-line px-3 py-2 text-sm text-text transition hover:bg-white/10">
                      Edit
                    </Link>
                    <form action={deleteFaqAction}>
                      <input type="hidden" name="id" value={faq.id} />
                      <input type="hidden" name="locale" value={locale} />
                      <SubmitButton label="Delete" pendingLabel="Deleting..." variant="danger" size="sm" />
                    </form>
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted">{faq.answer}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted">Updated {formatDate(faq.updatedAt)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
