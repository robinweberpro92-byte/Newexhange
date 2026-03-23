"use server";

import { KycStatus, ReviewStatus, Role, TicketStatus, TransactionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-log";
import { upsertSiteSetting } from "@/lib/cms";
import { adjustUserPoints, awardLoyaltyForTransaction, reverseLoyaltyForTransaction } from "@/lib/loyalty";
import { prisma } from "@/lib/prisma";
import { sanitizeMultilineText, sanitizeText, slugify } from "@/lib/security";
import {
  adjustPointsSchema,
  brandingSchema,
  cmsContactSchema,
  cmsFinalCtaSchema,
  cmsFooterSchema,
  cmsHeroSchema,
  cmsTrustSchema,
  faqSchema,
  loyaltySettingsSchema,
  loyaltyTierSchema,
  paymentMethodSchema,
  reviewSchema,
  ticketAdminSchema,
  ticketReplySchema,
  transactionUpdateSchema,
  translationSchema,
  userRoleSchema,
  userTierSchema
} from "@/lib/validators/domain";
import { parseBoolean, parseNumber } from "@/lib/utils";

function parseCountryRestrictions(raw: FormDataEntryValue | null) {
  return sanitizeText(raw, 400)
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);
}

function parsePerks(raw: FormDataEntryValue | null) {
  return sanitizeText(raw, 1000)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export async function toggleUserActiveAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = userRoleSchema.parse({
    userId: sanitizeText(formData.get("userId"), 40),
    role: sanitizeText(formData.get("role"), 20),
    isActive: parseBoolean(formData.get("isActive"))
  });

  await prisma.user.update({
    where: { id: parsed.userId },
    data: {
      isActive: parsed.isActive
    }
  });

  await logAdminAction({
    adminId: admin.id,
    action: parsed.isActive ? "USER_REACTIVATED" : "USER_SUSPENDED",
    entityType: "User",
    entityId: parsed.userId,
    details: { isActive: parsed.isActive }
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function changeUserRoleAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = userRoleSchema.parse({
    userId: sanitizeText(formData.get("userId"), 40),
    role: sanitizeText(formData.get("role"), 20)
  });

  await prisma.user.update({
    where: { id: parsed.userId },
    data: { role: parsed.role }
  });

  await logAdminAction({
    adminId: admin.id,
    action: "USER_ROLE_CHANGED",
    entityType: "User",
    entityId: parsed.userId,
    details: { role: parsed.role }
  });

  revalidatePath("/admin/users");
  redirect(`/admin/users/${parsed.userId}?roleUpdated=1`);
}

export async function setUserTierAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = userTierSchema.parse({
    userId: sanitizeText(formData.get("userId"), 40),
    loyaltyTierId: sanitizeText(formData.get("loyaltyTierId"), 40)
  });

  await prisma.user.update({
    where: { id: parsed.userId },
    data: {
      loyaltyTierId: parsed.loyaltyTierId || null
    }
  });

  await logAdminAction({
    adminId: admin.id,
    action: "USER_TIER_SET",
    entityType: "User",
    entityId: parsed.userId,
    details: { loyaltyTierId: parsed.loyaltyTierId || null }
  });

  revalidatePath(`/admin/users/${parsed.userId}`);
  redirect(`/admin/users/${parsed.userId}`);
}

export async function adjustUserPointsAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = adjustPointsSchema.parse({
    userId: sanitizeText(formData.get("userId"), 40),
    points: parseNumber(formData.get("points")),
    note: sanitizeText(formData.get("note"), 300)
  });

  await adjustUserPoints(parsed.userId, parsed.points, parsed.note);

  await logAdminAction({
    adminId: admin.id,
    action: "LOYALTY_POINTS_ADJUSTED",
    entityType: "User",
    entityId: parsed.userId,
    details: { points: parsed.points, note: parsed.note }
  });

  revalidatePath(`/admin/users/${parsed.userId}`);
  redirect(`/admin/users/${parsed.userId}`);
}

