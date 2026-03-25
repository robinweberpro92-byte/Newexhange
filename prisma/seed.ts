import bcrypt from "bcrypt";
import { PrismaClient, Role, KycStatus, ReviewStatus, TicketCategory, TicketPriority, TicketStatus, TransactionStatus, TransactionType, LoyaltyPointType } from "@prisma/client";

const prisma = new PrismaClient();

const bootstrapAdminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL || "owner@yasarpack.com";
const bootstrapAdminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || "ChangeMe123!";

async function main() {
  await prisma.adminLog.deleteMany();
  await prisma.translation.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.review.deleteMany();
  await prisma.faqItem.deleteMany();
  await prisma.ticketMessage.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.kycSubmission.deleteMany();
  await prisma.loyaltyPointHistory.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.brandSetting.deleteMany();
  await prisma.user.deleteMany();
  await prisma.loyaltyTier.deleteMany();

  const passwordAdmin = await bcrypt.hash(bootstrapAdminPassword, 12);
  const passwordUser = await bcrypt.hash("User123!", 12);
  const passwordUser2 = await bcrypt.hash("Client123!", 12);

  const bronze = await prisma.loyaltyTier.create({
    data: {
      name: "Bronze",
      slug: "bronze",
      description: "Entry tier with standard support.",
      colorHex: "#c57b57",
      thresholdPoints: 0,
      bonusMultiplier: 1,
      perks: ["Standard support", "Basic offers"],
      isDefault: true,
      sortOrder: 1
    }
  });

  const gold = await prisma.loyaltyTier.create({
    data: {
      name: "Gold",
      slug: "gold",
      description: "Lower fees and priority support.",
      colorHex: "#f6b554",
      thresholdPoints: 5000,
      bonusMultiplier: 1.15,
      perks: ["Priority support", "Lower fees", "Exclusive promos"],
      sortOrder: 2
    }
  });

  const platinum = await prisma.loyaltyTier.create({
    data: {
      name: "Platinum",
      slug: "platinum",
      description: "VIP execution and dedicated account support.",
      colorHex: "#49a2ff",
      thresholdPoints: 15000,
      bonusMultiplier: 1.25,
      perks: ["VIP support", "Best fees", "Dedicated manager", "Early features"],
      sortOrder: 3
    }
  });

  await prisma.brandSetting.create({
    data: {
      brandName: "YasarPack",
      shortName: "Yasar",
      legalName: "YasarPack SAS",
      tagline: "Professional crypto exchange operations",
      supportEmail: "support@yasarpack.com",
      supportPhone: "+33 1 84 80 29 11",
      primaryColor: "#16c47f",
      secondaryColor: "#49a2ff",
      accentColor: "#f6b554",
      logoText: "YP",
      metaTitle: "YasarPack | Fintech & Crypto Platform",
      metaDescription: "Professional fintech and crypto operations platform with real dashboards, manual payment flows, loyalty, support and multilingual CMS.",
      footerText: "YasarPack - professional digital settlement operations."
    }
  });

  await prisma.siteSetting.createMany({
    data: [
      {
        key: "site.socials",
        locale: "global",
        value: {
          discord: "https://discord.gg/yasarpack",
          telegram: "https://t.me/yasarpack",
          twitter: "https://x.com/yasarpack"
        }
      },
      {
        key: "site.announcement",
        locale: "global",
        value: {
          active: true,
          tone: "info",
          text: "Manual payment requests are reviewed by an operator. If you need urgent help, use the support center, Discord or Telegram.",
          ctaLabel: "Support center",
          ctaUrl: "/support"
        }
      }
    ]
  });

  const admin = await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "Yasar",
      email: bootstrapAdminEmail,
      passwordHash: passwordAdmin,
      phone: "+33 6 11 22 33 44",
      country: "France",
      language: "fr",
      role: Role.SUPER_ADMIN,
      isActive: true,
      kycStatus: KycStatus.APPROVED,
      loyaltyPoints: 18420,
      loyaltyTierId: platinum.id,
      notificationPreferences: { marketing: false, ticketEmails: true, securityEmails: true }
    }
  });

  const user = await prisma.user.create({
    data: {
      firstName: "Amine",
      lastName: "K.",
      email: "user@yasarpack.com",
      passwordHash: passwordUser,
      phone: "+33 6 55 44 33 22",
      country: "France",
      language: "fr",
      role: Role.USER,
      isActive: true,
      kycStatus: KycStatus.PENDING,
      loyaltyPoints: 8420,
      loyaltyTierId: gold.id,
      notificationPreferences: { marketing: true, ticketEmails: true, securityEmails: true }
    }
  });

  const user2 = await prisma.user.create({
    data: {
      firstName: "Sofia",
      lastName: "T.",
      email: "sofia@yasarpack.com",
      passwordHash: passwordUser2,
      phone: "+41 79 100 20 30",
      country: "Switzerland",
      language: "en",
      role: Role.USER,
      isActive: true,
      kycStatus: KycStatus.APPROVED,
      loyaltyPoints: 3200,
      loyaltyTierId: bronze.id,
      notificationPreferences: { marketing: true, ticketEmails: false, securityEmails: true }
    }
  });

  const paymentMethods = {
    paypal: await prisma.paymentMethod.create({
      data: {
        name: "PayPal",
        slug: "paypal",
        description: "Trusted wallet checkout for first-time crypto buyers.",
        active: true,
        recommended: true,
        maintenanceMode: false,
        supportBuy: true,
        supportSell: false,
        supportDeposit: true,
        supportWithdrawal: false,
        countryRestrictions: [],
        displayInHero: true,
        displayInCheckout: true,
        displayInFooter: true,
        trustMessage: "Le plus rassurant pour les nouveaux utilisateurs.",
        unavailableMessage: "Temporairement indisponible pour certaines juridictions.",
        instructionsTitle: "Envoyer le paiement PayPal",
        instructionsBody: "Copiez l'identifiant admin, utilisez la reference affichee dans votre ordre, puis televersez une preuve si necessaire. La demande passe ensuite en verification manuelle.",
        recipientLabel: "PayPal email",
        recipientValue: "payments@yasarpack.com",
        paymentLink: "https://paypal.me/yasarpack",
        referenceLabel: "Reference order",
        referenceValue: "Use the generated order reference",
        requiresProof: true,
        proofHelpText: "Ajoutez une capture du paiement une fois l'envoi confirme.",
        messageTemplates: ["Manual exchange payment", "PayPal order confirmation", "Reference attached to the order"],
        supportDiscordUrl: "https://discord.gg/yasarpack",
        supportTelegramUrl: "https://t.me/yasarpack",
        sortOrder: 1,
        feeFixed: 0,
        feePercent: 1.9,
        estimatedDelay: "Instant a 15 min",
        supportedAssets: ["BTC", "LTC", "ETH", "USDT"],
        loyaltyBonusPoints: 15
      }
    }),
    visa: await prisma.paymentMethod.create({
      data: {
        name: "Visa",
        slug: "visa",
        description: "Institutional-looking card payments with transparent fees.",
        active: true,
        recommended: false,
        maintenanceMode: false,
        supportBuy: true,
        supportSell: false,
        supportDeposit: true,
        supportWithdrawal: false,
        countryRestrictions: [],
        displayInHero: true,
        displayInCheckout: true,
        displayInFooter: true,
        trustMessage: "Cartes supportees avec affichage clair des frais.",
        instructionsTitle: "Paiement carte",
        instructionsBody: "Utilisez le flux carte pour financer votre ordre. L'admin peut mettre le rail en maintenance a tout moment.",
        recipientLabel: "Checkout provider",
        recipientValue: "Configured by admin",
        sortOrder: 2,
        feeFixed: 0,
        feePercent: 2.1,
        estimatedDelay: "< 5 min",
        supportedAssets: ["BTC", "ETH", "USDT"],
        loyaltyBonusPoints: 10
      }
    }),
    bank: await prisma.paymentMethod.create({
      data: {
        name: "SEPA Bank Transfer",
        slug: "sepa-bank-transfer",
        description: "Best for larger ticket sizes and lower cost funding.",
        active: true,
        recommended: true,
        maintenanceMode: false,
        supportBuy: true,
        supportSell: true,
        supportDeposit: true,
        supportWithdrawal: true,
        countryRestrictions: ["US"],
        displayInHero: true,
        displayInCheckout: true,
        displayInFooter: true,
        trustMessage: "Idéal pour les volumes plus élevés.",
        instructionsTitle: "SEPA transfer instructions",
        instructionsBody: "Copy the bank reference exactly as shown in the order. Your transaction remains pending until the funds are received and confirmed by admin.",
        recipientLabel: "IBAN",
        recipientValue: "FR76 3000 4000 5000 6000 7000 890",
        referenceLabel: "Transfer reference",
        referenceValue: "Generated per order",
        sortOrder: 3,
        feeFixed: 1.5,
        feePercent: 0.8,
        estimatedDelay: "1-2 business days",
        supportedAssets: ["BTC", "LTC", "ETH", "USDT"],
        loyaltyBonusPoints: 25
      }
    }),
    applePay: await prisma.paymentMethod.create({
      data: {
        name: "Apple Pay",
        slug: "apple-pay",
        description: "Fast mobile checkout for premium users.",
        active: true,
        recommended: false,
        maintenanceMode: false,
        supportBuy: true,
        supportSell: false,
        supportDeposit: true,
        supportWithdrawal: false,
        countryRestrictions: [],
        displayInHero: false,
        displayInCheckout: true,
        displayInFooter: false,
        trustMessage: "Ideal pour une experience mobile premium.",
        instructionsTitle: "Mobile checkout",
        instructionsBody: "Use a supported mobile wallet and confirm your payment. Upload proof if the rail requires manual reconciliation.",
        sortOrder: 4,
        feeFixed: 0,
        feePercent: 1.8,
        estimatedDelay: "Instant",
        supportedAssets: ["BTC", "ETH", "USDT"],
        loyaltyBonusPoints: 12
      }
    }),
    paysafecard: await prisma.paymentMethod.create({
      data: {
        name: "Paysafecard",
        slug: "paysafecard",
        description: "Semi-manual code verification flow handled by an operator.",
        active: true,
        recommended: false,
        maintenanceMode: false,
        supportBuy: true,
        supportSell: false,
        supportDeposit: true,
        supportWithdrawal: false,
        supportedAssets: ["BTC", "LTC", "ETH", "USDT"],
        countryRestrictions: [],
        displayInHero: true,
        displayInCheckout: true,
        displayInFooter: true,
        trustMessage: "Code based payments can be reviewed manually before payout.",
        instructionsTitle: "Submit your Paysafecard code",
        instructionsBody: "Enter the code details, confirm the amount, then wait for admin review. You will receive a status update once the operator validates the code.",
        recipientLabel: "Code handling",
        recipientValue: "Manual review by operator",
        requiresProof: false,
        proofHelpText: "An operator typically responds within about one hour.",
        sortOrder: 5,
        feeFixed: 0,
        feePercent: 2.5,
        estimatedDelay: "Manual review",
        loyaltyBonusPoints: 8,
        supportDiscordUrl: "https://discord.gg/yasarpack",
        supportTelegramUrl: "https://t.me/yasarpack"
      }
    })
  };

  const tx1 = await prisma.transaction.create({
    data: {
      userId: user.id,
      type: TransactionType.BUY,
      asset: "BTC",
      amount: 0.245,
      fiatAmount: 15000,
      feeAmount: 285,
      paymentMethodId: paymentMethods.paypal.id,
      status: TransactionStatus.COMPLETED,
      txReference: "YAS-BUY-240301-0001",
      notes: "Homepage acquisition campaign",
      completedAt: new Date("2026-03-01T12:30:00Z")
    }
  });

  const tx2 = await prisma.transaction.create({
    data: {
      userId: user.id,
      type: TransactionType.DEPOSIT,
      asset: "USDT",
      amount: 2500,
      fiatAmount: 2500,
      feeAmount: 20,
      paymentMethodId: paymentMethods.bank.id,
      status: TransactionStatus.PENDING,
      txReference: "YAS-DEP-240317-0002",
      notes: "Awaiting settlement confirmation"
    }
  });

  const tx3 = await prisma.transaction.create({
    data: {
      userId: user.id,
      type: TransactionType.SELL,
      asset: "ETH",
      amount: 2.9,
      fiatAmount: 6100,
      feeAmount: 122,
      paymentMethodId: paymentMethods.visa.id,
      status: TransactionStatus.UNDER_REVIEW,
      txReference: "YAS-SEL-240320-0003",
      notes: "Manual compliance review"
    }
  });

  await prisma.transaction.create({
    data: {
      userId: user2.id,
      type: TransactionType.BUY,
      asset: "SOL",
      amount: 45,
      fiatAmount: 5850,
      feeAmount: 105,
      paymentMethodId: paymentMethods.applePay.id,
      status: TransactionStatus.COMPLETED,
      txReference: "YAS-BUY-240318-0004",
      completedAt: new Date("2026-03-18T09:10:00Z")
    }
  });

  await prisma.transaction.create({
    data: {
      userId: user2.id,
      type: TransactionType.WITHDRAWAL,
      asset: "USDC",
      amount: 1200,
      fiatAmount: 1200,
      feeAmount: 15,
      paymentMethodId: paymentMethods.bank.id,
      status: TransactionStatus.FAILED,
      txReference: "YAS-WDR-240319-0005",
      adminNote: "Recipient bank name mismatch."
    }
  });

  await prisma.loyaltyPointHistory.createMany({
    data: [
      {
        userId: user.id,
        transactionId: tx1.id,
        type: LoyaltyPointType.EARN,
        points: 15015,
        balanceAfter: 15015,
        note: "Buy transaction completed",
        metadata: { baseRate: 1, paymentMethodBonus: 15 }
      },
      {
        userId: user.id,
        transactionId: tx2.id,
        type: LoyaltyPointType.MANUAL_ADJUSTMENT,
        points: -6595,
        balanceAfter: 8420,
        note: "Adjustment from pre-launch migration"
      },
      {
        userId: user2.id,
        type: LoyaltyPointType.EARN,
        points: 3200,
        balanceAfter: 3200,
        note: "Onboarding bonus and first transaction"
      }
    ]
  });

  await prisma.kycSubmission.createMany({
    data: [
      {
        userId: user.id,
        status: KycStatus.PENDING,
        documentType: "passport",
        documentFrontUrl: "/uploads/kyc/mock-passport-front.pdf",
        selfieUrl: "/uploads/kyc/mock-selfie.jpg",
        submittedAt: new Date("2026-03-20T10:00:00Z")
      },
      {
        userId: user2.id,
        reviewedById: admin.id,
        status: KycStatus.APPROVED,
        documentType: "national_id",
        documentFrontUrl: "/uploads/kyc/mock-id-front.pdf",
        documentBackUrl: "/uploads/kyc/mock-id-back.pdf",
        adminComment: "Verified without discrepancy.",
        submittedAt: new Date("2026-02-14T14:10:00Z"),
        reviewedAt: new Date("2026-02-15T09:20:00Z")
      }
    ]
  });

  await prisma.review.createMany({
    data: [
      {
        authorName: "Maya L.",
        country: "France",
        rating: 5,
        text: "La nouvelle version fait beaucoup plus serieuse. Les paiements sont lisibles et le support semble enfin reel.",
        locale: "fr",
        status: ReviewStatus.APPROVED,
        featured: true,
        verifiedBadge: true,
        displayDate: new Date("2026-03-14T00:00:00Z"),
        sortOrder: 1
      },
      {
        authorName: "Nassim R.",
        country: "Belgique",
        rating: 5,
        text: "Le hero est mieux structure, les cartes respirent et tout passe beaucoup mieux sur mobile.",
        locale: "fr",
        status: ReviewStatus.APPROVED,
        featured: true,
        verifiedBadge: true,
        displayDate: new Date("2026-03-11T00:00:00Z"),
        sortOrder: 2
      },
      {
        authorName: "Sofia T.",
        country: "Switzerland",
        rating: 5,
        text: "The admin dashboard is cleaner and the name editor makes the project genuinely flexible.",
        locale: "en",
        status: ReviewStatus.APPROVED,
        featured: true,
        verifiedBadge: true,
        displayDate: new Date("2026-03-09T00:00:00Z"),
        sortOrder: 1
      },
      {
        authorName: "Ethan P.",
        country: "United Kingdom",
        rating: 4,
        text: "Waiting for local GBP withdrawals, but the UX and trust messaging are very strong.",
        locale: "en",
        status: ReviewStatus.PENDING,
        featured: false,
        verifiedBadge: false,
        displayDate: new Date("2026-03-16T00:00:00Z"),
        sortOrder: 4
      }
    ]
  });

  await prisma.faqItem.createMany({
    data: [
      {
        locale: "fr",
        question: "Quels moyens de paiement sont disponibles ?",
        answer: "Les moyens actifs sont geres dans le back-office admin avec frais, delais et restrictions pays.",
        active: true,
        sortOrder: 1,
        category: "payments"
      },
      {
        locale: "fr",
        question: "Combien de temps prend la verification KYC ?",
        answer: "Un statut temps reel est visible dans le dashboard avec commentaire admin en cas de refus.",
        active: true,
        sortOrder: 2,
        category: "kyc"
      },
      {
        locale: "en",
        question: "How are loyalty points earned?",
        answer: "Points are calculated from fiat amount, optional payment-method bonuses and configurable tier multipliers.",
        active: true,
        sortOrder: 1,
        category: "loyalty"
      },
      {
        locale: "en",
        question: "Can support tickets be tracked in-app?",
        answer: "Yes. Each ticket has a readable number, live thread, priority and status updates in the user dashboard.",
        active: true,
        sortOrder: 2,
        category: "support"
      }
    ]
  });

  const ticket = await prisma.ticket.create({
    data: {
      number: "YP-20260321-1001",
      userId: user.id,
      assignedAdminId: admin.id,
      subject: "Virement toujours en attente",
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.HIGH,
      category: TicketCategory.PAYMENT,
      internalNote: "Client VIP, keep informed about settlement ETA.",
      lastMessageAt: new Date("2026-03-21T16:30:00Z")
    }
  });

  await prisma.ticketMessage.createMany({
    data: [
      {
        ticketId: ticket.id,
        authorId: user.id,
        authorRole: Role.USER,
        message: "Bonjour, mon depot SEPA est encore en attente apres 24h."
      },
      {
        ticketId: ticket.id,
        authorId: admin.id,
        authorRole: Role.ADMIN,
        message: "Bonjour, nous avons bien recu votre dossier. Le virement est en cours de confirmation bancaire."
      },
      {
        ticketId: ticket.id,
        authorId: admin.id,
        authorRole: Role.ADMIN,
        message: "Client a relancer si pas de settlement avant 18h.",
        isInternal: true
      }
    ]
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      number: "YP-20260318-1002",
      userId: user2.id,
      assignedAdminId: admin.id,
      subject: "Need tax statement export",
      status: TicketStatus.WAITING_ON_USER,
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.ACCOUNT,
      lastMessageAt: new Date("2026-03-18T11:00:00Z")
    }
  });

  await prisma.ticketMessage.createMany({
    data: [
      {
        ticketId: ticket2.id,
        authorId: user2.id,
        authorRole: Role.USER,
        message: "Could you send me an export of this quarter transactions?"
      },
      {
        ticketId: ticket2.id,
        authorId: admin.id,
        authorRole: Role.ADMIN,
        message: "Of course. Please confirm if you need CSV only or PDF summary as well."
      }
    ]
  });

  await prisma.siteSetting.createMany({
    data: [
      {
        key: "homepage.hero",
        locale: "fr",
        value: {
          badge: "Plateforme premium securisee",
          title: "Transformez vos paiements en crypto avec plus de clarte.",
          subtitle: "Une interface plus propre, plus rassurante et plus moderne pour acheter, vendre et suivre chaque operation sans friction.",
          primaryCtaLabel: "Commencer maintenant",
          secondaryCtaLabel: "Voir comment ca marche"
        },
        description: "Hero marketing FR"
      },
      {
        key: "homepage.hero",
        locale: "en",
        value: {
          badge: "Secure premium platform",
          title: "Turn your payments into crypto with more clarity.",
          subtitle: "A cleaner, more reassuring and more modern interface to buy, sell and track every operation without friction.",
          primaryCtaLabel: "Get started",
          secondaryCtaLabel: "See how it works"
        },
        description: "Hero marketing EN"
      },
      {
        key: "homepage.trust",
        locale: "fr",
        value: {
          stats: [
            { label: "Utilisateurs actifs", value: "12.4k" },
            { label: "Volume traite", value: "€18.9M" },
            { label: "Taux KYC", value: "97.8%" }
          ],
          badges: ["SSL", "KYC", "24/7"]
        }
      },
      {
        key: "homepage.trust",
        locale: "en",
        value: {
          stats: [
            { label: "Active users", value: "12.4k" },
            { label: "Volume processed", value: "€18.9M" },
            { label: "KYC pass rate", value: "97.8%" }
          ],
          badges: ["SSL", "KYC", "24/7"]
        }
      },
      {
        key: "homepage.finalCta",
        locale: "fr",
        value: {
          title: "Pret a lancer une vraie base produit premium ?",
          text: "Auth securisee, dashboards reels, paiements administrables, loyalty, support et CMS sont deja structures dans cette base.",
          buttonLabel: "Lancer la plateforme"
        }
      },
      {
        key: "homepage.finalCta",
        locale: "en",
        value: {
          title: "Ready to ship a real premium product foundation?",
          text: "Secure auth, real dashboards, configurable payments, loyalty, support and CMS are already structured in this base.",
          buttonLabel: "Launch the platform"
        }
      },
      {
        key: "site.contact",
        locale: "global",
        value: {
          email: "support@yasarpack.com",
          phone: "+33 1 84 80 29 11",
          address: "Paris, France"
        }
      },
      {
        key: "site.footer",
        locale: "global",
        value: {
          aboutText: "YasarPack centralise les flux de paiement, la verification KYC, le support et les modules d'administration dans une base produit premium.",
          finalNote: "Les operations crypto peuvent etre soumises a verification de conformite.",
          links: [
            { label: "Privacy", href: "#" },
            { label: "Terms", href: "#" },
            { label: "Support", href: "/dashboard/support" }
          ]
        }
      },
      {
        key: "loyalty.settings",
        locale: "global",
        value: {
          enabled: true,
          baseRate: 1,
          tierMode: "BALANCE",
          description: "1 point per 1 EUR processed, plus tier and payment method bonuses.",
          paymentMethodBonusEnabled: true
        }
      }
    ]
  });

  await prisma.translation.createMany({
    data: [
      { locale: "fr", namespace: "common", key: "home", value: "Accueil" },
      { locale: "fr", namespace: "common", key: "payments", value: "Paiements" },
      { locale: "fr", namespace: "common", key: "loyalty", value: "Fidelite" },
      { locale: "fr", namespace: "common", key: "reviews", value: "Avis" },
      { locale: "fr", namespace: "common", key: "faq", value: "FAQ" },
      { locale: "en", namespace: "common", key: "home", value: "Home" },
      { locale: "en", namespace: "common", key: "payments", value: "Payments" },
      { locale: "en", namespace: "common", key: "loyalty", value: "Loyalty" },
      { locale: "en", namespace: "common", key: "reviews", value: "Reviews" },
      { locale: "en", namespace: "common", key: "faq", value: "FAQ" },
      { locale: "fr", namespace: "dashboard", key: "overviewTitle", value: "Vue d'ensemble" },
      { locale: "en", namespace: "dashboard", key: "overviewTitle", value: "Overview" },
      { locale: "fr", namespace: "admin", key: "overviewTitle", value: "Pilotage global" },
      { locale: "en", namespace: "admin", key: "overviewTitle", value: "Operations overview" }
    ]
  });

  await prisma.adminLog.createMany({
    data: [
      {
        adminId: admin.id,
        action: "SEED_BOOTSTRAP",
        entityType: "Platform",
        entityId: "seed",
        details: { source: "prisma/seed.ts", users: 3, paymentMethods: 4 }
      },
      {
        adminId: admin.id,
        action: "REVIEW_APPROVED",
        entityType: "Review",
        details: { locale: "fr", featured: true }
      }
    ]
  });

  console.log("Seed completed");
  console.log("Admin demo: admin@yasarpack.com / Admin123!");
  console.log("User demo: user@yasarpack.com / User123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
