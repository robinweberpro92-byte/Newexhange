import { KycStatus, Role } from "@prisma/client";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/rbac";
import { normalizeEmail, verifyPassword } from "@/lib/security";
import { loginSchema } from "@/lib/validators/auth";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NEXTAUTH_DEBUG === "true",
  pages: {
    signIn: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        portal: { label: "Portal", type: "text" }
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = normalizeEmail(parsed.data.email);
        const portal = typeof credentials?.portal === "string" ? credentials.portal : "user";
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            passwordHash: true,
            role: true,
            language: true,
            isActive: true,
            kycStatus: true
          }
        });

        if (!user || !user.isActive) return null;
        if (portal === "admin" && !isAdminRole(user.role)) return null;

        const isValid = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          role: user.role,
          language: user.language,
          isActive: user.isActive,
          kycStatus: user.kycStatus
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as { role?: Role }).role;
        token.language = (user as { language?: string }).language;
        token.isActive = (user as { isActive?: boolean }).isActive;
        token.kycStatus = (user as { kycStatus?: KycStatus }).kycStatus;
      }

      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            language: true,
            isActive: true,
            kycStatus: true
          }
        });

        if (dbUser) {
          token.email = dbUser.email;
          token.name = `${dbUser.firstName} ${dbUser.lastName}`.trim();
          token.role = dbUser.role;
          token.language = dbUser.language;
          token.isActive = dbUser.isActive;
          token.kycStatus = dbUser.kycStatus;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as Role) ?? Role.USER;
        session.user.language = (token.language as string) ?? "fr";
        session.user.isActive = Boolean(token.isActive ?? true);
        session.user.kycStatus = (token.kycStatus as KycStatus) ?? KycStatus.NOT_SUBMITTED;
      }

      return session;
    }
  }
};

export async function getCurrentSession() {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[auth] falling back to anonymous session", error);
    }
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      loyaltyTier: true
    }
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user || !user.isActive) {
    redirect("/login");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!isAdminRole(user.role)) {
    redirect("/dashboard/overview");
  }
  return user;
}
