import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from '../types/cart';
import { Product } from '../types/product';

export class CartService {
  private static readonly COLLECTION_NAME = 'carts';

  /**
   * 사용자의 장바구니 가져오기
   */
  static async getUserCart(userId: string): Promise<Cart | null> {
    try {
      const cartRef = doc(db, this.COLLECTION_NAME, userId);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        const data = cartSnap.data();
        return {
          id: cartSnap.id,
          userId: data.userId,
          items: data.items || [],
          totalAmount: data.totalAmount || 0,
          totalItems: data.totalItems || 0,
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      }

      return null;
    } catch (error) {
      console.error('장바구니 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 장바구니에 상품 추가
   */
  static async addToCart(
    userId: string, 
    product: Product, 
    request: AddToCartRequest
  ): Promise<Cart> {
    try {
      const cartRef = doc(db, this.COLLECTION_NAME, userId);
      const existingCart = await this.getUserCart(userId);

      // 새로운 장바구니 아이템 생성
      const newCartItem: CartItem = {
        id: `${request.productId}-${request.size}-${request.color}`,
        productId: request.productId,
        productName: product.name,
        productImage: product.images[0],
        brand: product.brand,
        size: request.size,
        color: request.color,
        quantity: request.quantity,
        price: product.saleRate ? 
          Math.floor(product.price * (1 - product.saleRate / 100)) : 
          product.price,
        discountAmount: product.saleRate ? 
          Math.floor(product.price * (product.saleRate / 100)) : 
          0,
        isAvailable: product.stock > 0
      };

      let updatedItems: CartItem[] = [];
      
      if (existingCart) {
        // 기존 장바구니가 있는 경우
        const existingItemIndex = existingCart.items.findIndex(
          item => item.id === newCartItem.id
        );

        if (existingItemIndex >= 0) {
          // 같은 상품이 이미 있으면 수량 증가
          updatedItems = [...existingCart.items];
          updatedItems[existingItemIndex].quantity += request.quantity;
        } else {
          // 새로운 상품 추가
          updatedItems = [...existingCart.items, newCartItem];
        }
      } else {
        // 새로운 장바구니 생성
        updatedItems = [newCartItem];
      }

      // 총 금액 및 총 수량 계산
      const totalAmount = updatedItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );
      const totalItems = updatedItems.reduce(
        (sum, item) => sum + item.quantity, 
        0
      );

      const updatedCart: Partial<Cart> = {
        userId,
        items: updatedItems,
        totalAmount,
        totalItems,
        updatedAt: new Date()
      };

      await setDoc(cartRef, {
        ...updatedCart,
        updatedAt: serverTimestamp()
      });

      return {
        id: userId,
        ...updatedCart
      } as Cart;
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      throw error;
    }
  }

  /**
   * 장바구니 아이템 수량 업데이트
   */
  static async updateCartItem(
    userId: string, 
    request: UpdateCartItemRequest
  ): Promise<Cart> {
    try {
      const existingCart = await this.getUserCart(userId);
      if (!existingCart) {
        throw new Error('장바구니를 찾을 수 없습니다.');
      }

      const itemIndex = existingCart.items.findIndex(
        item => item.id === request.cartItemId
      );

      if (itemIndex === -1) {
        throw new Error('장바구니 아이템을 찾을 수 없습니다.');
      }

      const updatedItems = [...existingCart.items];
      if (request.quantity <= 0) {
        // 수량이 0 이하면 아이템 제거
        updatedItems.splice(itemIndex, 1);
      } else {
        // 수량 업데이트
        updatedItems[itemIndex].quantity = request.quantity;
      }

      // 총 금액 및 총 수량 재계산
      const totalAmount = updatedItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );
      const totalItems = updatedItems.reduce(
        (sum, item) => sum + item.quantity, 
        0
      );

      const cartRef = doc(db, this.COLLECTION_NAME, userId);
      await updateDoc(cartRef, {
        items: updatedItems,
        totalAmount,
        totalItems,
        updatedAt: serverTimestamp()
      });

      return {
        ...existingCart,
        items: updatedItems,
        totalAmount,
        totalItems,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('장바구니 아이템 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 장바구니에서 아이템 제거
   */
  static async removeFromCart(userId: string, cartItemId: string): Promise<Cart> {
    try {
      return await this.updateCartItem(userId, { cartItemId, quantity: 0 });
    } catch (error) {
      console.error('장바구니 아이템 제거 실패:', error);
      throw error;
    }
  }

  /**
   * 장바구니 비우기
   */
  static async clearCart(userId: string): Promise<void> {
    try {
      const cartRef = doc(db, this.COLLECTION_NAME, userId);
      await updateDoc(cartRef, {
        items: [],
        totalAmount: 0,
        totalItems: 0,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('장바구니 비우기 실패:', error);
      throw error;
    }
  }

  /**
   * 장바구니 아이템 개수 가져오기
   */
  static async getCartItemCount(userId: string): Promise<number> {
    try {
      const cart = await this.getUserCart(userId);
      return cart?.totalItems || 0;
    } catch (error) {
      console.error('장바구니 아이템 개수 조회 실패:', error);
      return 0;
    }
  }

  /**
   * 장바구니 유효성 검사 (재고 확인 등)
   */
  static async validateCart(userId: string): Promise<{
    isValid: boolean;
    invalidItems: string[];
    cart: Cart | null;
  }> {
    try {
      const cart = await this.getUserCart(userId);
      if (!cart) {
        return { isValid: true, invalidItems: [], cart: null };
      }

      const invalidItems: string[] = [];
      
      // TODO: 실제 상품 재고와 비교하여 유효성 검사
      // 현재는 isAvailable 필드만 확인
      cart.items.forEach(item => {
        if (!item.isAvailable) {
          invalidItems.push(item.id);
        }
      });

      return {
        isValid: invalidItems.length === 0,
        invalidItems,
        cart
      };
    } catch (error) {
      console.error('장바구니 유효성 검사 실패:', error);
      throw error;
    }
  }
}
