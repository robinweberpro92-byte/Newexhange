import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "EUR", locale = "fr-FR") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatNumber(value: number, locale = "fr-FR") {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatDate(value: Date | string, locale = "fr-FR") {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function parseBoolean(value: FormDataEntryValue | null | undefined) {
  if (typeof value !== "string") return false;
  return value === "on" || value === "true" || value === "1";
}

export function parseNumber(value: FormDataEntryValue | null | undefined, fallback = 0) {
  if (typeof value !== "string") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toNumber(value: unknown) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "object" && "toNumber" in (value as Record<string, unknown>) && typeof (value as { toNumber: () => number }).toNumber === "function") {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}
