"use server";

import {
  KycStatus,
  Role,
  TicketStatus,
  TransactionStatus
} from "@prisma/client";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-log";
import { canManageAdmins, isSuperAdminRole } from "@/lib/rbac";
import { upsertSiteSetting } from "@/lib/cms";
import {
  adjustUserPoints,
  awardLoyaltyForTransaction,
  reverseLoyaltyForTransaction
} from "@/lib/loyalty";
import { prisma } from "@/lib/prisma";
import {
  sanitizeMultilineText,
  sanitizeText,
  slugify
} from "@/lib/security";

import {
  adjustPointsSchema,
  brandingSchema,
  cmsContactSchema,
  cmsFinalCtaSchema,
  cmsFooterSchema,
  cmsHeroSchema,
  cmsTrustSchema,
  cmsSocialsSchema,
  announcementSchema,
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

/* ======================================================
   HELPERS (100% SAFE)
====================================================== */

function parseCountryRestrictions(raw: FormDataEntryValue | null) {
  if (!raw) return [];

  return sanitizeText(raw, 400)
    .split(",")
    .map((v) => v.trim().toUpperCase())
    .filter(Boolean);
}

function parseTagList(
  raw: FormDataEntryValue | null,
  normalizer: (value: string) => string = (v) => v
) {
  if (!raw) return [];

  const text = sanitizeText(raw, 5000);

  return text
    .replace(/\r/g, "")
    .split(/[\n,]+/)
    .map((v) => normalizer(v.trim()))
    .filter(Boolean);
}

function parsePerks(raw: FormDataEntryValue | null) {
  if (!raw) return [];

  return sanitizeText(raw, 1000)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

/* ======================================================
   USERS
====================================================== */

export async function toggleUserActiveAction(formData: FormData) {
  const admin = await requireAdmin();

  const parsed = userRoleSchema.parse({
    userId: sanitizeText(formData.get("userId"), 40),
    role: sanitizeText(formData.get("role"), 20),
    isActive: parseBoolean(formData.get("isActive"))
  });

  await prisma.user.update({
    where: { id: parsed.userId },
    data: { isActive: parsed.isActive }
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

  const user = await prisma.user.findUnique({
    where: { id: parsed.userId }
  });

  if (!user) redirect("/admin/users");

  if (
    (parsed.role === Role.SUPER_ADMIN ||
      isSuperAdminRole(user.role)) &&
    !canManageAdmins(admin.role)
  ) {
    redirect(`/admin/users/${parsed.userId}?roleDenied=1`);
  }

  await prisma.user.update({
    where: { id: parsed.userId },
    data: { role: parsed.role }
  });

  await logAdminAction({
    adminId: admin.id,
    action: "USER_ROLE_CHANGED",
    entityType: "User",
    entityId: parsed.userId
  });

  revalidatePath("/admin/users");
  redirect(`/admin/users/${parsed.userId}`);
}

/* ======================================================
   TRANSACTIONS
====================================================== */

export async function updateTransactionAction(formData: FormData) {
  const admin = await requireAdmin();

  const parsed = transactionUpdateSchema.parse({
    transactionId: sanitizeText(formData.get("transactionId"), 40),
    status: sanitizeText(formData.get("status"), 20),
    adminNote: sanitizeMultilineText(formData.get("adminNote"), 2000)
  });

  const current = await prisma.transaction.findUnique({
    where: { id: parsed.transactionId }
  });

  if (!current) redirect("/admin/transactions");

  await prisma.transaction.update({
    where: { id: parsed.transactionId },
    data: {
      status: parsed.status,
      adminNote: parsed.adminNote || null,
      completedAt:
        parsed.status === TransactionStatus.COMPLETED
          ? current.completedAt ?? new Date()
          : current.completedAt
    }
  });

  if (
    current.status !== TransactionStatus.COMPLETED &&
    parsed.status === TransactionStatus.COMPLETED
  ) {
    await awardLoyaltyForTransaction(parsed.transactionId);
  }

  if (
    current.status === TransactionStatus.COMPLETED &&
    parsed.status !== TransactionStatus.COMPLETED
  ) {
    await reverseLoyaltyForTransaction(
      parsed.transactionId,
      `Changed by ${admin.email}`
    );
  }

  await logAdminAction({
    adminId: admin.id,
    action: "TRANSACTION_UPDATED",
    entityType: "Transaction",
    entityId: parsed.transactionId
  });

  revalidatePath("/admin/transactions");
  redirect(`/admin/transactions/${parsed.transactionId}`);
}

/* ======================================================
   PAYMENT METHODS (SAFE FIXED)
====================================================== */

export async function upsertPaymentMethodAction(formData: FormData) {
  const admin = await requireAdmin();

  const parsed = paymentMethodSchema.parse({
    id: sanitizeText(formData.get("id"), 40) || undefined,
    name: sanitizeText(formData.get("name"), 120),
    slug: slugify(
      sanitizeText(formData.get("slug"), 120) ||
        sanitizeText(formData.get("name"), 120)
    ),
    messageTemplatesRaw: sanitizeMultilineText(
      formData.get("messageTemplatesRaw"),
      5000
    )
  });

  const data = {
    name: parsed.name,
    slug: parsed.slug,
    messageTemplates: parseTagList(parsed.messageTemplatesRaw)
  };

  const paymentMethod = parsed.id
    ? await prisma.paymentMethod.update({
        where: { id: parsed.id },
        data
      })
    : await prisma.paymentMethod.create({ data });

  await logAdminAction({
    adminId: admin.id,
    action: parsed.id
      ? "PAYMENT_METHOD_UPDATED"
      : "PAYMENT_METHOD_CREATED",
    entityType: "PaymentMethod",
    entityId: paymentMethod.id
  });

  revalidatePath("/admin/payments");
  redirect("/admin/payments");
}