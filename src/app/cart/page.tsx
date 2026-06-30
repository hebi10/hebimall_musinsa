import { redirect } from 'next/navigation';

export default function CartPage() {
  return redirect('/orders/cart');
}