export async function reviewKycAction(formData: FormData) {
  const admin = await requireAdmin();
  const submissionId = sanitizeText(formData.get("submissionId"), 40);
  const status = sanitizeText(formData.get("status"), 20) as KycStatus;
  const adminComment = sanitizeMultilineText(formData.get("adminComment"), 1000);

  const submission = await prisma.kycSubmission.findUnique({ where: { id: submissionId } });
  if (!submission) {
    redirect("/admin/users");
  }

  await prisma.$transaction([
    prisma.kycSubmission.update({
      where: { id: submissionId },
      data: {
        status,
        reviewedById: admin.id,
        reviewedAt: new Date(),
        adminComment
      }
    }),
    prisma.user.update({
      where: { id: submission.userId },
      data: {
        kycStatus: status
      }
    })
  ]);

  await logAdminAction({
    adminId: admin.id,
    action: "KYC_REVIEWED",
    entityType: "KycSubmission",
    entityId: submissionId,
    details: { status }
  });

  revalidatePath(`/admin/users/${submission.userId}`);
  redirect(`/admin/users/${submission.userId}`);
}

export async function updateTransactionAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = transactionUpdateSchema.parse({
    transactionId: sanitizeText(formData.get("transactionId"), 40),
    status: sanitizeText(formData.get("status"), 20),
    adminNote: sanitizeMultilineText(formData.get("adminNote"), 2000)
  });

  const current = await prisma.transaction.findUnique({ where: { id: parsed.transactionId } });
  if (!current) {
    redirect("/admin/transactions");
  }

  await prisma.transaction.update({
    where: { id: parsed.transactionId },
    data: {
      status: parsed.status,
      adminNote: parsed.adminNote || null,
      completedAt: parsed.status === TransactionStatus.COMPLETED ? current.completedAt ?? new Date() : current.completedAt
    }
  });

  if (current.status !== TransactionStatus.COMPLETED && parsed.status === TransactionStatus.COMPLETED) {
    await awardLoyaltyForTransaction(parsed.transactionId);
  }

  if (current.status === TransactionStatus.COMPLETED && parsed.status !== TransactionStatus.COMPLETED) {
    await reverseLoyaltyForTransaction(parsed.transactionId, `Status changed by admin ${admin.email}`);
  }

  await logAdminAction({
    adminId: admin.id,
    action: "TRANSACTION_UPDATED",
    entityType: "Transaction",
    entityId: parsed.transactionId,
    details: { from: current.status, to: parsed.status }
  });

  revalidatePath("/admin/transactions");
  redirect(`/admin/transactions/${parsed.transactionId}`);
}

