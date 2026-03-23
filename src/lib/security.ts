import bcrypt from "bcrypt";
import { createHash, randomBytes } from "crypto";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function sanitizeText(value: FormDataEntryValue | string | null | undefined, maxLength = 5000) {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeMultilineText(value: FormDataEntryValue | string | null | undefined, maxLength = 12000) {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\r/g, "")
    .trim()
    .slice(0, maxLength);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createRandomToken() {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function generateTicketNumber() {
  const now = new Date();
  const date = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`;
  const suffix = randomBytes(2).toString("hex").toUpperCase();
  return `YP-${date}-${suffix}`;
}

export function safeFilename(originalName: string) {
  const ext = originalName.includes(".") ? originalName.slice(originalName.lastIndexOf(".")).toLowerCase() : "";
  return `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
}

export function getClientIp(headerValue: string | null) {
  if (!headerValue) return "local";
  return headerValue.split(",")[0]?.trim() || "local";
}
