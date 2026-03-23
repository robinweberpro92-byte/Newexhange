import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { createRandomToken, hashToken, normalizeEmail } from "@/lib/security";
import { passwordResetRequestSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const rate = checkRateLimit(`password-reset:${ip}`, 5, 60_000);

  if (!rate.success) {
    return NextResponse.json({ message: "Too many reset attempts. Please retry shortly." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = passwordResetRequestSchema.parse(body);
    const email = normalizeEmail(parsed.email);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: "If this account exists, a reset flow has been generated." });
    }

    const token = createRandomToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password/${token}`;

    return NextResponse.json({
      message: "Password reset flow created.",
      resetUrl: process.env.NODE_ENV === "production" ? undefined : resetUrl
    });
  } catch (error) {
    console.error("PASSWORD_RESET_CREATE_ERROR", error);
    return NextResponse.json({ message: "Unable to create reset token." }, { status: 400 });
  }
}