export async function upsertPaymentMethodAction(formData: FormData) {
  const admin = await requireAdmin();

  const parsed = paymentMethodSchema.parse({
    id: sanitizeText(formData.get("id"), 40) || undefined,
    name: sanitizeText(formData.get("name"), 120),
    slug: slugify(sanitizeText(formData.get("slug"), 120) || sanitizeText(formData.get("name"), 120)),
    logoUrl: sanitizeText(formData.get("logoUrl"), 300),
    description: sanitizeText(formData.get("description"), 500),
    active: parseBoolean(formData.get("active")),
    recommended: parseBoolean(formData.get("recommended")),
    maintenanceMode: parseBoolean(formData.get("maintenanceMode")),
    supportBuy: parseBoolean(formData.get("supportBuy")),
    supportSell: parseBoolean(formData.get("supportSell")),
    supportDeposit: parseBoolean(formData.get("supportDeposit")),
    supportWithdrawal: parseBoolean(formData.get("supportWithdrawal")),
    countryRestrictions: parseCountryRestrictions(formData.get("countryRestrictions")),
    displayInHero: parseBoolean(formData.get("displayInHero")),
    displayInCheckout: parseBoolean(formData.get("displayInCheckout")),
    displayInFooter: parseBoolean(formData.get("displayInFooter")),
    trustMessage: sanitizeText(formData.get("trustMessage"), 300),
    unavailableMessage: sanitizeText(formData.get("unavailableMessage"), 300),
    sortOrder: parseNumber(formData.get("sortOrder")),
    feeFixed: parseNumber(formData.get("feeFixed")),
    feePercent: parseNumber(formData.get("feePercent")),
    estimatedDelay: sanitizeText(formData.get("estimatedDelay"), 120),
    loyaltyBonusPoints: parseNumber(formData.get("loyaltyBonusPoints"))
  });

  const data = {
    name: parsed.name,
    slug: parsed.slug,
    logoUrl: parsed.logoUrl || null,
    description: parsed.description || null,
    active: parsed.active,
    recommended: parsed.recommended,
    maintenanceMode: parsed.maintenanceMode,
    supportBuy: parsed.supportBuy,
    supportSell: parsed.supportSell,
    supportDeposit: parsed.supportDeposit,
    supportWithdrawal: parsed.supportWithdrawal,
    countryRestrictions: parsed.countryRestrictions,
    displayInHero: parsed.displayInHero,
    displayInCheckout: parsed.displayInCheckout,
    displayInFooter: parsed.displayInFooter,
    trustMessage: parsed.trustMessage || null,
    unavailableMessage: parsed.unavailableMessage || null,
    sortOrder: parsed.sortOrder,
    feeFixed: parsed.feeFixed,
    feePercent: parsed.feePercent,
    estimatedDelay: parsed.estimatedDelay || null,
    loyaltyBonusPoints: parsed.loyaltyBonusPoints
  };

  const paymentMethod = parsed.id
    ? await prisma.paymentMethod.update({ where: { id: parsed.id }, data })
    : await prisma.paymentMethod.create({ data });

  await logAdminAction({
    adminId: admin.id,
    action: parsed.id ? "PAYMENT_METHOD_UPDATED" : "PAYMENT_METHOD_CREATED",
    entityType: "PaymentMethod",
    entityId: paymentMethod.id,
    details: { slug: paymentMethod.slug }
  });

  revalidatePath("/admin/payments");
  redirect("/admin/payments");
}

export async function deletePaymentMethodAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = sanitizeText(formData.get("id"), 40);

  await prisma.paymentMethod.delete({ where: { id } });

  await logAdminAction({
    adminId: admin.id,
    action: "PAYMENT_METHOD_DELETED",
    entityType: "PaymentMethod",
    entityId: id
  });

  revalidatePath("/admin/payments");
  redirect("/admin/payments");
}

export async function upsertReviewAction(formData: FormData) {
  const admin = await requireAdmin();

  const parsed = reviewSchema.parse({
    id: sanitizeText(formData.get("id"), 40) || undefined,
    authorName: sanitizeText(formData.get("authorName"), 120),
    country: sanitizeText(formData.get("country"), 80),
    avatarUrl: sanitizeText(formData.get("avatarUrl"), 300),
    rating: parseNumber(formData.get("rating"), 5),
    text: sanitizeMultilineText(formData.get("text"), 2000),
    locale: sanitizeText(formData.get("locale"), 2),
    status: sanitizeText(formData.get("status"), 20),
    featured: parseBoolean(formData.get("featured")),
    verifiedBadge: parseBoolean(formData.get("verifiedBadge")),
    displayDate: sanitizeText(formData.get("displayDate"), 40),
    sortOrder: parseNumber(formData.get("sortOrder"), 0)
  });

  const data = {
    authorName: parsed.authorName,
    country: parsed.country || null,
    avatarUrl: parsed.avatarUrl || null,
    rating: parsed.rating,
    text: parsed.text,
    locale: parsed.locale,
    status: parsed.status,
    featured: parsed.featured,
    verifiedBadge: parsed.verifiedBadge,
    displayDate: parsed.displayDate ? new Date(parsed.displayDate) : null,
    sortOrder: parsed.sortOrder
  };

  const review = parsed.id ? await prisma.review.update({ where: { id: parsed.id }, data }) : await prisma.review.create({ data });

  await logAdminAction({
    adminId: admin.id,
    action: parsed.id ? "REVIEW_UPDATED" : "REVIEW_CREATED",
    entityType: "Review",
    entityId: review.id,
    details: { locale: review.locale, status: review.status }
  });

  revalidatePath("/admin/reviews");
  redirect("/admin/reviews");
}

