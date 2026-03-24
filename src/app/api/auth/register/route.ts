import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { hashPassword, normalizeEmail } from "@/lib/security";
import { registerSchema } from "@/lib/validators/auth";

function buildDefaultName(email: string) {
  const localPart = email.split("@")[0] ?? "member";
  const cleaned = localPart.replace(/[._-]+/g, " ").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  const firstName = words[0] ? `${words[0].charAt(0).toUpperCase()}${words[0].slice(1)}` : "New";
  const lastName = words[1] ? `${words[1].charAt(0).toUpperCase()}${words[1].slice(1)}` : "Member";
  return { firstName, lastName };
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const rate = checkRateLimit(`register:${ip}`, 8, 60_000);
  if (!rate.success) {
    return NextResponse.json({ error: "Too many registration attempts. Please retry shortly." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = registerSchema.parse(body);
    const email = normalizeEmail(parsed.email);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account already exists with this email." }, { status: 409 });
    }

    const defaultTier = await prisma.loyaltyTier.findFirst({
      where: { isDefault: true },
      orderBy: { sortOrder: "asc" }
    });

    const passwordHash = await hashPassword(parsed.password);
    const { firstName, lastName } = buildDefaultName(email);

    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        phone: null,
        country: null,
        language: "fr",
        role: Role.USER,
        loyaltyTierId: defaultTier?.id,
        notificationPreferences: {
          marketing: false,
          ticketEmails: true,
          securityEmails: true
        }
      }
    });

    return NextResponse.json({ success: true, message: "Account created successfully. Please sign in to continue." }, { status: 201 });
  } catch (error) {
    console.error("REGISTER_ERROR", error);
    return NextResponse.json({ error: "Unable to create account." }, { status: 400 });
  }
}
