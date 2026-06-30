import CartPage from './page';
import { redirect } from 'next/navigation';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('CartPage', () => {
  test('redirects to the Firebase-backed order cart page', () => {
    CartPage();

    expect(redirect).toHaveBeenCalledWith('/orders/cart');
  });
});
