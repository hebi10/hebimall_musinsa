export interface ProductPricingInput {
  price: number;
  originalPrice?: number;
  saleRate?: number;
}

export interface ProductPricing {
  listPrice: number;
  salePrice: number;
  discountAmount: number;
  discountRate: number;
}

function toNonNegativeNumber(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.max(0, parsed);
}

function clampDiscountRate(value: unknown): number {
  return Math.max(0, Math.min(100, Math.floor(toNonNegativeNumber(value))));
}

export function getProductPricing(product: ProductPricingInput): ProductPricing {
  const price = toNonNegativeNumber(product.price);
  const originalPrice = toNonNegativeNumber(product.originalPrice);

  if (originalPrice > price && price > 0) {
    const discountAmount = Math.max(0, originalPrice - price);
    return {
      listPrice: originalPrice,
      salePrice: price,
      discountAmount,
      discountRate: Math.round((discountAmount / originalPrice) * 100),
    };
  }

  const discountRate = clampDiscountRate(product.saleRate);
  const salePrice = discountRate > 0
    ? Math.max(0, Math.floor(price * (1 - discountRate / 100)))
    : price;

  return {
    listPrice: price,
    salePrice,
    discountAmount: Math.max(0, price - salePrice),
    discountRate,
  };
}
