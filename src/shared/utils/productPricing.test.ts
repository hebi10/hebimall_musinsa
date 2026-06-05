import { getProductPricing } from './productPricing';

describe('productPricing', () => {
  test('uses price as current sale price when originalPrice already contains the list price', () => {
    expect(getProductPricing({
      price: 985000,
      originalPrice: 1250000,
      saleRate: 21,
    })).toEqual({
      listPrice: 1250000,
      salePrice: 985000,
      discountAmount: 265000,
      discountRate: 21,
    });
  });

  test('falls back to saleRate only when originalPrice is not available', () => {
    expect(getProductPricing({
      price: 10000,
      saleRate: 25,
    })).toEqual({
      listPrice: 10000,
      salePrice: 7500,
      discountAmount: 2500,
      discountRate: 25,
    });
  });
});
