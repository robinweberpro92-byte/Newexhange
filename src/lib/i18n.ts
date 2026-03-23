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
      trustTitle: "Une plateforme construite pour inspirer confiance.",
      paymentsTitle: "Des moyens de paiement pilotables par l'administration.",
      paymentsText: "Frais, disponibilite, recommandations, maintenance et zones de diffusion sont geres depuis le back-office.",
      loyaltyTitle: "Une fidelite visible, mesurable et configurable.",
      loyaltyText: "Les paliers, les points et les bonus restent expliques clairement dans le parcours utilisateur.",
      reviewsTitle: "Des avis credibles et administrables.",
      reviewsText: "L'equipe peut moderer, mettre en avant et verifier les temoignages sans toucher au code.",
      faqTitle: "Questions frequentes",
      faqText: "Les questions critiques sont placees en premier pour reduire la friction avant conversion."
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
      trustTitle: "A platform designed to create trust.",
      paymentsTitle: "Payment methods fully managed from admin.",
      paymentsText: "Fees, availability, recommendations, maintenance and display surfaces are all controlled from the back-office.",
      loyaltyTitle: "Loyalty that is visible, measurable and configurable.",
      loyaltyText: "Tiers, points and bonuses remain explicit throughout the user journey.",
      reviewsTitle: "Credible reviews, fully manageable.",
      reviewsText: "The team can moderate, feature and verify testimonials without touching code.",
      faqTitle: "Frequently asked questions",
      faqText: "Critical questions are surfaced first to reduce friction before conversion."
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
