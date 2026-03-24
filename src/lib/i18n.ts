import { cookies } from "next/headers";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const supportedLocales = ["fr", "en"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];
export const defaultLocale: SupportedLocale = "fr";

const baseDictionaries = {
  fr: {
    common: {
      home: "Accueil",
      exchange: "Exchange",
      howItWorks: "Fonctionnement",
      payments: "Paiements",
      loyalty: "Fidelite",
      reviews: "Avis",
      faq: "FAQ",
      contact: "Contact",
      login: "Connexion",
      register: "Creer un compte",
      dashboard: "Dashboard",
      admin: "Admin",
      logout: "Deconnexion",
      save: "Enregistrer",
      status: "Statut",
      actions: "Actions"
    },
    marketing: {
      trustTitle: "Une plateforme pensee pour rassurer et convertir.",
      paymentsTitle: "Choisissez le rail le plus adapte a votre operation.",
      paymentsText: "PayPal, carte, virement et rails crypto sont presentes clairement avec frais, delais et disponibilite.",
      loyaltyTitle: "Chaque exchange vous fait progresser.",
      loyaltyText: "Des paliers simples, de vrais avantages sur les frais et une progression lisible depuis le dashboard.",
      reviewsTitle: "Des avis qui repondent aux vraies objections.",
      reviewsText: "Des retours verifies, notes, pays et dates d'affichage administres depuis le back-office.",
      faqTitle: "Questions frequentes",
      faqText: "Les points sensibles d'un exchange sont traites en premier : KYC, delais, frais, securite et support."
    },
    auth: {
      loginTitle: "Connexion securisee",
      registerTitle: "Creer votre compte",
      forgotPasswordTitle: "Reinitialiser le mot de passe",
      resetPasswordTitle: "Choisir un nouveau mot de passe"
    },
    dashboard: {
      overviewTitle: "Vue d'ensemble",
      walletTitle: "Wallet",
      transactionsTitle: "Transactions",
      loyaltyTitle: "Fidelite",
      kycTitle: "KYC",
      supportTitle: "Support",
      profileTitle: "Profil & securite"
    },
    admin: {
      overviewTitle: "Pilotage global",
      usersTitle: "Utilisateurs",
      transactionsTitle: "Transactions",
      paymentsTitle: "Moyens de paiement",
      reviewsTitle: "Avis",
      loyaltyTitle: "Fidelite",
      supportTitle: "Tickets support",
      cmsTitle: "CMS",
      brandingTitle: "Branding",
      translationsTitle: "Traductions"
    }
  },
  en: {
    common: {
      home: "Home",
      exchange: "Exchange",
      howItWorks: "How it works",
      payments: "Payments",
      loyalty: "Loyalty",
      reviews: "Reviews",
      faq: "FAQ",
      contact: "Contact",
      login: "Login",
      register: "Create account",
      dashboard: "Dashboard",
      admin: "Admin",
      logout: "Logout",
      save: "Save",
      status: "Status",
      actions: "Actions"
    },
    marketing: {
      trustTitle: "A platform designed to reassure and convert.",
      paymentsTitle: "Choose the rail that fits your transaction.",
      paymentsText: "PayPal, card, bank transfer and crypto rails are shown clearly with fees, delays and availability.",
      loyaltyTitle: "Every exchange moves you forward.",
      loyaltyText: "Simple tiers, real fee benefits and a progression you can track from the dashboard.",
      reviewsTitle: "Testimonials that answer real objections.",
      reviewsText: "Verified reviews, visible ratings and fully managed moderation from the back office.",
      faqTitle: "Frequently asked questions",
      faqText: "The most sensitive exchange topics come first: KYC, delays, fees, security and support."
    },
    auth: {
      loginTitle: "Secure sign in",
      registerTitle: "Create your account",
      forgotPasswordTitle: "Reset password",
      resetPasswordTitle: "Choose a new password"
    },
    dashboard: {
      overviewTitle: "Overview",
      walletTitle: "Wallet",
      transactionsTitle: "Transactions",
      loyaltyTitle: "Loyalty",
      kycTitle: "KYC",
      supportTitle: "Support",
      profileTitle: "Profile & security"
    },
    admin: {
      overviewTitle: "Operations overview",
      usersTitle: "Users",
      transactionsTitle: "Transactions",
      paymentsTitle: "Payment methods",
      reviewsTitle: "Reviews",
      loyaltyTitle: "Loyalty",
      supportTitle: "Support tickets",
      cmsTitle: "CMS",
      brandingTitle: "Branding",
      translationsTitle: "Translations"
    }
  }
} as const;

export type Dictionary = (typeof baseDictionaries)["fr"];

export function isSupportedLocale(value: string | null | undefined): value is SupportedLocale {
  return value === "fr" || value === "en";
}

export async function getLocale(): Promise<SupportedLocale> {
  const session = await getCurrentSession().catch(() => null);
  const sessionLocale = session?.user?.language;
  if (isSupportedLocale(sessionLocale)) return sessionLocale;

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("yasarpack_locale")?.value;
  if (isSupportedLocale(cookieLocale)) return cookieLocale;

  return defaultLocale;
}

export async function getDictionary(locale?: SupportedLocale) {
  const resolvedLocale = locale ?? (await getLocale());
  const dictionary = structuredClone(baseDictionaries.fr) as Dictionary;

  for (const namespace of Object.keys(baseDictionaries[resolvedLocale]) as Array<keyof Dictionary>) {
    Object.assign(dictionary[namespace], baseDictionaries[resolvedLocale][namespace]);
  }

  const overrides = await prisma.translation.findMany({
    where: { locale: resolvedLocale }
  });

  for (const row of overrides) {
    const namespace = row.namespace as keyof Dictionary;
    if (!dictionary[namespace]) {
      (dictionary as Record<string, Record<string, string>>)[row.namespace] = {};
    }

    (dictionary as Record<string, Record<string, string>>)[row.namespace][row.key] = row.value;
  }

  return dictionary;
}
