export interface DeliveryAddress {
  id: string;
  name: string;
  recipient: string;
  phone: string;
  address: string;
  detailAddress: string;
  zipCode: string;
  isDefault: boolean;
}

interface CheckoutUserProfile {
  name?: string | null;
}

function resolveRecipient(userData: CheckoutUserProfile | null | undefined, fallbackName?: string | null): string {
  return userData?.name?.trim() || fallbackName?.trim() || '고객';
}

export function buildCheckoutDeliveryAddresses(
  userData: CheckoutUserProfile | null | undefined,
  fallbackName?: string | null
): DeliveryAddress[] {
  const recipient = resolveRecipient(userData, fallbackName);

  return [
    {
      id: 'addr1',
      name: 'default',
      recipient,
      phone: '010-1234-5678',
      address: 'seoul',
      detailAddress: '101-202',
      zipCode: '06234',
      isDefault: true,
    },
    {
      id: 'addr2',
      name: 'office',
      recipient,
      phone: '010-1234-5678',
      address: 'seoul',
      detailAddress: 'room 15',
      zipCode: '06789',
      isDefault: false,
    },
  ];
}
