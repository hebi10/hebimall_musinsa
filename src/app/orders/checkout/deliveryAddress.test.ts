import { buildCheckoutDeliveryAddresses } from './deliveryAddress';

describe('buildCheckoutDeliveryAddresses', () => {
  test('uses the latest loaded user name as the recipient', () => {
    const addresses = buildCheckoutDeliveryAddresses({ name: '홍길동' });

    expect(addresses[0]).toMatchObject({
      id: 'addr1',
      name: 'default',
      recipient: '홍길동',
      phone: '010-1234-5678',
      address: 'seoul',
      detailAddress: '101-202',
      zipCode: '06234',
      isDefault: true,
    });
  });

  test('falls back to Firebase display name or a safe placeholder when profile name is not loaded', () => {
    expect(buildCheckoutDeliveryAddresses(null, '테스트사용자')[0].recipient).toBe('테스트사용자');
    expect(buildCheckoutDeliveryAddresses(null, '')[0].recipient).toBe('고객');
  });
});
