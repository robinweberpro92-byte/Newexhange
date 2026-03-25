"use server";

import { TicketStatus, TransactionStatus, TransactionType } from "@prisma/client";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTicketNumber, sanitizeMultilineText, sanitizeText, verifyPassword, hashPassword } from "@/lib/security";
import { estimateAssetAmount, pickTemplate } from "@/lib/exchange";
import { passwordChangeSchema, profileSchema, ticketCreateSchema, ticketReplySchema, exchangeRequestSchema } from "@/lib/validators/domain";
import { parseBoolean, parseNumber } from "@/lib/utils";

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();

  const parsed = profileSchema.parse({
    firstName: sanitizeText(formData.get("firstName"), 80),
    lastName: sanitizeText(formData.get("lastName"), 80),
    phone: sanitizeText(formData.get("phone"), 40),
    country: sanitizeText(formData.get("country"), 80),
    language: sanitizeText(formData.get("language"), 2),
    marketingEmails: parseBoolean(formData.get("marketingEmails")),
    ticketEmails: parseBoolean(formData.get("ticketEmails")),
    securityEmails: parseBoolean(formData.get("securityEmails"))
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      phone: parsed.phone || null,
      country: parsed.country || null,
      language: parsed.language,
      notificationPreferences: {
        marketing: parsed.marketingEmails,
        ticketEmails: parsed.ticketEmails,
        securityEmails: parsed.securityEmails
      }
    }
  });

  const cookieStore = await cookies();
  cookieStore.set("yasarpack_locale", parsed.language, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });

  revalidatePath("/dashboard/profile");
  redirect("/dashboard/profile?updated=1");
}

export async function changePasswordAction(formData: FormData) {
  const user = await requireUser();

  const parsed = passwordChangeSchema.parse({
    currentPassword: sanitizeText(formData.get("currentPassword"), 200),
    newPassword: sanitizeText(formData.get("newPassword"), 200),
    confirmPassword: sanitizeText(formData.get("confirmPassword"), 200)
  });

  const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!freshUser) {
    redirect("/login");
  }

  const isValid = await verifyPassword(parsed.currentPassword, freshUser.passwordHash);
  if (!isValid) {
    redirect("/dashboard/profile?passwordError=1");
  }

  const passwordHash = await hashPassword(parsed.newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash }
  });

  revalidatePath("/dashboard/profile");
  redirect("/dashboard/profile?passwordUpdated=1");
}

export async function createTicketAction(formData: FormData) {
  const user = await requireUser();

  const parsed = ticketCreateSchema.parse({
    subject: sanitizeText(formData.get("subject"), 160),
    message: sanitizeMultilineText(formData.get("message"), 4000),
    priority: sanitizeText(formData.get("priority"), 20),
    category: sanitizeText(formData.get("category"), 20)
  });

  const ticket = await prisma.ticket.create({
    data: {
      number: generateTicketNumber(),
      userId: user.id,
      subject: parsed.subject,
      priority: parsed.priority,
      category: parsed.category,
      status: TicketStatus.OPEN,
      lastMessageAt: new Date(),
      messages: {
        create: {
          authorId: user.id,
          authorRole: user.role,
          message: parsed.message
        }
      }
    }
  });

  revalidatePath("/dashboard/support");
  redirect(`/dashboard/support/${ticket.id}?created=1`);
}

export async function replyTicketAction(formData: FormData) {
  const user = await requireUser();

  const parsed = ticketReplySchema.parse({
    ticketId: sanitizeText(formData.get("ticketId"), 40),
    message: sanitizeMultilineText(formData.get("message"), 8000),
    isInternal: false
  });

  const ticket = await prisma.ticket.findFirst({
    where: {
      id: parsed.ticketId,
      userId: user.id
    }
  });

  if (!ticket) {
    redirect("/dashboard/support");
  }

  await prisma.$transaction([
    prisma.ticketMessage.create({
      data: {
        ticketId: parsed.ticketId,
        authorId: user.id,
        authorRole: user.role,
        message: parsed.message,
        isInternal: false
      }
    }),
    prisma.ticket.update({
      where: { id: parsed.ticketId },
      data: {
        status: TicketStatus.IN_PROGRESS,
        lastMessageAt: new Date()
      }
    })
  ]);

  revalidatePath(`/dashboard/support/${parsed.ticketId}`);
  redirect(`/dashboard/support/${parsed.ticketId}`);
}

export async function closeTicketAction(formData: FormData) {
  const user = await requireUser();
  const ticketId = sanitizeText(formData.get("ticketId"), 40);

  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,
      userId: user.id
    }
  });

  if (!ticket) {
    redirect("/dashboard/support");
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: TicketStatus.CLOSED
    }
  });

  revalidatePath("/dashboard/support");
  redirect(`/dashboard/support/${ticketId}?closed=1`);
}

export async function createExchangeRequestAction(formData: FormData) {
  const user = await requireUser();

  const parsed = exchangeRequestSchema.parse({
    paymentMethodId: sanitizeText(formData.get("paymentMethodId"), 40),
    operation: sanitizeText(formData.get("operation"), 20),
    sourceAmount: parseNumber(formData.get("sourceAmount")),
    sourceCurrency: sanitizeText(formData.get("sourceCurrency"), 16).toUpperCase(),
    targetAsset: sanitizeText(formData.get("targetAsset"), 16).toUpperCase(),
    destinationDetails: sanitizeText(formData.get("destinationDetails"), 240),
    referenceMessage: sanitizeText(formData.get("referenceMessage"), 500),
    notes: sanitizeMultilineText(formData.get("notes"), 2000)
  });

  const paymentMethod = await prisma.paymentMethod.findUnique({ where: { id: parsed.paymentMethodId } });
  if (!paymentMethod || !paymentMethod.active || paymentMethod.maintenanceMode) {
    redirect("/dashboard/exchange?error=method");
  }

  const estimate = estimateAssetAmount(parsed.sourceAmount, parsed.targetAsset, Number(paymentMethod.feePercent), Number(paymentMethod.feeFixed));

  const transaction = await prisma.transaction.create({
    data: {
      userId: user.id,
      type: parsed.operation as TransactionType,
      asset: parsed.targetAsset,
      amount: estimate.assetAmount,
      fiatCurrency: parsed.sourceCurrency,
      fiatAmount: parsed.sourceAmount,
      feeAmount: estimate.feeValue,
      paymentMethodId: paymentMethod.id,
      status: paymentMethod.requiresProof ? TransactionStatus.UNDER_REVIEW : TransactionStatus.PENDING,
      txReference: generateTicketNumber().replace("YP-", "TX-"),
      notes: parsed.notes || null,
      metadata: {
        sourceAmount: parsed.sourceAmount,
        sourceCurrency: parsed.sourceCurrency,
        destinationDetails: parsed.destinationDetails,
        referenceMessage: parsed.referenceMessage || pickTemplate(paymentMethod, Date.now()),
        instructionsTitle: paymentMethod.instructionsTitle,
        instructionsBody: paymentMethod.instructionsBody,
        recipientLabel: paymentMethod.recipientLabel,
        recipientValue: paymentMethod.recipientValue,
        paymentLink: paymentMethod.paymentLink,
        requiresProof: paymentMethod.requiresProof,
        proofHelpText: paymentMethod.proofHelpText,
        supportDiscordUrl: paymentMethod.supportDiscordUrl,
        supportTelegramUrl: paymentMethod.supportTelegramUrl
      }
    }
  });

  revalidatePath("/dashboard/exchange");
  revalidatePath("/dashboard/transactions");
  redirect(`/dashboard/exchange?created=${transaction.id}`);
}