export async function deleteReviewAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = sanitizeText(formData.get("id"), 40);

  await prisma.review.delete({ where: { id } });

  await logAdminAction({
    adminId: admin.id,
    action: "REVIEW_DELETED",
    entityType: "Review",
    entityId: id
  });

  revalidatePath("/admin/reviews");
  redirect("/admin/reviews");
}

export async function upsertLoyaltyTierAction(formData: FormData) {
  const admin = await requireAdmin();

  const parsed = loyaltyTierSchema.parse({
    id: sanitizeText(formData.get("id"), 40) || undefined,
    name: sanitizeText(formData.get("name"), 80),
    slug: slugify(sanitizeText(formData.get("slug"), 120) || sanitizeText(formData.get("name"), 80)),
    description: sanitizeText(formData.get("description"), 300),
    colorHex: sanitizeText(formData.get("colorHex"), 10),
    thresholdPoints: parseNumber(formData.get("thresholdPoints")),
    bonusMultiplier: parseNumber(formData.get("bonusMultiplier"), 1),
    perks: parsePerks(formData.get("perks")),
    isDefault: parseBoolean(formData.get("isDefault")),
    isActive: parseBoolean(formData.get("isActive")),
    sortOrder: parseNumber(formData.get("sortOrder"), 0)
  });

  if (parsed.isDefault) {
    await prisma.loyaltyTier.updateMany({
      where: { isDefault: true },
      data: { isDefault: false }
    });
  }

  const data = {
    name: parsed.name,
    slug: parsed.slug,
    description: parsed.description || null,
    colorHex: parsed.colorHex,
    thresholdPoints: parsed.thresholdPoints,
    bonusMultiplier: parsed.bonusMultiplier,
    perks: parsed.perks,
    isDefault: parsed.isDefault,
    isActive: parsed.isActive,
    sortOrder: parsed.sortOrder
  };

  const tier = parsed.id ? await prisma.loyaltyTier.update({ where: { id: parsed.id }, data }) : await prisma.loyaltyTier.create({ data });

  await logAdminAction({
    adminId: admin.id,
    action: parsed.id ? "LOYALTY_TIER_UPDATED" : "LOYALTY_TIER_CREATED",
    entityType: "LoyaltyTier",
    entityId: tier.id,
    details: { slug: tier.slug, thresholdPoints: tier.thresholdPoints }
  });

  revalidatePath("/admin/loyalty");
  redirect("/admin/loyalty");
}

export async function deleteLoyaltyTierAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = sanitizeText(formData.get("id"), 40);

  await prisma.user.updateMany({
    where: { loyaltyTierId: id },
    data: { loyaltyTierId: null }
  });
  await prisma.loyaltyTier.delete({ where: { id } });

  await logAdminAction({
    adminId: admin.id,
    action: "LOYALTY_TIER_DELETED",
    entityType: "LoyaltyTier",
    entityId: id
  });

  revalidatePath("/admin/loyalty");
  redirect("/admin/loyalty");
}

export async function updateLoyaltySettingsAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = loyaltySettingsSchema.parse({
    enabled: parseBoolean(formData.get("enabled")),
    baseRate: parseNumber(formData.get("baseRate"), 1),
    tierMode: sanitizeText(formData.get("tierMode"), 20),
    description: sanitizeText(formData.get("description"), 300),
    paymentMethodBonusEnabled: parseBoolean(formData.get("paymentMethodBonusEnabled"))
  });

  await upsertSiteSetting("loyalty.settings", "global", parsed, "Loyalty system settings");

  await logAdminAction({
    adminId: admin.id,
    action: "LOYALTY_SETTINGS_UPDATED",
    entityType: "SiteSetting",
    entityId: "loyalty.settings"
  });

  revalidatePath("/admin/loyalty");
  redirect("/admin/loyalty");
}

