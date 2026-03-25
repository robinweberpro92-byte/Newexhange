import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDictionary, getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { withFallback } from "@/lib/data-access";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const faqs = (await withFallback(
    () =>
      prisma.faqItem.findMany({
        where: { locale, active: true },
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }]
      }),
    [],
    "faq page"
  )) || [];

  const effectiveFaqs = faqs.length ? faqs : [
    { id: "faq-1", category: "Getting started", question: "How do manual orders work?", answer: "Create an order, follow the payment instructions, submit the reference or proof, then wait for admin review and payout." },
    { id: "faq-2", category: "Payments", question: "Which payment methods are supported?", answer: "The admin can enable PayPal, bank transfer, card, BTC, LTC, ETH, USDT, Paysafecard and more from the back office." },
    { id: "faq-3", category: "Security", question: "Why is my order pending review?", answer: "Some payment rails require a human verification step before the payout can be executed safely." }
  ];

  const grouped = new Map<string, typeof effectiveFaqs>();
  for (const faq of effectiveFaqs) {
    const key = faq.category || "General";
    grouped.set(key, [...(grouped.get(key) || []), faq]);
  }

  return (
    <section className="container-app py-16 md:py-20">
      <div className="max-w-4xl space-y-4">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">Help center</p>
        <h1 className="font-display text-4xl font-black text-text md:text-5xl">{dictionary.common.faq}</h1>
        <p className="text-lg leading-8 text-muted">
          Browse the most important answers before opening a ticket. We grouped the topics that matter most: getting started, payments, security,
          KYC and delays.
        </p>
      </div>
      <div className="mt-10 grid gap-6 xl:grid-cols-[220px,1fr]">
        <Card className="h-max space-y-3 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Categories</p>
          {Array.from(grouped.keys()).map((category) => (
            <a key={category} href={`#${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="block rounded-2xl px-4 py-3 text-sm text-muted transition hover:bg-white/5 hover:text-text">
              {category}
            </a>
          ))}
        </Card>
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([category, items]) => (
            <div key={category} id={category.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="space-y-4">
              <h2 className="font-display text-2xl font-black text-text">{category}</h2>
              {items.map((faq) => (
                <Card key={faq.id} className="p-0">
                  <details className="group rounded-[1.5rem] p-5">
                    <summary className="flex items-center justify-between gap-4 text-lg font-semibold text-text">
                      <span>{faq.question}</span>
                      <span className="text-muted transition group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-muted">{faq.answer}</p>
                  </details>
                </Card>
              ))}
            </div>
          ))}

          <Card className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-display text-2xl font-black text-text">Still need help?</h3>
              <p className="mt-2 text-sm text-muted">If your payment is pending or a manual order needs review, contact support and include your order reference.</p>
            </div>
            <Link href="/support">
              <Button size="lg">Open the support center</Button>
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
}
