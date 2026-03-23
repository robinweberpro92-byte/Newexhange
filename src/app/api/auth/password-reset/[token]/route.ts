import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, hashToken } from "@/lib/security";
import { resetPasswordSchema } from "@/lib/validators/auth";

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params;
    const body = await request.json();
    const parsed = resetPasswordSchema.parse(body);
    const tokenHash = hashToken(token);

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Reset token is invalid or expired." }, { status: 400 });
    }

    const passwordHash = await hashPassword(parsed.password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() }
      })
    ]);

    return NextResponse.json({ success: true, message: "Password updated." });
  } catch (error) {
    console.error("PASSWORD_RESET_ERROR", error);
    return NextResponse.json({ error: "Unable to reset password." }, { status: 400 });
  }
}
