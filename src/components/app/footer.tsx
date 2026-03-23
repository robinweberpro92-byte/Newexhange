import Link from "next/link";
import { getBrandSettings } from "@/lib/branding";
import { getContactContent, getFooterContent } from "@/lib/cms";
import { prisma } from "@/lib/prisma";

export async function SiteFooter() {
  const [brand, footer, contact, paymentMethods] = await Promise.all([
    getBrandSettings(),
    getFooterContent(),
    getContactContent(),
    prisma.paymentMethod.findMany({
      where: { active: true, displayInFooter: true },
      orderBy: { sortOrder: "asc" }
    })
  ]);

  return (
    <footer id="contact" className="border-t border-white/10 bg-black/10">
      <div className="container-app grid gap-8 py-12 md:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-4">
          <div className="font-display text-2xl font-black text-text">{brand.brandName}</div>
          <p className="max-w-2xl text-muted">{footer.aboutText}</p>
          <p className="text-sm text-muted">{brand.footerText}</p>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">{footer.finalNote}</p>
          {paymentMethods.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {paymentMethods.map((method) => (
                <span key={method.id} className="rounded-full border border-line bg-white/5 px-3 py-1.5 text-xs font-semibold text-muted">
                  {method.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Contact</p>
            <p className="text-sm text-text">{contact.email}</p>
            <p className="text-sm text-text">{contact.phone}</p>
            <p className="text-sm text-muted">{contact.address}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Links</p>
            {footer.links.map((link) => (
              <Link key={link.label} href={link.href} className="block text-sm text-muted transition hover:text-text">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
