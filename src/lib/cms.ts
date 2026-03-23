import { prisma } from "@/lib/prisma";

export type HeroContent = {
  badge: string;
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
};

export type TrustContent = {
  stats: Array<{ label: string; value: string }>;
  badges: string[];
};

export type FinalCtaContent = {
  title: string;
  text: string;
  buttonLabel: string;
};

export type ContactContent = {
  email: string;
  phone: string;
  address: string;
};

export type FooterContent = {
  aboutText: string;
  finalNote: string;
  links: Array<{ label: string; href: string }>;
};

export type LoyaltySettings = {
  enabled: boolean;
  baseRate: number;
  tierMode: "BALANCE" | "TOTAL_EARNED";
  description: string;
  paymentMethodBonusEnabled: boolean;
};

const heroFallbacks: Record<"fr" | "en", HeroContent> = {
  fr: {
    badge: "Plateforme premium securisee",
    title: "Transformez vos paiements en crypto avec plus de clarte.",
    subtitle:
      "Une interface plus propre, plus rassurante et plus moderne pour acheter, vendre et suivre chaque operation sans friction.",
    primaryCtaLabel: "Commencer maintenant",
    secondaryCtaLabel: "Voir comment ca marche"
  },
  en: {
    badge: "Secure premium platform",
    title: "Turn your payments into crypto with more clarity.",
    subtitle:
      "A cleaner, more reassuring and more modern interface to buy, sell and track every operation without friction.",
    primaryCtaLabel: "Get started",
    secondaryCtaLabel: "See how it works"
  }
};

const trustFallbacks: Record<"fr" | "en", TrustContent> = {
  fr: {
    stats: [
      { label: "Utilisateurs actifs", value: "12.4k" },
      { label: "Volume traite", value: "€18.9M" },
      { label: "Taux KYC", value: "97.8%" }
    ],
    badges: ["SSL", "KYC", "24/7"]
  },
  en: {
    stats: [
      { label: "Active users", value: "12.4k" },
      { label: "Volume processed", value: "€18.9M" },
      { label: "KYC pass rate", value: "97.8%" }
    ],
    badges: ["SSL", "KYC", "24/7"]
  }
};

const finalCtaFallbacks: Record<"fr" | "en", FinalCtaContent> = {
  fr: {
    title: "Pret a lancer une vraie base produit premium ?",
    text: "Auth securisee, dashboards reels, paiements administrables, loyalty, support et CMS sont deja structures dans cette base.",
    buttonLabel: "Lancer la plateforme"
  },
  en: {
    title: "Ready to ship a real premium product foundation?",
    text: "Secure auth, real dashboards, configurable payments, loyalty, support and CMS are already structured in this base.",
    buttonLabel: "Launch the platform"
  }
};

const contactFallback: ContactContent = {
  email: "support@yasarpack.com",
  phone: "+33 1 84 80 29 11",
  address: "Paris, France"
};

const footerFallback: FooterContent = {
  aboutText:
    "YasarPack centralise les flux de paiement, la verification KYC, le support et les modules d'administration dans une base produit premium.",
  finalNote: "Les operations crypto peuvent etre soumises a verification de conformite.",
  links: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Support", href: "/dashboard/support" }
  ]
};

const loyaltyFallback: LoyaltySettings = {
  enabled: true,
  baseRate: 1,
  tierMode: "BALANCE",
  description: "1 point per 1 EUR processed, plus tier and payment method bonuses.",
  paymentMethodBonusEnabled: true
};

async function getSetting<T>(key: string, locale: string, fallback: T): Promise<T> {
  const rows = await prisma.siteSetting.findMany({
    where: {
      key,
      locale: { in: [locale, "fr", "global"] }
    }
  });

  const selected = rows.find((row) => row.locale === locale) ?? rows.find((row) => row.locale === "fr") ?? rows.find((row) => row.locale === "global");
  if (!selected) return fallback;

  return {
    ...(fallback as Record<string, unknown>),
    ...(selected.value as Record<string, unknown>)
  } as T;
}

export function upsertSiteSetting(key: string, locale: string, value: Record<string, unknown>, description?: string) {
  return prisma.siteSetting.upsert({
    where: {
      key_locale: {
        key,
        locale
      }
    },
    update: {
      value,
      description
    },
    create: {
      key,
      locale,
      value,
      description
    }
  });
}

export function getHeroContent(locale: "fr" | "en") {
  return getSetting<HeroContent>("homepage.hero", locale, heroFallbacks[locale]);
}

export function getTrustContent(locale: "fr" | "en") {
  return getSetting<TrustContent>("homepage.trust", locale, trustFallbacks[locale]);
}

export function getFinalCtaContent(locale: "fr" | "en") {
  return getSetting<FinalCtaContent>("homepage.finalCta", locale, finalCtaFallbacks[locale]);
}

export function getContactContent() {
  return getSetting<ContactContent>("site.contact", "global", contactFallback);
}

export function getFooterContent() {
  return getSetting<FooterContent>("site.footer", "global", footerFallback);
}

export function getLoyaltySettings() {
  return getSetting<LoyaltySettings>("loyalty.settings", "global", loyaltyFallback);
}
