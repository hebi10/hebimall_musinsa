export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  brand: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  discountAmount: number;
  isAvailable: boolean;
}

export interface AddToCartRequest {
  productId: string;
  size: string;
  color: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  cartItemId: string;
  quantity: number;
}
