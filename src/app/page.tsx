import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bitcoin,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Headset,
  LockKeyhole,
  ShieldCheck,
  Star,
  WalletCards
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/app/section-heading";
import { StatCard } from "@/components/app/stat-card";
import { getDictionary, getLocale } from "@/lib/i18n";
import { getMarketingData } from "@/lib/queries";

const exchangeSteps = [
  {
    title: "Creer un compte",
    text: "Email, mot de passe, puis profil/KYC seulement si l'operation l'exige."
  },
  {
    title: "Choisir votre pair",
    text: "BTC, LTC, ETH, USDT et autres rails configures avec frais et delai affiches."
  },
  {
    title: "Selectionner le moyen de paiement",
    text: "PayPal, carte, virement ou rail crypto selon votre pays et votre objectif."
  },
  {
    title: "Confirmer et suivre",
    text: "Statut, reference transaction, support et historique restent visibles dans le dashboard."
  }
];

const exchangeMethods = [
  { name: "PayPal", eta: "Instant a 15 min", fee: "A partir de 1.9%", icon: CircleDollarSign },
  { name: "Bitcoin", eta: "10 a 30 min", fee: "Variable reseau", icon: Bitcoin },
  { name: "Litecoin", eta: "5 a 15 min", fee: "Faible reseau", icon: BadgeCheck },
  { name: "Carte bancaire", eta: "Instant", fee: "A partir de 2.4%", icon: CreditCard },
  { name: "Virement bancaire", eta: "1 a 2 jours ouvres", fee: "Faible cout", icon: Banknote }
];

