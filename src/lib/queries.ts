import { ReviewStatus, TicketStatus, TransactionStatus, TransactionType } from "@prisma/client";
import { getBrandSettings } from "@/lib/branding";
import { getContactContent, getFinalCtaContent, getFooterContent, getHeroContent, getLoyaltySettings, getTrustContent } from "@/lib/cms";
import { prisma } from "@/lib/prisma";
import { getNextLoyaltyTier } from "@/lib/loyalty";
import { buildReferralCode } from "@/lib/referral";
import { toNumber } from "@/lib/utils";

export async function getMarketingData(locale: "fr" | "en") {
  const [brand, hero, trust, finalCta, footer, contact, paymentMethods, tiers, reviews, faqs] = await Promise.all([
    getBrandSettings(),
    getHeroContent(locale),
    getTrustContent(locale),
    getFinalCtaContent(locale),
    getFooterContent(),
    getContactContent(),
    withFallback(
      () => prisma.paymentMethod.findMany({
        where: {
          active: true,
          displayInHero: true
        },
        orderBy: { sortOrder: "asc" }
      }),
      [] as any[],
      "marketing payment methods"
    ),
    withFallback(
      () => prisma.loyaltyTier.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" }
      }),
      [] as any[],
      "marketing loyalty tiers"
    ),
    withFallback(
      () => prisma.review.findMany({
        where: {
          locale,
          status: ReviewStatus.APPROVED,
          featured: true
        },
        orderBy: [{ sortOrder: "asc" }, { displayDate: "desc" }],
        take: 6
      }),
      [] as any[],
      "marketing reviews"
    ),
    withFallback(
      () => prisma.faqItem.findMany({
        where: {
          locale,
          active: true
        },
        orderBy: { sortOrder: "asc" },
        take: 8
      }),
      [] as any[],
      "marketing faqs"
    )
  ]);

  return { brand, hero, trust, finalCta, footer, contact, paymentMethods, tiers, reviews, faqs };
}

export async function getWalletData(userId: string) {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      status: TransactionStatus.COMPLETED
    },
    orderBy: { createdAt: "desc" }
  });

  const assets = new Map<string, { asset: string; balance: number; estimatedValue: number; transactionCount: number }>();

  for (const tx of transactions) {
    const amount = toNumber(tx.amount);
    const fiatValue = toNumber(tx.fiatAmount);
    const direction = tx.type === TransactionType.SELL || tx.type === TransactionType.WITHDRAWAL ? -1 : 1;
    const current = assets.get(tx.asset) ?? { asset: tx.asset, balance: 0, estimatedValue: 0, transactionCount: 0 };

    current.balance += direction * amount;
    current.estimatedValue += direction * fiatValue;
    current.transactionCount += 1;

    assets.set(tx.asset, current);
  }

  const rows = Array.from(assets.values()).sort((a, b) => b.estimatedValue - a.estimatedValue);
  const totalEstimatedValue = rows.reduce((sum, row) => sum + row.estimatedValue, 0);

  return {
    rows,
    totalEstimatedValue
  };
}

export async function getUserOverviewData(userId: string) {
  const [user, recentTransactions, latestKyc, openTicketCount, wallet] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, include: { loyaltyTier: true } }),
    prisma.transaction.findMany({
      where: { userId },
      include: { paymentMethod: true },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.kycSubmission.findFirst({
      where: { userId },
      orderBy: { submittedAt: "desc" }
    }),
    prisma.ticket.count({
      where: {
        userId,
        status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.WAITING_ON_USER] }
      }
    }),
    getWalletData(userId)
  ]);

  if (!user) return null;

  const nextTier = await getNextLoyaltyTier(user.loyaltyTier, user.loyaltyPoints);

  return {
    user,
    recentTransactions,
    latestKyc,
    openTicketCount,
    wallet,
    nextTier
  };
}

export function getUserTransactionsData(userId: string, filters?: { status?: string; type?: string }) {
  return prisma.transaction.findMany({
    where: {
      userId,
      ...(filters?.status ? { status: filters.status as TransactionStatus } : {}),
      ...(filters?.type ? { type: filters.type as TransactionType } : {})
    },
    include: {
      paymentMethod: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getUserLoyaltyData(userId: string, email: string) {
  const [user, history, settings] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, include: { loyaltyTier: true } }),
    prisma.loyaltyPointHistory.findMany({
      where: { userId },
      include: { transaction: true },
      orderBy: { createdAt: "desc" },
      take: 15
    }),
    getLoyaltySettings()
  ]);

  if (!user) return null;
  const nextTier = await getNextLoyaltyTier(user.loyaltyTier, user.loyaltyPoints);

  return {
    user,
    history,
    settings,
    nextTier,
    referralCode: buildReferralCode(user.id, email)
  };
}

