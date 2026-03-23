import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getBrandSettings } from "@/lib/branding";
import { getDictionary, getLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/app/language-switcher";
import { LogoutButton } from "@/components/app/logout-button";

export async function SiteHeader() {
  const [brand, locale, dictionary, currentUser] = await Promise.all([
    getBrandSettings(),
    getLocale(),
    getDictionary(),
    getCurrentUser()
  ]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[rgba(7,17,26,0.78)] backdrop-blur-xl">
      <div className="container-app flex min-h-[74px] items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--brand-primary),var(--brand-secondary))] font-display text-sm font-black text-slate-950">
            {brand.logoText}
          </div>
          <div>
            <div className="font-display text-lg font-black text-text">{brand.brandName}</div>
            <div className="text-xs text-muted">{brand.tagline}</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          <Link href="/#payments" className="rounded-full px-3 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-text">
            {dictionary.common.payments}
          </Link>
          <Link href="/#loyalty" className="rounded-full px-3 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-text">
            {dictionary.common.loyalty}
          </Link>
          <Link href="/#reviews" className="rounded-full px-3 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-text">
            {dictionary.common.reviews}
          </Link>
          <Link href="/#faq" className="rounded-full px-3 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-text">
            {dictionary.common.faq}
          </Link>
          <Link href="/#contact" className="rounded-full px-3 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-text">
            {dictionary.common.contact}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          {currentUser ? (
            <>
              <Link href="/dashboard/overview" className="hidden md:block">
                <Button size="sm" variant="secondary">
                  {dictionary.common.dashboard}
                </Button>
              </Link>
              {currentUser.role === "ADMIN" ? (
                <Link href="/admin/overview" className="hidden md:block">
                  <Button size="sm">{dictionary.common.admin}</Button>
                </Link>
              ) : null}
              <LogoutButton className="hidden md:inline-flex" />
            </>
          ) : (
            <>
              <Link href="/login" className="hidden md:block">
                <Button size="sm" variant="secondary">
                  {dictionary.common.login}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">{dictionary.common.register}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
