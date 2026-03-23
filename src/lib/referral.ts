export function buildReferralCode(userId: string, email: string) {
  const prefix = email.split("@")[0]?.slice(0, 4).toUpperCase() || "YSPR";
  return `${prefix}-${userId.replace(/[^A-Za-z0-9]/g, "").slice(0, 6).toUpperCase()}`;
}