export function getUserTicketsData(userId: string) {
  return prisma.ticket.findMany({
    where: { userId },
    include: {
      _count: {
        select: { messages: true }
      },
      assignedAdmin: {
        select: { firstName: true, lastName: true }
      }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export function getUserTicketDetail(userId: string, ticketId: string) {
  return prisma.ticket.findFirst({
    where: { id: ticketId, userId },
    include: {
      assignedAdmin: true,
      messages: {
        where: { isInternal: false },
        include: { author: true },
        orderBy: { createdAt: "asc" }
      }
    }
  });
}

export async function getAdminOverviewData() {
  const [totalUsers, activeUsers, totalTransactions, volumeAggregate, pendingKyc, openTickets, pendingReviews, activePayments, recentLogs, recentTransactions] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.transaction.count(),
      prisma.transaction.aggregate({
        where: { status: TransactionStatus.COMPLETED },
        _sum: { fiatAmount: true }
      }),
      prisma.kycSubmission.count({ where: { status: "PENDING" } }),
      prisma.ticket.count({
        where: { status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.WAITING_ON_USER] } }
      }),
      prisma.review.count({ where: { status: ReviewStatus.PENDING } }),
      prisma.paymentMethod.count({ where: { active: true } }),
      prisma.adminLog.findMany({
        include: { admin: true },
        orderBy: { createdAt: "desc" },
        take: 8
      }),
      prisma.transaction.findMany({
        include: { user: true, paymentMethod: true },
        orderBy: { createdAt: "desc" },
        take: 5
      })
    ]);

  return {
    totalUsers,
    activeUsers,
    totalTransactions,
    totalVolume: toNumber(volumeAggregate._sum.fiatAmount),
    pendingKyc,
    openTickets,
    pendingReviews,
    activePayments,
    recentLogs,
    recentTransactions
  };
}

export function getAdminUsersData(filters?: { q?: string; role?: string; active?: string; kyc?: string }) {
  const search = filters?.q?.trim();

  return prisma.user.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } }
            ]
          }
        : {}),
      ...(filters?.role ? { role: filters.role as never } : {}),
      ...(filters?.active ? { isActive: filters.active === "true" } : {}),
      ...(filters?.kyc ? { kycStatus: filters.kyc as never } : {})
    },
    include: {
      loyaltyTier: true,
      _count: {
        select: {
          transactions: true,
          tickets: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getAdminUserDetail(userId: string) {
  const [user, transactions, tickets, latestKyc, loyaltyHistory] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, include: { loyaltyTier: true } }),
    prisma.transaction.findMany({ where: { userId }, include: { paymentMethod: true }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.ticket.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 10 }),
    prisma.kycSubmission.findFirst({ where: { userId }, orderBy: { submittedAt: "desc" }, include: { reviewedBy: true } }),
    prisma.loyaltyPointHistory.findMany({ where: { userId }, include: { transaction: true }, orderBy: { createdAt: "desc" }, take: 10 })
  ]);

  return { user, transactions, tickets, latestKyc, loyaltyHistory };
}

export function getAdminTransactionsData(filters?: { status?: string; type?: string; q?: string }) {
  const query = filters?.q?.trim();

  return prisma.transaction.findMany({
    where: {
      ...(filters?.status ? { status: filters.status as TransactionStatus } : {}),
      ...(filters?.type ? { type: filters.type as TransactionType } : {}),
      ...(query
        ? {
            OR: [
              { txReference: { contains: query, mode: "insensitive" } },
              { user: { email: { contains: query, mode: "insensitive" } } },
              { asset: { contains: query, mode: "insensitive" } }
            ]
          }
        : {})
    },
    include: {
      user: true,
      paymentMethod: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export function getAdminTransactionDetail(transactionId: string) {
  return prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      user: { include: { loyaltyTier: true } },
      paymentMethod: true,
      loyaltyEvents: true
    }
  });
}

export function getAdminTicketsData(filters?: { status?: string; priority?: string }) {
  return prisma.ticket.findMany({
    where: {
      ...(filters?.status ? { status: filters.status as TicketStatus } : {}),
      ...(filters?.priority ? { priority: filters.priority as never } : {})
    },
    include: {
      user: true,
      assignedAdmin: true,
      _count: { select: { messages: true } }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export function getAdminTicketDetail(ticketId: string) {
  return prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      user: true,
      assignedAdmin: true,
      messages: {
        include: { author: true },
        orderBy: { createdAt: "asc" }
      }
    }
  });
}
