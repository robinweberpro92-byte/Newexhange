import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getContactContent, getSocialLinks } from "@/lib/cms";

export default async function SupportCenterPage() {
  const [contact, socials] = await Promise.all([getContactContent(), getSocialLinks()]);

  const socialEntries = [
    ["Discord", socials.discord],
    ["Telegram", socials.telegram],
    ["Twitter/X", socials.twitter],
    ["LinkedIn", socials.linkedin]
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <section className="container-app py-16 md:py-20">
      <div className="max-w-3xl space-y-4">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">Support</p>
        <h1 className="font-display text-4xl font-black text-text md:text-5xl">Get help with manual orders, delays, and verification</h1>
        <p className="text-lg leading-8 text-muted">Use the support center whenever an order is under review, a proof needs clarification, or you want a human update.</p>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr,0.8fr]">
        <Card className="space-y-4 p-6">
          <h2 className="font-display text-2xl font-black text-text">What to include in your ticket</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-muted">
            <li>Your order reference or transaction ID</li>
            <li>The selected payment method</li>
            <li>The amount sent and the target asset</li>
            <li>Any proof or screenshot if the method requires manual confirmation</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/support"><Button size="lg">Open a ticket</Button></Link>
            <Link href="/faq"><Button variant="secondary" size="lg">Browse FAQ</Button></Link>
          </div>
        </Card>
        <Card className="space-y-3 p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Contact channels</p>
          <p className="text-sm text-text">{contact.email}</p>
          <p className="text-sm text-text">{contact.phone}</p>
          <p className="text-sm text-muted">{contact.address}</p>
          <div className="space-y-2 pt-2">
            {socialEntries.map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noreferrer" className="block text-sm font-semibold text-[var(--brand-secondary)] hover:underline">{label}</a>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
