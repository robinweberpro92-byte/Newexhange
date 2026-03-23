import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { SiteFooter } from "@/components/app/footer";
import { SiteHeader } from "@/components/app/header";
import { getBrandSettings } from "@/lib/branding";
import { getLocale } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrandSettings();
  return {
    title: brand.metaTitle,
    description: brand.metaDescription,
    icons: brand.faviconUrl ? { icon: brand.faviconUrl } : undefined
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [brand, locale] = await Promise.all([getBrandSettings(), getLocale()]);

  return (
    <html lang={locale} className={`${inter.variable} ${sora.variable}`}>
      <body
        style={{
          ["--brand-primary" as string]: brand.primaryColor,
          ["--brand-secondary" as string]: brand.secondaryColor,
          ["--brand-accent" as string]: brand.accentColor
        }}
      >
        <div className="min-h-screen">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
