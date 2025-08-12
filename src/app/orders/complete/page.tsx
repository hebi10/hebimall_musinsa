"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "../../_components/PageHeader";
import Button from "../../_components/Button";
import styles from "./page.module.css";

interface OrderResult {
  orderId: string;
  orderNumber: string;
  items: any[];
  totalAmount: number;
  deliveryAddress: any;
  paymentMethod: string;
  createdAt: Date;
}

export default function OrderCompletePage() {
  const router = useRouter();
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);

  useEffect(() => {
    // 세션 스토리지에서 주문 결과 가져오기
    const savedOrderResult = sessionStorage.getItem("orderResult");
    if (savedOrderResult) {
      setOrderResult(JSON.parse(savedOrderResult));
      // 주문 완료 후 세션 스토리지 정리
      sessionStorage.removeItem("orderResult");
    } else {
      // 주문 결과가 없으면 홈으로 리다이렉트
      router.push("/");
    }
  }, [router]);

  if (!orderResult) {
    return <div>로딩 중...</div>;
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "card": return "신용카드";
      case "bank": return "계좌이체";
      case "virtual": return "무통장입금";
      case "phone": return "휴대폰 결제";
      default: return method;
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader
        title="주문 완료"
        description="주문이 성공적으로 완료되었습니다"
        breadcrumb={[
          { label: '홈', href: '/' },
          { label: '주문 완료' }
        ]}
      />
      
      <div className={styles.content}>
        <div className={styles.completeCard}>
          {/* 성공 메시지 */}
          <div className={styles.successSection}>
            <div className={styles.successIcon}>✅</div>
            <h2 className={styles.successTitle}>주문이 완료되었습니다!</h2>
            <p className={styles.successMessage}>
              주문번호: <strong>{orderResult.orderNumber}</strong>
            </p>
            <p className={styles.successDescription}>
              주문 확인 및 배송 준비 후 배송이 시작됩니다.<br />
              주문 상세 정보는 마이페이지에서 확인하실 수 있습니다.
            </p>
          </div>

          {/* 주문 정보 */}
          <div className={styles.orderInfo}>
            <h3 className={styles.sectionTitle}>주문 정보</h3>
            
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>주문번호</span>
                <span className={styles.infoValue}>{orderResult.orderNumber}</span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>주문일시</span>
                <span className={styles.infoValue}>
                  {new Date(orderResult.createdAt).toLocaleString('ko-KR')}
                </span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>결제금액</span>
                <span className={styles.infoValue}>
                  {orderResult.totalAmount.toLocaleString()}원
                </span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>결제수단</span>
                <span className={styles.infoValue}>
                  {getPaymentMethodText(orderResult.paymentMethod)}
                </span>
              </div>
            </div>
          </div>

          {/* 주문 상품 */}
          <div className={styles.orderProducts}>
            <h3 className={styles.sectionTitle}>주문 상품</h3>
            <div className={styles.productsList}>
              {orderResult.items.map((item, index) => (
                <div key={index} className={styles.productItem}>
                  <div className={styles.productImage}>
                    <img src={item.productImage} alt={item.productName} />
                  </div>
                  <div className={styles.productInfo}>
                    <div className={styles.productBrand}>{item.brand}</div>
                    <div className={styles.productName}>{item.productName}</div>
                    <div className={styles.productOptions}>
                      {item.color} / {item.size} / 수량 {item.quantity}개
                    </div>
                  </div>
                  <div className={styles.productPrice}>
                    {(item.price * item.quantity).toLocaleString()}원
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 배송 정보 */}
          <div className={styles.deliveryInfo}>
            <h3 className={styles.sectionTitle}>배송 정보</h3>
            <div className={styles.addressCard}>
              <div className={styles.addressHeader}>
                <span className={styles.addressName}>{orderResult.deliveryAddress.name}</span>
              </div>
              <div className={styles.addressRecipient}>
                {orderResult.deliveryAddress.recipient} | {orderResult.deliveryAddress.phone}
              </div>
              <div className={styles.addressLocation}>
                ({orderResult.deliveryAddress.zipCode}) {orderResult.deliveryAddress.address} {orderResult.deliveryAddress.detailAddress}
              </div>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className={styles.actionButtons}>
            <Link href="/mypage/order-list" className={styles.primaryButton}>
              주문 내역 보기
            </Link>
            <Link href="/" className={styles.secondaryButton}>
              쇼핑 계속하기
            </Link>
          </div>

          {/* 안내 사항 */}
          <div className={styles.noticeSection}>
            <div className={styles.noticeTitle}>📋 주문 후 안내사항</div>
            <ul className={styles.noticeList}>
              <li><strong>주문 확인:</strong> 주문 후 1-2시간 내에 주문 확인 문자를 발송해드립니다</li>
              <li><strong>배송 준비:</strong> 주문 확인 후 1-2일 내에 배송 준비가 완료됩니다</li>
              <li><strong>배송 조회:</strong> 배송 시작 시 운송장 번호를 문자로 안내해드립니다</li>
              <li><strong>주문 변경/취소:</strong> 배송 준비 전까지만 가능합니다</li>
              <li><strong>문의 사항:</strong> 고객센터 1588-0000 또는 온라인 문의를 이용해주세요</li>
            </ul>
          </div>

          {/* 추천 상품 섹션 */}
          <div className={styles.recommendSection}>
            <div className={styles.recommendTitle}>🎯 이런 상품은 어떠세요?</div>
            <p className={styles.recommendDescription}>
              방금 구매하신 상품과 잘 어울리는 추천 상품들입니다
            </p>
            <Link href="/main/recommend" className={styles.recommendButton}>
              추천 상품 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
