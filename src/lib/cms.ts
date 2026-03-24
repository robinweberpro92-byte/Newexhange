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
    badge: "Exchange crypto premium",
    title: "Achetez, vendez et exchangez vos cryptos avec des rails clairs et administrables.",
    subtitle:
      "PayPal, LTC, BTC, ETH, USDT, carte et virement : chaque operation affiche ses frais, son delai estime et son niveau de verification.",
    primaryCtaLabel: "Demarrer un exchange",
    secondaryCtaLabel: "Voir le fonctionnement"
  },
  en: {
    badge: "Premium crypto exchange",
    title: "Buy, sell and exchange crypto with clear and configurable payment rails.",
    subtitle:
      "PayPal, LTC, BTC, ETH, USDT, card and bank transfer: every operation exposes fees, ETA and verification requirements.",
    primaryCtaLabel: "Start exchange",
    secondaryCtaLabel: "See how it works"
  }
};

const trustFallbacks: Record<"fr" | "en", TrustContent> = {
  fr: {
    stats: [
      { label: "Utilisateurs actifs", value: "12.4k+" },
      { label: "Volume traite", value: "€18.9M" },
      { label: "Temps moyen", value: "< 15 min" }
    ],
    badges: ["SSL chiffre", "KYC progressif", "Support 24/7"]
  },
  en: {
    stats: [
      { label: "Active users", value: "12.4k+" },
      { label: "Volume processed", value: "€18.9M" },
      { label: "Avg. settlement", value: "< 15 min" }
    ],
    badges: ["SSL encrypted", "Progressive KYC", "24/7 support"]
  }
};

const finalCtaFallbacks: Record<"fr" | "en", FinalCtaContent> = {
  fr: {
    title: "Lancez votre premier exchange en moins de 5 minutes.",
    text: "Inscription rapide, parcours de verification progressif, suivi des transactions et support humain pour chaque operation sensible.",
    buttonLabel: "Creer un compte gratuitement"
  },
  en: {
    title: "Start your first exchange in under 5 minutes.",
    text: "Fast onboarding, progressive verification, transparent transaction tracking and human support for every sensitive operation.",
    buttonLabel: "Create free account"
  }
};

const contactFallback: ContactContent = {
  email: "support@yasarpack.com",
  phone: "+33 1 84 80 29 11",
  address: "12 rue de la Paix, 75002 Paris, France"
};

const footerFallback: FooterContent = {
  aboutText:
    "YasarPack simplifie l'achat, la vente et l'exchange de cryptos avec des moyens de paiement configurables, un suivi clair et un back-office complet.",
  finalNote: "AML/KYC applique selon le montant, le pays et le rail de paiement selectionne.",
  links: [
    { label: "Privacy", href: "/legal/privacy" },
    { label: "Terms", href: "/legal/terms" },
    { label: "Security", href: "/security" },
    { label: "About", href: "/about" }
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
