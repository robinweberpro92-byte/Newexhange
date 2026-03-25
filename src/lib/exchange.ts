import { PaymentMethod, TransactionStatus, TransactionType } from "@prisma/client";
import { toNumber } from "@/lib/utils";

export const supportedAssets = ["BTC", "LTC", "ETH", "USDT"] as const;

export const assetRatesEUR: Record<string, number> = {
  BTC: 61500,
  LTC: 82,
  ETH: 3200,
  USDT: 1,
  EUR: 1
};

export const manualFlowStatusLabels: Record<TransactionStatus, string> = {
  PENDING: "Payment submitted",
  UNDER_REVIEW: "Pending admin review",
  COMPLETED: "Completed",
  FAILED: "Rejected",
  CANCELLED: "Cancelled"
};

export function estimateAssetAmount(sourceAmountEUR: number, targetAsset: string, feePercent = 0, feeFixed = 0) {
  const feeValue = feeFixed + sourceAmountEUR * (feePercent / 100);
  const netAmount = Math.max(sourceAmountEUR - feeValue, 0);
  const rate = assetRatesEUR[targetAsset] ?? 1;
  const assetAmount = rate > 0 ? netAmount / rate : 0;
  return {
    feeValue,
    netAmount,
    assetAmount,
    rate
  };
}

export function getPaymentMessageTemplates(method?: Pick<PaymentMethod, "messageTemplates" | "name" | "referenceValue"> | null) {
  const raw = method?.messageTemplates;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.filter((value): value is string => typeof value === "string" && value.trim().length > 0);
  }

  const reference = method?.referenceValue || "Order reference";
  return [
    `Payment for ${reference}`,
    `Exchange request – ${reference}`,
    `Manual payment confirmation – ${reference}`
  ];
}

export function pickTemplate(method?: Pick<PaymentMethod, "messageTemplates" | "name" | "referenceValue"> | null, seed = 0) {
  const templates = getPaymentMessageTemplates(method);
  if (templates.length === 0) return "";
  return templates[Math.abs(seed) % templates.length];
}

export function getOperationLabel(type: TransactionType | string) {
  switch (type) {
    case "BUY":
      return "Buy";
    case "SELL":
      return "Sell";
    case "DEPOSIT":
      return "Deposit";
    case "WITHDRAWAL":
      return "Withdrawal";
    default:
      return String(type);
  }
}

export function formatSupportedAssets(method?: { supportedAssets?: unknown } | null) {
  const assets = Array.isArray(method?.supportedAssets)
    ? (method!.supportedAssets as unknown[]).filter((v): v is string => typeof v === "string")
    : supportedAssets;
  return assets.length ? assets.join(" • ") : supportedAssets.join(" • ");
}

export function getMethodFeeSummary(method?: { feeFixed?: unknown; feePercent?: unknown } | null) {
  if (!method) return "Transparent fees shown before confirmation";
  return `${toNumber(method.feePercent)}% + €${toNumber(method.feeFixed).toFixed(2)}`;
}
