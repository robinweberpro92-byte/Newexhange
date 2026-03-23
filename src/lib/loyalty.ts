import { LoyaltyPointType, TransactionStatus, type LoyaltyTier, type Transaction } from "@prisma/client";
import { getLoyaltySettings } from "@/lib/cms";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";

async function getTierBasisPoints(userId: string, currentBalance: number) {
  const settings = await getLoyaltySettings();
  if (settings.tierMode === "BALANCE") return currentBalance;

  const aggregate = await prisma.loyaltyPointHistory.aggregate({
    where: {
      userId,
      type: {
        in: [LoyaltyPointType.EARN, LoyaltyPointType.BONUS, LoyaltyPointType.MANUAL_ADJUSTMENT, LoyaltyPointType.REVERSAL]
      }
    },
    _sum: {
      points: true
    }
  });

  return aggregate._sum.points ?? currentBalance;
}

export async function recalculateUserTier(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, loyaltyPoints: true, loyaltyTierId: true }
  });
  if (!user) return null;

  const tiers = await prisma.loyaltyTier.findMany({
    where: { isActive: true },
    orderBy: { thresholdPoints: "asc" }
  });
  if (!tiers.length) return null;

  const basisPoints = await getTierBasisPoints(userId, user.loyaltyPoints);
  const nextTier = tiers.filter((tier) => basisPoints >= tier.thresholdPoints).at(-1) ?? tiers[0];

  if (nextTier && user.loyaltyTierId !== nextTier.id) {
    await prisma.user.update({
      where: { id: userId },
      data: { loyaltyTierId: nextTier.id }
    });
  }

  return nextTier;
}

function calculatePoints(transaction: Transaction, paymentBonus: number, multiplier: number, baseRate: number) {
  const fiatAmount = toNumber(transaction.fiatAmount);
  const raw = Math.floor(fiatAmount * baseRate * multiplier) + paymentBonus;
  return Math.max(0, raw);
}

export async function awardLoyaltyForTransaction(transactionId: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      user: {
        include: { loyaltyTier: true }
      },
      paymentMethod: true,
      loyaltyEvents: true
    }
  });

  if (!transaction || transaction.status !== TransactionStatus.COMPLETED) return null;

  const alreadyAwarded = transaction.loyaltyEvents.some((entry) => entry.type === LoyaltyPointType.EARN);
  if (alreadyAwarded) return null;

  const settings = await getLoyaltySettings();
  if (!settings.enabled) return null;

  const multiplier = transaction.user.loyaltyTier ? toNumber(transaction.user.loyaltyTier.bonusMultiplier) : 1;
  const paymentBonus = settings.paymentMethodBonusEnabled ? transaction.paymentMethod?.loyaltyBonusPoints ?? 0 : 0;
  const points = calculatePoints(transaction, paymentBonus, multiplier, settings.baseRate);
  const newBalance = transaction.user.loyaltyPoints + points;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: transaction.user.id },
      data: { loyaltyPoints: newBalance }
    }),
    prisma.loyaltyPointHistory.create({
      data: {
        userId: transaction.user.id,
        transactionId: transaction.id,
        type: LoyaltyPointType.EARN,
        points,
        balanceAfter: newBalance,
        note: `Auto-awarded after transaction ${transaction.txReference}`,
        metadata: {
          baseRate: settings.baseRate,
          paymentBonus,
          multiplier
        }
      }
    })
  ]);

  await recalculateUserTier(transaction.user.id);

  return points;
}

export async function reverseLoyaltyForTransaction(transactionId: string, note = "Transaction status changed") {
  const reward = await prisma.loyaltyPointHistory.findFirst({
    where: {
      transactionId,
      type: LoyaltyPointType.EARN
    },
    include: {
      user: true,
      transaction: true
    }
  });

  if (!reward) return null;

  const alreadyReversed = await prisma.loyaltyPointHistory.findFirst({
    where: {
      transactionId,
      type: LoyaltyPointType.REVERSAL
    }
  });

  if (alreadyReversed) return null;

  const newBalance = reward.user.loyaltyPoints - reward.points;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: reward.userId },
      data: { loyaltyPoints: newBalance }
    }),
    prisma.loyaltyPointHistory.create({
      data: {
        userId: reward.userId,
        transactionId,
        type: LoyaltyPointType.REVERSAL,
        points: -reward.points,
        balanceAfter: newBalance,
        note
      }
    })
  ]);

  await recalculateUserTier(reward.userId);

  return reward.points;
}

export async function adjustUserPoints(userId: string, delta: number, note: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, loyaltyPoints: true }
  });
  if (!user) return null;

  const newBalance = user.loyaltyPoints + delta;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { loyaltyPoints: newBalance }
    }),
    prisma.loyaltyPointHistory.create({
      data: {
        userId,
        type: LoyaltyPointType.MANUAL_ADJUSTMENT,
        points: delta,
        balanceAfter: newBalance,
        note
      }
    })
  ]);

  await recalculateUserTier(userId);

  return newBalance;
}

export async function getNextLoyaltyTier(currentTier: LoyaltyTier | null, currentPoints: number) {
  const tiers = await prisma.loyaltyTier.findMany({
    where: { isActive: true },
    orderBy: { thresholdPoints: "asc" }
  });

  return tiers.find((tier) => tier.thresholdPoints > currentPoints && tier.id !== currentTier?.id) ?? null;
}
