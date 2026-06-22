import { parseCheckoutDraft } from './checkoutDraft';

describe('parseCheckoutDraft', () => {
  test('returns a recoverable error when saved checkout data is missing', () => {
    expect(parseCheckoutDraft(null)).toEqual({
      ok: false,
      reason: 'missing',
    });
  });

  test('returns a recoverable error when saved checkout data is not valid JSON', () => {
    expect(parseCheckoutDraft('{not-json')).toEqual({
      ok: false,
      reason: 'invalid-json',
    });
  });

  test('returns a recoverable error when checkout items are empty', () => {
    expect(parseCheckoutDraft(JSON.stringify({ items: [], deliveryOption: 'standard' }))).toEqual({
      ok: false,
      reason: 'empty-items',
    });
  });

  test('normalizes valid checkout data for rendering', () => {
    const result = parseCheckoutDraft(JSON.stringify({
      items: [{
        productId: 'product-1',
        size: 'M',
        color: 'black',
        quantity: 1,
        price: 12000,
      }],
      deliveryOption: 'express',
      selectedCoupon: 'coupon-1',
    }));

    expect(result).toEqual({
      ok: true,
      draft: {
        items: [{
          productId: 'product-1',
          size: 'M',
          color: 'black',
          quantity: 1,
          price: 12000,
        }],
        deliveryOption: 'express',
        selectedCoupon: 'coupon-1',
        pricingPreview: undefined,
      },
    });
  });
});