export async function updateTicketAdminAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = ticketAdminSchema.parse({
    ticketId: sanitizeText(formData.get("ticketId"), 40),
    status: sanitizeText(formData.get("status"), 30),
    priority: sanitizeText(formData.get("priority"), 20),
    internalNote: sanitizeMultilineText(formData.get("internalNote"), 2000),
    assignedAdminId: sanitizeText(formData.get("assignedAdminId"), 40)
  });

  await prisma.ticket.update({
    where: { id: parsed.ticketId },
    data: {
      status: parsed.status,
      priority: parsed.priority,
      internalNote: parsed.internalNote || null,
      assignedAdminId: parsed.assignedAdminId || null,
      lastMessageAt: new Date()
    }
  });

  await logAdminAction({
    adminId: admin.id,
    action: "TICKET_UPDATED",
    entityType: "Ticket",
    entityId: parsed.ticketId,
    details: { status: parsed.status, priority: parsed.priority }
  });

  revalidatePath(`/admin/support/${parsed.ticketId}`);
  redirect(`/admin/support/${parsed.ticketId}`);
}

export async function adminReplyTicketAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = ticketReplySchema.parse({
    ticketId: sanitizeText(formData.get("ticketId"), 40),
    message: sanitizeMultilineText(formData.get("message"), 8000),
    isInternal: parseBoolean(formData.get("isInternal"))
  });

  await prisma.$transaction([
    prisma.ticketMessage.create({
      data: {
        ticketId: parsed.ticketId,
        authorId: admin.id,
        authorRole: Role.ADMIN,
        message: parsed.message,
        isInternal: parsed.isInternal
      }
    }),
    prisma.ticket.update({
      where: { id: parsed.ticketId },
      data: {
        status: parsed.isInternal ? undefined : TicketStatus.IN_PROGRESS,
        lastMessageAt: new Date()
      }
    })
  ]);

  await logAdminAction({
    adminId: admin.id,
    action: parsed.isInternal ? "TICKET_INTERNAL_NOTE" : "TICKET_REPLIED",
    entityType: "Ticket",
    entityId: parsed.ticketId
  });

  revalidatePath(`/admin/support/${parsed.ticketId}`);
  redirect(`/admin/support/${parsed.ticketId}`);
}

export async function upsertFaqAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = faqSchema.parse({
    id: sanitizeText(formData.get("id"), 40) || undefined,
    locale: sanitizeText(formData.get("locale"), 2),
    question: sanitizeText(formData.get("question"), 300),
    answer: sanitizeMultilineText(formData.get("answer"), 3000),
    category: sanitizeText(formData.get("category"), 80),
    active: parseBoolean(formData.get("active")),
    sortOrder: parseNumber(formData.get("sortOrder"), 0)
  });

  const faq = parsed.id
    ? await prisma.faqItem.update({
        where: { id: parsed.id },
        data: {
          locale: parsed.locale,
          question: parsed.question,
          answer: parsed.answer,
          category: parsed.category || null,
          active: parsed.active,
          sortOrder: parsed.sortOrder
        }
      })
    : await prisma.faqItem.create({
        data: {
          locale: parsed.locale,
          question: parsed.question,
          answer: parsed.answer,
          category: parsed.category || null,
          active: parsed.active,
          sortOrder: parsed.sortOrder
        }
      });

  await logAdminAction({
    adminId: admin.id,
    action: parsed.id ? "FAQ_UPDATED" : "FAQ_CREATED",
    entityType: "FaqItem",
    entityId: faq.id,
    details: { locale: faq.locale }
  });

  revalidatePath("/admin/cms");
  redirect(`/admin/cms?locale=${parsed.locale}`);
}

