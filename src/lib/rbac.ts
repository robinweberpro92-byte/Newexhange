import { Role } from "@prisma/client";

export const adminRoles = [
  Role.ADMIN,
  Role.SUPER_ADMIN,
  Role.SUPPORT_ADMIN,
  Role.CONTENT_ADMIN,
  Role.FINANCE_ADMIN,
  Role.COMPLIANCE_ADMIN,
  Role.ANALYST
] as const;

export const elevatedAdminRoles = [
  Role.ADMIN,
  Role.SUPER_ADMIN,
  Role.FINANCE_ADMIN,
  Role.COMPLIANCE_ADMIN,
  Role.CONTENT_ADMIN,
  Role.SUPPORT_ADMIN
] as const;

export function isAdminRole(role?: Role | null): boolean {
  return Boolean(role && adminRoles.includes(role));
}

export function isSuperAdminRole(role?: Role | null): boolean {
  return role === Role.SUPER_ADMIN;
}

export function canManageAdmins(role?: Role | null): boolean {
  return role === Role.SUPER_ADMIN;
}

export function roleLabel(role: Role) {
  switch (role) {
    case Role.SUPER_ADMIN:
      return "Super admin";
    case Role.ADMIN:
      return "Admin";
    case Role.SUPPORT_ADMIN:
      return "Support admin";
    case Role.CONTENT_ADMIN:
      return "Content admin";
    case Role.FINANCE_ADMIN:
      return "Finance admin";
    case Role.COMPLIANCE_ADMIN:
      return "Compliance admin";
    case Role.ANALYST:
      return "Analyst";
    default:
      return "User";
  }
}
