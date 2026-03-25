"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/admin-log";
import { sanitizeText } from "@/lib/security";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/* =========================
   USERS
========================= */

export async function toggleUserActiveAction() {}
export async function changeUserRoleAction() {}
export async function setUserTierAction() {}
export async function adjustUserPointsAction() {}
export async function reviewKycAction() {}

/* =========================
   TRANSACTIONS
========================= */

export async function updateTransactionAction() {}

/* =========================
   PAYMENTS
========================= */

export async function upsertPaymentMethodAction() {}
export async function deletePaymentMethodAction() {}

/* =========================
   REVIEWS
========================= */

export async function upsertReviewAction() {}
export async function deleteReviewAction() {}

/* =========================
   LOYALTY
========================= */

export async function upsertLoyaltyTierAction() {}
export async function deleteLoyaltyTierAction() {}
export async function updateLoyaltySettingsAction() {}

/* =========================
   SUPPORT
========================= */

export async function updateTicketAdminAction() {}
export async function adminReplyTicketAction() {}

/* =========================
   CMS
========================= */

export async function updateHeroContentAction() {}
export async function updateTrustContentAction() {}
export async function updateFinalCtaAction() {}
export async function updateContactContentAction() {}
export async function updateFooterContentAction() {}
export async function updateSocialLinksAction() {}
export async function updateAnnouncementAction() {}
export async function upsertFaqAction() {}
export async function deleteFaqAction() {}

/* =========================
   TRANSLATIONS
========================= */

export async function upsertTranslationAction() {}
export async function deleteTranslationAction() {}

/* =========================
   BRANDING (TON CODE)
========================= */

import { brandingSchema } from "@/lib/validators/domain";

export async function updateBrandingAction(formData: FormData) {
  const admin = await requireAdmin();

  const parsed = brandingSchema.parse({
    brandName: sanitizeText(formData.get("brandName"), 120),
    shortName: sanitizeText(formData.get("shortName"), 40),
    legalName: sanitizeText(formData.get("legalName"), 160),
    tagline: sanitizeText(formData.get("tagline"), 120),
    supportEmail: sanitizeText(formData.get("supportEmail"), 120),
    supportPhone: sanitizeText(formData.get("supportPhone"), 60),
    primaryColor: sanitizeText(formData.get("primaryColor"), 10),
    secondaryColor: sanitizeText(formData.get("secondaryColor"), 10),
    accentColor: sanitizeText(formData.get("accentColor"), 10),
    logoText: sanitizeText(formData.get("logoText"), 8),
    faviconUrl: sanitizeText(formData.get("faviconUrl"), 300),
    metaTitle: sanitizeText(formData.get("metaTitle"), 160),
    metaDescription: sanitizeText(formData.get("metaDescription"), 300),
    footerText: sanitizeText(formData.get("footerText"), 200)
  });

  const current = await prisma.brandSetting.findFirst({
    orderBy: { updatedAt: "desc" }
  });

  let entityId = "new";

  if (current) {
    await prisma.brandSetting.update({
      where: { id: current.id },
      data: {
        ...parsed,
        supportPhone: parsed.supportPhone || null,
        faviconUrl: parsed.faviconUrl || null
      }
    });
    entityId = current.id;
  } else {
    const created = await prisma.brandSetting.create({
      data: {
        ...parsed,
        supportPhone: parsed.supportPhone || null,
        faviconUrl: parsed.faviconUrl || null
      }
    });
    entityId = created.id;
  }

  await logAdminAction({
    adminId: admin.id,
    action: "BRANDING_UPDATED",
    entityType: "BrandSetting",
    entityId
  });

  revalidatePath("/");
  revalidatePath("/admin/branding");
  redirect("/admin/branding?updated=1");
}