export async function deleteFaqAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = sanitizeText(formData.get("id"), 40);
  const locale = sanitizeText(formData.get("locale"), 2) || "fr";

  await prisma.faqItem.delete({ where: { id } });

  await logAdminAction({
    adminId: admin.id,
    action: "FAQ_DELETED",
    entityType: "FaqItem",
    entityId: id,
    details: { locale }
  });

  revalidatePath("/admin/cms");
  redirect(`/admin/cms?locale=${locale}`);
}

export async function updateHeroContentAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = cmsHeroSchema.parse({
    locale: sanitizeText(formData.get("locale"), 2),
    badge: sanitizeText(formData.get("badge"), 120),
    title: sanitizeText(formData.get("title"), 200),
    subtitle: sanitizeText(formData.get("subtitle"), 400),
    primaryCtaLabel: sanitizeText(formData.get("primaryCtaLabel"), 80),
    secondaryCtaLabel: sanitizeText(formData.get("secondaryCtaLabel"), 80)
  });

  await upsertSiteSetting("homepage.hero", parsed.locale, parsed, `Hero content ${parsed.locale}`);
  await logAdminAction({ adminId: admin.id, action: "CMS_HERO_UPDATED", entityType: "SiteSetting", entityId: `homepage.hero:${parsed.locale}` });

  revalidatePath("/");
  revalidatePath("/admin/cms");
  redirect(`/admin/cms?locale=${parsed.locale}`);
}

export async function updateTrustContentAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = cmsTrustSchema.parse({
    locale: sanitizeText(formData.get("locale"), 2),
    stat1Label: sanitizeText(formData.get("stat1Label"), 80),
    stat1Value: sanitizeText(formData.get("stat1Value"), 40),
    stat2Label: sanitizeText(formData.get("stat2Label"), 80),
    stat2Value: sanitizeText(formData.get("stat2Value"), 40),
    stat3Label: sanitizeText(formData.get("stat3Label"), 80),
    stat3Value: sanitizeText(formData.get("stat3Value"), 40),
    badge1: sanitizeText(formData.get("badge1"), 30),
    badge2: sanitizeText(formData.get("badge2"), 30),
    badge3: sanitizeText(formData.get("badge3"), 30)
  });

  await upsertSiteSetting(
    "homepage.trust",
    parsed.locale,
    {
      stats: [
        { label: parsed.stat1Label, value: parsed.stat1Value },
        { label: parsed.stat2Label, value: parsed.stat2Value },
        { label: parsed.stat3Label, value: parsed.stat3Value }
      ],
      badges: [parsed.badge1, parsed.badge2, parsed.badge3]
    },
    `Trust content ${parsed.locale}`
  );

  await logAdminAction({ adminId: admin.id, action: "CMS_TRUST_UPDATED", entityType: "SiteSetting", entityId: `homepage.trust:${parsed.locale}` });
  revalidatePath("/");
  revalidatePath("/admin/cms");
  redirect(`/admin/cms?locale=${parsed.locale}`);
}

export async function updateFinalCtaAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = cmsFinalCtaSchema.parse({
    locale: sanitizeText(formData.get("locale"), 2),
    title: sanitizeText(formData.get("title"), 160),
    text: sanitizeText(formData.get("text"), 300),
    buttonLabel: sanitizeText(formData.get("buttonLabel"), 80)
  });

  await upsertSiteSetting("homepage.finalCta", parsed.locale, parsed, `Final CTA ${parsed.locale}`);
  await logAdminAction({ adminId: admin.id, action: "CMS_FINAL_CTA_UPDATED", entityType: "SiteSetting", entityId: `homepage.finalCta:${parsed.locale}` });
  revalidatePath("/");
  revalidatePath("/admin/cms");
  redirect(`/admin/cms?locale=${parsed.locale}`);
}

