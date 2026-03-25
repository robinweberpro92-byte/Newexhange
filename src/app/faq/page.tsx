import { prisma } from "@/lib/prisma";
import { withFallback } from "@/lib/data-access";

type FaqItem = {
  id: string;
  category: string | null;
  question: string;
  answer: string;
};

export default async function FaqPage() {
  const dbFaqs = await withFallback(
    () => prisma.faqItem.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" }
    }),
    [] as any[],
    "faq list"
  );

  const fallbackFaqs: FaqItem[] = [
    {
      id: "1",
      category: "General",
      question: "How does it work?",
      answer: "You submit your order and follow the instructions."
    },
    {
      id: "2",
      category: "Payments",
      question: "What payment methods are supported?",
      answer: "We support PayPal, crypto and more."
    }
  ];

  // ✅ IMPORTANT : NORMALISATION
  const effectiveFaqs: FaqItem[] = dbFaqs.length
    ? dbFaqs.map((faq) => ({
        id: faq.id,
        category: faq.category,
        question: faq.question,
        answer: faq.answer
      }))
    : fallbackFaqs;

  const grouped = new Map<string, FaqItem[]>();

  for (const faq of effectiveFaqs) {
    const key = faq.category || "General";
    const current = grouped.get(key) || [];
    grouped.set(key, [...current, faq]);
  }

  return (
    <section className="container-app py-16">
      <h1 className="text-4xl font-bold mb-8">FAQ</h1>

      {[...grouped.entries()].map(([category, faqs]) => (
        <div key={category} className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">{category}</h2>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="p-4 border rounded-xl">
                <p className="font-semibold">{faq.question}</p>
                <p className="text-sm text-muted mt-2">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}