import { prisma } from "@/lib/prisma";

export const defaultBrand = {
  brandName: "YasarPack",
  shortName: "Yasar",
  legalName: "YasarPack SAS",
  tagline: "Digital settlement platform",
  supportEmail: "support@yasarpack.com",
  supportPhone: "+33 1 84 80 29 11",
  primaryColor: "#16c47f",
  secondaryColor: "#49a2ff",
  accentColor: "#f6b554",
  logoText: "YP",
  faviconUrl: "",
  metaTitle: "YasarPack | Fintech & Crypto Platform",
  metaDescription: "Premium fintech and crypto operations platform with real dashboards, KYC, payments, loyalty and multilingual CMS.",
  footerText: "YasarPack - premium digital settlement operations."
};

export async function getBrandSettings() {
  const brand = await prisma.brandSetting.findFirst({
    orderBy: { updatedAt: "desc" }
  });

  return brand ?? defaultBrand;
}