export async function updateContactContentAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = cmsContactSchema.parse({
    email: sanitizeText(formData.get("email"), 120),
    phone: sanitizeText(formData.get("phone"), 60),
    address: sanitizeText(formData.get("address"), 160)
  });

  await upsertSiteSetting("site.contact", "global", parsed, "Global contact content");
  await logAdminAction({ adminId: admin.id, action: "CMS_CONTACT_UPDATED", entityType: "SiteSetting", entityId: "site.contact" });
  revalidatePath("/");
  revalidatePath("/admin/cms");
  redirect("/admin/cms");
}

export async function updateFooterContentAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = cmsFooterSchema.parse({
    aboutText: sanitizeText(formData.get("aboutText"), 500),
    finalNote: sanitizeText(formData.get("finalNote"), 300)
  });

  const current = await prisma.siteSetting.findFirst({ where: { key: "site.footer", locale: "global" } });
  const value = {
    links: [{ label: "Privacy", href: "#" }, { label: "Terms", href: "#" }, { label: "Support", href: "/dashboard/support" }],
    ...(current?.value as Record<string, unknown> | undefined),
    aboutText: parsed.aboutText,
    finalNote: parsed.finalNote
  };

  await upsertSiteSetting("site.footer", "global", value, "Global footer content");
  await logAdminAction({ adminId: admin.id, action: "CMS_FOOTER_UPDATED", entityType: "SiteSetting", entityId: "site.footer" });
  revalidatePath("/");
  revalidatePath("/admin/cms");
  redirect("/admin/cms");
}

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

  const current = await prisma.brandSetting.findFirst({ orderBy: { updatedAt: "desc" } });

  if (current) {
    await prisma.brandSetting.update({
      where: { id: current.id },
      data: {
        ...parsed,
        supportPhone: parsed.supportPhone || null,
        faviconUrl: parsed.faviconUrl || null
      }
    });
  } else {
    await prisma.brandSetting.create({
      data: {
        ...parsed,
        supportPhone: parsed.supportPhone || null,
        faviconUrl: parsed.faviconUrl || null
      }
    });
  }

  await logAdminAction({ adminId: admin.id, action: "BRANDING_UPDATED", entityType: "BrandSetting", entityId: current?.id ?? "new" });
  revalidatePath("/");
  revalidatePath("/admin/branding");
  redirect("/admin/branding?updated=1");
}

export async function upsertTranslationAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = translationSchema.parse({
    id: sanitizeText(formData.get("id"), 40) || undefined,
    locale: sanitizeText(formData.get("locale"), 2),
    namespace: sanitizeText(formData.get("namespace"), 80),
    key: sanitizeText(formData.get("key"), 120),
    value: sanitizeMultilineText(formData.get("value"), 2000)
  });

  const translation = parsed.id
    ? await prisma.translation.update({
        where: { id: parsed.id },
        data: {
          locale: parsed.locale,
          namespace: parsed.namespace,
          key: parsed.key,
          value: parsed.value
        }
      })
    : await prisma.translation.upsert({
        where: {
          locale_namespace_key: {
            locale: parsed.locale,
            namespace: parsed.namespace,
            key: parsed.key
          }
        },
        update: { value: parsed.value },
        create: parsed
      });

  await logAdminAction({
    adminId: admin.id,
    action: parsed.id ? "TRANSLATION_UPDATED" : "TRANSLATION_UPSERTED",
    entityType: "Translation",
    entityId: translation.id,
    details: { locale: translation.locale, namespace: translation.namespace, key: translation.key }
  });

  revalidatePath("/");
  revalidatePath("/admin/translations");
  redirect(`/admin/translations?locale=${parsed.locale}`);
}

export async function deleteTranslationAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = sanitizeText(formData.get("id"), 40);
  const locale = sanitizeText(formData.get("locale"), 2) || "fr";

  await prisma.translation.delete({ where: { id } });

  await logAdminAction({
    adminId: admin.id,
    action: "TRANSLATION_DELETED",
    entityType: "Translation",
    entityId: id,
    details: { locale }
  });

  revalidatePath("/");
  revalidatePath("/admin/translations");
  redirect(`/admin/translations?locale=${locale}`);
}
