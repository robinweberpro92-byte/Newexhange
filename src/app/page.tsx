import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/app/section-heading";
import { StatCard } from "@/components/app/stat-card";
import { getDictionary, getLocale } from "@/lib/i18n";
import { getMarketingData } from "@/lib/queries";

export default async function HomePage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const { hero, trust, finalCta, paymentMethods, tiers, reviews, faqs } = await getMarketingData(locale);

  return (
    <div className="pb-16">
      <section className="overflow-hidden pt-10 md:pt-16">
        <div className="container-app grid gap-10 md:grid-cols-[1.15fr,0.85fr] md:items-center">
          <div className="space-y-6">
            <Badge tone="green">{hero.badge}</Badge>
            <div className="space-y-4">
              <h1 className="max-w-4xl font-display text-4xl font-black leading-[1.02] tracking-tight text-text md:text-6xl">
                {hero.title}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted">{hero.subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg">
                  {hero.primaryCtaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#payments">
                <Button variant="secondary" size="lg">
                  {hero.secondaryCtaLabel}
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {trust.badges.map((item) => (
                <div key={item} className="inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-4 py-2 text-sm text-muted">
                  <CheckCircle2 className="h-4 w-4 text-[var(--brand-primary)]" />
                  {item}
                </div>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {trust.stats.map((stat) => (
                <StatCard key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </div>
          </div>

          <Card className="relative overflow-hidden p-6">
            <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(22,196,127,0.2),transparent_60%)]" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-3xl border border-line bg-white/5 p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">User dashboard</p>
                  <p className="mt-2 font-display text-2xl font-black">Wallet + Loyalty + Support</p>
                </div>
                <WalletCards className="h-10 w-10 text-[var(--brand-secondary)]" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">Payments</p>
                  <div className="mt-3 space-y-3">
                    {paymentMethods.slice(0, 3).map((method) => (
                      <div key={method.id} className="rounded-2xl border border-line bg-white/5 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-text">{method.name}</p>
                          <Badge tone={method.recommended ? "green" : "blue"}>{method.recommended ? "Recommended" : "Active"}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted">{method.trustMessage ?? method.description}</p>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">Admin control</p>
                  <div className="mt-3 space-y-3 text-sm text-muted">
                    <div className="rounded-2xl border border-line bg-white/5 p-3">Payments ordering, maintenance mode and fee configuration.</div>
                    <div className="rounded-2xl border border-line bg-white/5 p-3">Review moderation, translation overrides and branding.</div>
                    <div className="rounded-2xl border border-line bg-white/5 p-3">KYC review, ticket prioritization and admin logs.</div>
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section id="payments" className="container-app py-20">
        <SectionHeading title={dictionary.marketing.paymentsTitle} description={dictionary.marketing.paymentsText} />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {paymentMethods.map((method) => (
            <Card key={method.id} className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-bold text-text">{method.name}</h3>
                  <p className="mt-2 text-sm text-muted">{method.description}</p>
                </div>
                <Badge tone={method.maintenanceMode ? "amber" : method.active ? "green" : "red"}>
                  {method.maintenanceMode ? "Maintenance" : method.active ? "Live" : "Disabled"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-line bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">Fee</p>
                  <p className="mt-2 font-semibold text-text">{Number(method.feePercent)}% + {Number(method.feeFixed)}€</p>
                </div>
                <div className="rounded-2xl border border-line bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">Delay</p>
                  <p className="mt-2 font-semibold text-text">{method.estimatedDelay ?? "N/A"}</p>
                </div>
              </div>
              <p className="text-sm text-muted">{method.trustMessage ?? method.unavailableMessage ?? "Configured from admin."}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="loyalty" className="border-y border-white/10 bg-white/[0.015] py-20">
        <div className="container-app">
          <SectionHeading title={dictionary.marketing.loyaltyTitle} description={dictionary.marketing.loyaltyText} />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {tiers.map((tier) => (
              <Card key={tier.id} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-2xl font-black text-text">{tier.name}</h3>
                  <span className="h-4 w-4 rounded-full" style={{ backgroundColor: tier.colorHex }} />
                </div>
                <p className="text-sm text-muted">{tier.description}</p>
                <div className="rounded-2xl border border-line bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">Threshold</p>
                  <p className="mt-2 font-display text-3xl font-black text-text">{tier.thresholdPoints.toLocaleString()} pts</p>
                </div>
                <div className="space-y-2 text-sm text-muted">
                  {(Array.isArray(tier.perks) ? (tier.perks as string[]) : []).map((perk) => (
                    <div key={perk} className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[var(--brand-primary)]" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="container-app py-20">
        <SectionHeading title={dictionary.marketing.reviewsTitle} description={dictionary.marketing.reviewsText} />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {reviews.map((review) => (
            <Card key={review.id} className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-display text-xl font-bold text-text">{review.authorName}</p>
                  <p className="text-sm text-muted">{review.country}</p>
                </div>
                <Badge tone={review.verifiedBadge ? "green" : "slate"}>{review.verifiedBadge ? "Verified" : `${review.rating}/5`}</Badge>
              </div>
              <p className="leading-7 text-muted">“{review.text}”</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="faq" className="border-y border-white/10 bg-white/[0.015] py-20">
        <div className="container-app">
          <SectionHeading title={dictionary.marketing.faqTitle} description={dictionary.marketing.faqText} />
          <div className="mt-8 grid gap-4">
            {faqs.map((faq) => (
              <Card key={faq.id} className="p-0">
                <details className="group rounded-[1.5rem] p-5">
                  <summary className="flex items-center justify-between gap-4 text-lg font-semibold text-text">
                    <span>{faq.question}</span>
                    <span className="text-muted transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 max-w-4xl text-base leading-7 text-muted">{faq.answer}</p>
                </details>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container-app py-20">
        <Card className="overflow-hidden p-8 md:p-10">
          <div className="grid gap-6 md:grid-cols-[1fr,auto] md:items-center">
            <div className="space-y-4">
              <Badge tone="blue">YasarPack</Badge>
              <h2 className="font-display text-3xl font-black text-text md:text-5xl">{finalCta.title}</h2>
              <p className="max-w-2xl text-lg leading-8 text-muted">{finalCta.text}</p>
            </div>
            <Link href="/register">
              <Button size="lg">{finalCta.buttonLabel}</Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