export default async function HomePage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const { hero, trust, finalCta, paymentMethods, tiers, reviews, faqs } = await getMarketingData(locale);

  const safeHero = {
    ...hero,
    title: hero.title.toLowerCase().includes("base produit") ? "Achetez, vendez et exchangez vos cryptos avec des rails clairs et administrables." : hero.title,
    subtitle: hero.subtitle.toLowerCase().includes("secure reset token") ? "PayPal, LTC, BTC, ETH, USDT, carte et virement : chaque operation affiche ses frais, son delai estime et son niveau de verification." : hero.subtitle,
    primaryCtaLabel: hero.primaryCtaLabel || "Demarrer un exchange",
    secondaryCtaLabel: hero.secondaryCtaLabel || "Voir le fonctionnement"
  };
  const safeFinalCta = {
    ...finalCta,
    title: finalCta.title.toLowerCase().includes("base produit") ? "Lancez votre premier exchange en moins de 5 minutes." : finalCta.title,
    text: finalCta.text.toLowerCase().includes("cms") ? "Inscription rapide, verification progressive, suivi des transactions et support humain pour chaque operation sensible." : finalCta.text,
    buttonLabel: finalCta.buttonLabel.toLowerCase().includes("lancer") ? "Creer un compte gratuitement" : finalCta.buttonLabel
  };

  return (
    <div className="pb-16">
      <section className="overflow-hidden pt-10 md:pt-16">
        <div className="container-app grid gap-10 md:grid-cols-[1.08fr,0.92fr] md:items-center">
          <div className="space-y-6">
            <Badge tone="green">{safeHero.badge}</Badge>
            <div className="space-y-4">
              <h1 className="max-w-4xl font-display text-4xl font-black leading-[1.02] tracking-tight text-text md:text-6xl">
                {safeHero.title}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted">{safeHero.subtitle}</p>
            </div>
            <div className="grid gap-3 rounded-[1.8rem] border border-line bg-white/5 p-4 md:max-w-2xl md:grid-cols-[1.1fr,0.9fr,1fr,auto]" id="exchange">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted">Je veux acheter</p>
                <div className="mt-2 rounded-2xl border border-line bg-white/5 px-4 py-3 text-text">€500 EUR</div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted">Je recois</p>
                <div className="mt-2 rounded-2xl border border-line bg-white/5 px-4 py-3 text-text">≈ 0.0081 BTC</div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted">Moyen prefere</p>
                <div className="mt-2 rounded-2xl border border-line bg-white/5 px-4 py-3 text-text">PayPal</div>
              </div>
              <div className="flex items-end">
                <Link href="/register" className="w-full">
                  <Button className="w-full" size="lg">
                    {safeHero.primaryCtaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="md:col-span-4 grid gap-3 text-sm text-muted md:grid-cols-3">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-line bg-white/5 px-4 py-3"><Clock3 className="h-4 w-4 text-[var(--brand-secondary)]" /> Delai estime : moins de 15 min</div>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-line bg-white/5 px-4 py-3"><WalletCards className="h-4 w-4 text-[var(--brand-primary)]" /> Frais transparents avant validation</div>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-line bg-white/5 px-4 py-3"><ShieldCheck className="h-4 w-4 text-[var(--brand-accent)]" /> KYC seulement quand le montant l'exige</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="#how-it-works">
                <Button variant="secondary" size="lg">
                  {safeHero.secondaryCtaLabel}
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="lg">Acceder a mon espace</Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {trust.badges.map((item) => (
                <div key={item} className="inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-4 py-2 text-sm text-muted">
                  <CheckIcon />
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
            <div className="relative space-y-5">
              <div className="overflow-hidden rounded-[1.8rem] border border-line bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]">
                <Image src="/illustrations/hero-exchange.svg" alt="Apercu premium du dashboard exchange" width={720} height={520} className="h-auto w-full" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">Rails les plus utilises</p>
                  <div className="mt-3 space-y-3">
                    {exchangeMethods.slice(0, 3).map((method) => {
                      const Icon = method.icon;
                      return (
                        <div key={method.name} className="rounded-2xl border border-line bg-white/5 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="inline-flex items-center gap-2 font-semibold text-text"><Icon className="h-4 w-4 text-[var(--brand-secondary)]" /> {method.name}</div>
                            <span className="text-xs text-muted">{method.eta}</span>
                          </div>
                          <p className="mt-2 text-sm text-muted">{method.fee}</p>
                        </div>
                      );
                    })}
                  </div>
                </Card>
                <Card className="p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">Ce que voit l'utilisateur</p>
                  <div className="mt-3 space-y-3 text-sm text-muted">
                    <div className="rounded-2xl border border-line bg-white/5 p-3">Frais, delais, KYC requis et methode recommandee avant toute confirmation.</div>
                    <div className="rounded-2xl border border-line bg-white/5 p-3">Historique des transactions, support et progression de fidelite depuis le dashboard.</div>
                    <div className="rounded-2xl border border-line bg-white/5 p-3">Pages branding, CMS, FAQ, avis et paiements modifiables depuis l'admin.</div>
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section id="how-it-works" className="container-app py-20">
        <SectionHeading title="Comment ca marche" description="Un flow clair pour convertir plus vite, rassurer davantage et laisser l'administration piloter les rails et les contenus." />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {exchangeSteps.map((step, index) => (
            <Card key={step.title} className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 font-display text-xl font-black text-text">0{index + 1}</div>
              <h3 className="font-display text-2xl font-black text-text">{step.title}</h3>
              <p className="text-sm leading-7 text-muted">{step.text}</p>
            </Card>
          ))}
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
        <div className="mt-6 grid gap-4 rounded-[1.8rem] border border-line bg-white/5 p-6 lg:grid-cols-[0.4fr,1fr]">
          <div>
            <p className="font-display text-5xl font-black text-text">4.8/5</p>
            <p className="mt-2 text-sm text-muted">Basé sur les avis affiches, moderes et ordonnes depuis l'administration.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {reviews.map((review) => (
              <Card key={review.id} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-xl font-bold text-text">{review.authorName}</p>
                    <p className="text-sm text-muted">{review.country}</p>
                  </div>
                  <Badge tone={review.verifiedBadge ? "green" : "slate"}>{review.verifiedBadge ? "Verified" : `${review.rating}/5`}</Badge>
                </div>
                <div className="flex items-center gap-1 text-[var(--brand-accent)]">
                  {Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="leading-7 text-muted">“{review.text}”</p>
              </Card>
            ))}
          </div>
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
          <Card className="mt-6 flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-display text-2xl font-black text-text">Une question avant de vous lancer ?</h3>
              <p className="mt-2 text-sm text-muted">Notre support reste disponible pour les montants sensibles, les rails particuliers et les cas KYC.</p>
            </div>
            <Link href="/contact">
              <Button size="lg">Parler au support</Button>
            </Link>
          </Card>
        </div>
      </section>

      <section className="container-app py-20">
        <Card className="overflow-hidden p-8 md:p-10">
          <div className="grid gap-6 md:grid-cols-[1fr,auto] md:items-center">
            <div className="space-y-4">
              <Badge tone="blue">{safeFinalCta.title}</Badge>
              <h2 className="font-display text-3xl font-black text-text md:text-5xl">{safeFinalCta.title}</h2>
              <p className="max-w-2xl text-lg leading-8 text-muted">{safeFinalCta.text}</p>
              <div className="flex flex-wrap gap-3 text-sm text-muted">
                <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-3 py-2"><LockKeyhole className="h-4 w-4 text-[var(--brand-primary)]" /> Pas de frais caches</div>
                <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-3 py-2"><Headset className="h-4 w-4 text-[var(--brand-secondary)]" /> Support humain 24/7</div>
                <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-3 py-2"><ShieldCheck className="h-4 w-4 text-[var(--brand-accent)]" /> Verification progressive</div>
              </div>
            </div>
            <Link href="/register">
              <Button size="lg">{safeFinalCta.buttonLabel}</Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}

function CheckIcon() {
  return <BadgeCheck className="h-4 w-4 text-[var(--brand-primary)]" />;
}
