"use client";

import { useState } from "react";
import Link from "next/link";
import PageHeader from "../_components/PageHeader";
import Button from "../_components/Button";
import styles from "./page.module.css";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "오버사이즈 후드티",
      brand: "STYNA",
      price: 89000,
      originalPrice: 129000,
      quantity: 1,
      size: "L",
      color: "블랙",
      selected: true,
    },
    {
      id: 2,
      name: "슬림핏 청바지",
      brand: "DENIM CO",
      price: 79000,
      originalPrice: null,
      quantity: 1,
      size: "32",
      color: "인디고",
      selected: true,
    },
    {
      id: 3,
      name: "캐주얼 스니커즈",
      brand: "SNEAKER",
      price: 159000,
      originalPrice: 199000,
      quantity: 1,
      size: "270",
      color: "화이트",
      selected: false,
    },
  ]);

  const [selectAll, setSelectAll] = useState(false);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setCartItems(items =>
      items.map(item => ({ ...item, selected: newSelectAll }))
    );
  };

  const toggleItemSelect = (id: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const selectedItems = cartItems.filter(item => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 50000 ? 0 : 3000;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className={styles.container}>
        <PageHeader
          title="장바구니"
          description="선택한 상품들을 확인하세요"
          breadcrumb={[
            { label: '홈', href: '/' },
            { label: '장바구니' }
          ]}
        />
        
        <div className={styles.content}>
          <div className={styles.emptyCart}>
            <div className={styles.emptyIcon}></div>
            <h2 className={styles.emptyTitle}>장바구니가 비어있습니다</h2>
            <p className={styles.emptyDescription}>
              원하는 상품을 장바구니에 담아보세요.<br />
              지금 쇼핑을 시작해보세요!
            </p>
            <Link href="/main/recommend">
              <Button size="lg">쇼핑 계속하기</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageHeader
        title="장바구니"
        description={`${cartItems.length}개의 상품이 담겨있습니다`}
        breadcrumb={[
          { label: '홈', href: '/' },
          { label: '장바구니' }
        ]}
      />
      
      <div className={styles.content}>
        <div className={styles.cartLayout}>
          {/* 장바구니 아이템 */}
          <div className={styles.cartItems}>
            <div className={styles.cartHeader}>
              <h2 className={styles.cartTitle}>장바구니 ({cartItems.length})</h2>
              <label className={styles.selectAll}>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
                전체선택
              </label>
            </div>

            {cartItems.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemCheckbox}>
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleItemSelect(item.id)}
                  />
                </div>
                
                <div className={styles.itemImage}></div>
                
                <div className={styles.itemDetails}>
                  <p className={styles.itemBrand}>{item.brand}</p>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <p className={styles.itemOptions}>
                    옵션: {item.color} / {item.size}
                  </p>
                  
                  <div className={styles.itemActions}>
                    <div className={styles.quantityControl}>
                      <button
                        className={styles.quantityButton}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <input
                        className={styles.quantityInput}
                        type="text"
                        value={item.quantity}
                        readOnly
                      />
                      <button
                        className={styles.quantityButton}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    
                    <button
                      className={styles.removeButton}
                      onClick={() => removeItem(item.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
                
                <div className={styles.itemPrice}>
                  {item.originalPrice && (
                    <p className={styles.originalPrice}>
                      {item.originalPrice.toLocaleString()}원
                    </p>
                  )}
                  <p className={styles.salePrice}>
                    {(item.price * item.quantity).toLocaleString()}원
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 주문 요약 */}
          <div className={styles.orderSummary}>
            <h3 className={styles.summaryTitle}>주문 요약</h3>
            
            <div className={styles.shippingInfo}>
              <div className={styles.shippingTitle}>무료배송 안내</div>
              <div className={styles.shippingText}>
                50,000원 이상 구매 시 무료배송<br />
                {subtotal < 50000 && `${(50000 - subtotal).toLocaleString()}원 더 담으면 무료배송!`}
              </div>
            </div>
            
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>상품금액</span>
              <span className={styles.summaryValue}>{subtotal.toLocaleString()}원</span>
            </div>
            
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>배송비</span>
              <span className={styles.summaryValue}>
                {shipping === 0 ? '무료' : `${shipping.toLocaleString()}원`}
              </span>
            </div>
            
            <div className={styles.summaryDivider}></div>
            
            <div className={styles.totalAmount}>
              <span className={styles.totalLabel}>총 결제금액</span>
              <span className={styles.totalValue}>{total.toLocaleString()}원</span>
            </div>
            
            <button 
              className={styles.checkoutButton}
              disabled={selectedItems.length === 0}
            >
              주문하기 ({selectedItems.length}개)
            </button>
            
            <Link href="/main/recommend">
              <button className={styles.continueShoppingButton}>
                쇼핑 계속하기
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
