const USER_COUPON_AVAILABLE_STATUSES = ["사용가능", "available", "ACTIVE"];

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
