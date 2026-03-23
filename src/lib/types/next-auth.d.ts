import { KycStatus, Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
      language: string;
      isActive: boolean;
      kycStatus: KycStatus;
    };
  }

  interface User {
    role: Role;
    language: string;
    isActive: boolean;
    kycStatus: KycStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    language?: string;
    isActive?: boolean;
    kycStatus?: KycStatus;
  }
}
