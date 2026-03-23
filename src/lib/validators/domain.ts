import { Role, ReviewStatus, TicketCategory, TicketPriority, TicketStatus, TransactionStatus } from "@prisma/client";
import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));
const hexColor = z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);

export const profileSchema = z.object({
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(80),
  phone: z.string().max(40).optional().or(z.literal("")),
  country: z.string().max(80).optional().or(z.literal("")),
  language: z.enum(["fr", "en"]),
  marketingEmails: z.boolean().default(false),
  ticketEmails: z.boolean().default(true),
  securityEmails: z.boolean().default(true)
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9]/),
    confirmPassword: z.string()
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match"
  });

export const ticketCreateSchema = z.object({
  subject: z.string().min(5).max(160),
  message: z.string().min(10).max(4000),
  priority: z.nativeEnum(TicketPriority),
  category: z.nativeEnum(TicketCategory)
});

export const ticketReplySchema = z.object({
  ticketId: z.string().cuid(),
  message: z.string().min(2).max(8000),
  isInternal: z.boolean().default(false)
});

export const transactionUpdateSchema = z.object({
  transactionId: z.string().cuid(),
  status: z.nativeEnum(TransactionStatus),
  adminNote: z.string().max(2000).optional().or(z.literal(""))
});

export const paymentMethodSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120),
  logoUrl: optionalUrl,
  description: z.string().max(500).optional().or(z.literal("")),
  active: z.boolean().default(true),
  recommended: z.boolean().default(false),
  maintenanceMode: z.boolean().default(false),
  supportBuy: z.boolean().default(true),
  supportSell: z.boolean().default(true),
  supportDeposit: z.boolean().default(true),
  supportWithdrawal: z.boolean().default(true),
  countryRestrictions: z.array(z.string().max(8)).default([]),
  displayInHero: z.boolean().default(true),
  displayInCheckout: z.boolean().default(true),
  displayInFooter: z.boolean().default(true),
  trustMessage: z.string().max(300).optional().or(z.literal("")),
  unavailableMessage: z.string().max(300).optional().or(z.literal("")),
  sortOrder: z.number().int().min(0),
  feeFixed: z.number().min(0),
  feePercent: z.number().min(0).max(100),
  estimatedDelay: z.string().max(120).optional().or(z.literal("")),
  loyaltyBonusPoints: z.number().int().min(0)
});

export const reviewSchema = z.object({
  id: z.string().cuid().optional(),
  authorName: z.string().min(2).max(120),
  country: z.string().max(80).optional().or(z.literal("")),
  avatarUrl: optionalUrl,
  rating: z.number().int().min(1).max(5),
  text: z.string().min(10).max(2000),
  locale: z.enum(["fr", "en"]),
  status: z.nativeEnum(ReviewStatus),
  featured: z.boolean().default(false),
  verifiedBadge: z.boolean().default(false),
  displayDate: z.string().optional().or(z.literal("")),
  sortOrder: z.number().int().min(0)
});

export const loyaltyTierSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(120),
  description: z.string().max(300).optional().or(z.literal("")),
  colorHex: hexColor,
  thresholdPoints: z.number().int().min(0),
  bonusMultiplier: z.number().min(1).max(5),
  perks: z.array(z.string().min(1).max(120)).default([]),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0)
});

export const loyaltySettingsSchema = z.object({
  enabled: z.boolean(),
  baseRate: z.number().min(0).max(100),
  tierMode: z.enum(["BALANCE", "TOTAL_EARNED"]),
  description: z.string().max(300).optional().or(z.literal("")),
  paymentMethodBonusEnabled: z.boolean().default(true)
});

export const adjustPointsSchema = z.object({
  userId: z.string().cuid(),
  points: z.number().int().min(-100000).max(100000),
  note: z.string().min(3).max(300)
});

export const userRoleSchema = z.object({
  userId: z.string().cuid(),
  role: z.nativeEnum(Role),
  isActive: z.boolean().optional()
});

export const userTierSchema = z.object({
  userId: z.string().cuid(),
  loyaltyTierId: z.string().cuid().optional().or(z.literal(""))
});

export const ticketAdminSchema = z.object({
  ticketId: z.string().cuid(),
  status: z.nativeEnum(TicketStatus),
  priority: z.nativeEnum(TicketPriority),
  internalNote: z.string().max(2000).optional().or(z.literal("")),
  assignedAdminId: z.string().cuid().optional().or(z.literal(""))
});

export const translationSchema = z.object({
  id: z.string().cuid().optional(),
  locale: z.enum(["fr", "en"]),
  namespace: z.string().min(1).max(80),
  key: z.string().min(1).max(120),
  value: z.string().min(1).max(2000)
});

export const faqSchema = z.object({
  id: z.string().cuid().optional(),
  locale: z.enum(["fr", "en"]),
  question: z.string().min(5).max(300),
  answer: z.string().min(10).max(3000),
  category: z.string().max(80).optional().or(z.literal("")),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0)
});

export const brandingSchema = z.object({
  brandName: z.string().min(2).max(120),
  shortName: z.string().min(2).max(40),
  legalName: z.string().min(2).max(160),
  tagline: z.string().min(2).max(120),
  supportEmail: z.string().email(),
  supportPhone: z.string().max(60).optional().or(z.literal("")),
  primaryColor: hexColor,
  secondaryColor: hexColor,
  accentColor: hexColor,
  logoText: z.string().min(1).max(8),
  faviconUrl: optionalUrl,
  metaTitle: z.string().min(3).max(160),
  metaDescription: z.string().min(10).max(300),
  footerText: z.string().min(3).max(200)
});

export const cmsHeroSchema = z.object({
  locale: z.enum(["fr", "en"]),
  badge: z.string().min(2).max(120),
  title: z.string().min(10).max(200),
  subtitle: z.string().min(10).max(400),
  primaryCtaLabel: z.string().min(2).max(80),
  secondaryCtaLabel: z.string().min(2).max(80)
});

export const cmsTrustSchema = z.object({
  locale: z.enum(["fr", "en"]),
  stat1Label: z.string().min(2).max(80),
  stat1Value: z.string().min(1).max(40),
  stat2Label: z.string().min(2).max(80),
  stat2Value: z.string().min(1).max(40),
  stat3Label: z.string().min(2).max(80),
  stat3Value: z.string().min(1).max(40),
  badge1: z.string().min(1).max(30),
  badge2: z.string().min(1).max(30),
  badge3: z.string().min(1).max(30)
});

export const cmsFinalCtaSchema = z.object({
  locale: z.enum(["fr", "en"]),
  title: z.string().min(5).max(160),
  text: z.string().min(10).max(300),
  buttonLabel: z.string().min(2).max(80)
});

export const cmsContactSchema = z.object({
  email: z.string().email(),
  phone: z.string().max(60),
  address: z.string().max(160)
});

export const cmsFooterSchema = z.object({
  aboutText: z.string().min(10).max(500),
  finalNote: z.string().min(3).max(300)
});
