const USER_COUPON_AVAILABLE_STATUSES = ["사용가능", "available", "ACTIVE"];

export type CouponIssuePolicyResult =
  | { ok: true }
  | {
      ok: false;
      reason: "inactive" | "code_coupon_requires_register" | "expired" | "usage_limit_reached";
    };

export function normalizeCouponCode(value: unknown): string {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

export function couponHasExpired(expiryDate: unknown, now: Date = new Date()): boolean {
  const expiry = parseCouponDate(expiryDate);
  if (!expiry) {
    return true;
  }

  return startOfUtcDay(expiry).getTime() < startOfUtcDay(now).getTime();
}

export function isAvailableUserCouponStatus(status: unknown): boolean {
  return typeof status === "string" && USER_COUPON_AVAILABLE_STATUSES.includes(status);
}

export function isCouponIssuableByAction(
  couponData: Record<string, unknown> | undefined,
  now: Date = new Date(),
): CouponIssuePolicyResult {
  if (!couponData?.isActive) {
    return { ok: false, reason: "inactive" };
  }

  if (!couponData.isDirectAssign) {
    return { ok: false, reason: "code_coupon_requires_register" };
  }

  if (couponHasExpired(couponData.expiryDate, now)) {
    return { ok: false, reason: "expired" };
  }

  const usageLimit = toFiniteNumber(couponData.usageLimit);
  const usedCount = toFiniteNumber(couponData.usedCount) ?? 0;

  if (usageLimit !== null && usedCount >= usageLimit) {
    return { ok: false, reason: "usage_limit_reached" };
  }

  return { ok: true };
}

function parseCouponDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value : null;
  }

  if (value && typeof value === "object" && "toDate" in value) {
    const date = (value as { toDate: () => Date }).toDate();
    return Number.isFinite(date.getTime()) ? date : null;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  return null;
}

function startOfUtcDay(value: Date): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function toFiniteNumber(value: unknown): number | null {
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}
