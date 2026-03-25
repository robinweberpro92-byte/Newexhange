import Link from "next/link";
import { ShieldCheck, WalletCards } from "lucide-react";
import { getBrandSettings } from "@/lib/branding";
import { getContactContent, getFooterContent, getSocialLinks } from "@/lib/cms";
import { prisma } from "@/lib/prisma";
import { withFallback } from "@/lib/data-access";

export async function SiteFooter() {
  const [brand, footer, contact, socials, paymentMethods] = await Promise.all([
    getBrandSettings(),
    getFooterContent(),
    getContactContent(),
    getSocialLinks(),
    withFallback(
      () => prisma.paymentMethod.findMany({
        where: { active: true, displayInFooter: true },
        orderBy: { sortOrder: "asc" }
      }),
      [],
      "footer payment methods"
    )
  ]);

  return (
    <footer id="contact" className="border-t border-white/10 bg-black/10">
      <div className="container-app grid gap-8 py-12 lg:grid-cols-[1.2fr,0.8fr,0.8fr]">
        <div className="space-y-4">
          <div className="font-display text-2xl font-black text-text">{brand.brandName}</div>
          <p className="max-w-2xl text-muted">{footer.aboutText}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-3 py-1.5 text-xs text-muted"><ShieldCheck className="h-3.5 w-3.5 text-[var(--brand-primary)]" /> SSL chiffre</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-3 py-1.5 text-xs text-muted"><WalletCards className="h-3.5 w-3.5 text-[var(--brand-secondary)]" /> KYC progressif</span>
          </div>
          <p className="text-sm text-muted">{brand.footerText}</p>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">{footer.finalNote}</p>
        </div>
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Contact & support</p>
          <p className="text-sm text-text">{contact.email}</p>
          <p className="text-sm text-text">{contact.phone}</p>
          <p className="text-sm text-muted">{contact.address}</p>
          <p className="text-sm text-muted">Reponse support cible : moins de 2 heures sur les tickets critiques.</p>
        </div>
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Platform</p>
          <Link href="/exchange" className="block text-sm text-muted transition hover:text-text">Exchange</Link>
          <Link href="/payment-methods" className="block text-sm text-muted transition hover:text-text">Payment methods</Link>
          <Link href="/reviews" className="block text-sm text-muted transition hover:text-text">Reviews</Link>
          <Link href="/faq" className="block text-sm text-muted transition hover:text-text">FAQ</Link>
          <Link href="/support" className="block text-sm text-muted transition hover:text-text">Support</Link>
          <Link href="/security" className="block text-sm text-muted transition hover:text-text">Securite</Link>
          <Link href="/about" className="block text-sm text-muted transition hover:text-text">A propos</Link>
          <Link href="/contact" className="block text-sm text-muted transition hover:text-text">Contact</Link>
          {footer.links.map((link) => (
            <Link key={link.label} href={link.href} className="block text-sm text-muted transition hover:text-text">
              {link.label}
            </Link>
          ))}
          <div className="pt-2 text-xs uppercase tracking-[0.16em] text-muted">Community</div>
          {socials.discord ? <a href={socials.discord} target="_blank" rel="noreferrer" className="block text-sm text-muted transition hover:text-text">Discord</a> : null}
          {socials.telegram ? <a href={socials.telegram} target="_blank" rel="noreferrer" className="block text-sm text-muted transition hover:text-text">Telegram</a> : null}
          {socials.twitter ? <a href={socials.twitter} target="_blank" rel="noreferrer" className="block text-sm text-muted transition hover:text-text">Twitter / X</a> : null}
        </div>
      </div>
      {paymentMethods.length > 0 ? (
        <div className="container-app border-t border-white/10 py-5">
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((method) => (
              <span key={method.id} className="rounded-full border border-line bg-white/5 px-3 py-1.5 text-xs font-semibold text-muted">
                {method.name}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </footer>
  );
}
