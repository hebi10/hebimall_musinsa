"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "../../_components/PageHeader";
import Button from "../../_components/Button";
import { useAuth } from "@/context/authProvider";
import { usePoint } from "@/context/pointProvider";
import { CartService } from "@/shared/services/cartService";
import { OrderService } from "@/shared/services/orderService";
import { PaymentMethod } from "@/shared/types/order";
import styles from "./page.module.css";

interface OrderData {
  items: any[];
  subtotal: number;
  couponDiscount: number;
  deliveryFee: number;
  finalAmount: number;
  selectedCoupon: string;
  deliveryOption: string;
}

interface DeliveryAddress {
  id: string;
  name: string;
  recipient: string;
  phone: string;
  address: string;
  detailAddress: string;
  zipCode: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const { pointBalance, usePoint: usePointAction } = usePoint();
  
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [usePoints, setUsePoints] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // 더미 배송지 데이터
  const [addresses] = useState<DeliveryAddress[]>([
    {
      id: "addr1",
      name: "집",
      recipient: userData?.name || "홍길동",
      phone: "010-1234-5678",
      address: "서울특별시 강남구 역삼동 123-45",
      detailAddress: "101동 202호",
      zipCode: "06234",
      isDefault: true
    },
    {
      id: "addr2",
      name: "회사",
      recipient: userData?.name || "홍길동",
      phone: "010-1234-5678",
      address: "서울특별시 서초구 서초동 678-90",
      detailAddress: "오피스텔 15층",
      zipCode: "06789",
      isDefault: false
    }
  ]);

  useEffect(() => {
    // 세션 스토리지에서 주문 데이터 가져오기
    const savedOrderData = sessionStorage.getItem("orderData");
    if (savedOrderData) {
      setOrderData(JSON.parse(savedOrderData));
    } else {
      // 주문 데이터가 없으면 장바구니로 리다이렉트
      router.push("/orders/cart");
    }

    // 기본 배송지 선택
    const defaultAddress = addresses.find(addr => addr.isDefault);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
    }
  }, [router, addresses]);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login?redirect=/orders/checkout");
    }
  }, [user, router]);

  // 적립금 사용 처리
  const handlePointChange = (value: number) => {
    const maxPoints = Math.min(pointBalance, orderData?.finalAmount || 0);
    const points = Math.max(0, Math.min(maxPoints, value));
    setUsePoints(points);
  };

  // 최종 결제 금액 계산
  const finalPaymentAmount = (orderData?.finalAmount || 0) - usePoints;

  // 주문 완료 처리
  const handleCompleteOrder = async () => {
    if (!orderData || !selectedAddress || !agreeTerms) {
      alert("필수 정보를 모두 입력해주세요.");
      return;
    }

    setIsProcessing(true);

    try {
      // 결제 처리 시뮬레이션 (실제로는 결제 API 호출)
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기

      // 주문 번호 생성
      const orderNumber = `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

      // 결제 수단 텍스트 변환
      const getPaymentMethodText = (method: string): PaymentMethod => {
        switch (method) {
          case "card": return "카드결제";
          case "bank": return "계좌이체";
          case "virtual": return "무통장입금";
          case "phone": return "phone";
          default: return "기타";
        }
      };

      // Firebase에 주문 저장
      const newOrderData = {
        userId: user.uid,
        orderNumber,
        products: orderData!.items.map((item: any) => ({
          id: `${item.productId}-${item.size}-${item.color}`,
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.price,
          discountAmount: 0,
          brand: item.brand,
        })),
        totalAmount: orderData!.finalAmount,
        discountAmount: orderData!.couponDiscount || 0,
        deliveryFee: orderData!.deliveryFee || 0,
        finalAmount: finalPaymentAmount,
        status: 'pending' as const,
        paymentMethod: getPaymentMethodText(paymentMethod),
        deliveryAddress: {
          id: selectedAddress.id,
          name: selectedAddress.name,
          recipient: selectedAddress.recipient,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          detailAddress: selectedAddress.detailAddress,
          zipCode: selectedAddress.zipCode,
          isDefault: selectedAddress.isDefault
        }
      };

      const orderId = await OrderService.createOrder(newOrderData);

      // 주문 결과 객체 생성
      const orderResult = {
        orderId,
        orderNumber,
        items: orderData!.items,
        totalAmount: finalPaymentAmount,
        deliveryAddress: selectedAddress,
        paymentMethod,
        createdAt: new Date()
      };

      // 적립금 사용 처리
      if (usePoints > 0) {
        try {
          await usePointAction({
            amount: usePoints,
            description: "상품 구매",
            orderId: orderResult.orderId
          });
        } catch (pointError) {
          console.error('포인트 사용 실패:', pointError);
          // 포인트 사용 실패 시에도 주문은 진행하되, 사용자에게 알림
          alert(`주문은 완료되었지만 포인트 사용에 실패했습니다: ${pointError instanceof Error ? pointError.message : '알 수 없는 오류'}`);
        }
      }

      // 장바구니 비우기 (주문 완료 후)
      if (user?.uid) {
        try {
          await CartService.clearCart(user.uid);
        } catch (cartError) {
          console.error('장바구니 비우기 실패:', cartError);
        }
      }

      // 추가 처리 시간 (사용자에게 완료 메시지 표시)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 세션 스토리지 정리
      sessionStorage.removeItem("orderData");
      
      // 주문 완료 페이지로 이동
      sessionStorage.setItem("orderResult", JSON.stringify(orderResult));
      
      // 사용자에게 완료 알림 후 페이지 이동
      alert("결제가 성공적으로 완료되었습니다!\n주문 상세 정보 페이지로 이동합니다.");
      router.push("/orders/complete");

    } catch (error) {
      console.error("주문 처리 실패:", error);
      alert("주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user || !orderData) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className={styles.container}>
      <PageHeader
        title="주문서 작성"
        description="주문 정보를 확인하고 결제를 진행하세요"
        breadcrumb={[
          { label: '홈', href: '/' },
          { label: '장바구니', href: '/cart' },
          { label: '주문/결제', href: '/orders/cart' },
          { label: '주문서 작성' }
        ]}
      />
      
      <div className={styles.content}>
        <div className={styles.checkoutLayout}>
          {/* 주문 정보 */}
          <div className={styles.orderSection}>
            {/* 주문 상품 */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>주문 상품</h3>
              <div className={styles.orderItems}>
                {orderData.items.map((item, index) => (
                  <div key={index} className={styles.orderItem}>
                    <div className={styles.itemImage}>
                      <img src={item.productImage} alt={item.productName} />
                    </div>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemBrand}>{item.brand}</div>
                      <div className={styles.itemName}>{item.productName}</div>
                      <div className={styles.itemOptions}>
                        {item.color} / {item.size} / 수량 {item.quantity}개
                      </div>
                    </div>
                    <div className={styles.itemPrice}>
                      {(item.price * item.quantity).toLocaleString()}원
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 배송지 정보 */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>배송지 정보</h3>
              <div className={styles.addressList}>
                {addresses.map((address) => (
                  <label key={address.id} className={styles.addressOption}>
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress?.id === address.id}
                      onChange={() => setSelectedAddress(address)}
                    />
                    <div className={styles.addressContent}>
                      <div className={styles.addressHeader}>
                        <span className={styles.addressName}>{address.name}</span>
                        {address.isDefault && (
                          <span className={styles.defaultBadge}>기본</span>
                        )}
                      </div>
                      <div className={styles.addressRecipient}>
                        {address.recipient} | {address.phone}
                      </div>
                      <div className={styles.addressLocation}>
                        ({address.zipCode}) {address.address} {address.detailAddress}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <button className={styles.addAddressButton}>
                + 새 배송지 추가
              </button>
            </div>

            {/* 결제 수단 */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>결제 수단</h3>
              <div className={styles.paymentMethods}>
                {[
                  { value: "card", label: "신용카드", desc: "간편하고 안전한 카드 결제" },
                  { value: "bank", label: "계좌이체", desc: "실시간 계좌이체" },
                  { value: "virtual", label: "무통장입금", desc: "가상계좌 입금" },
                  { value: "phone", label: "휴대폰 결제", desc: "휴대폰 소액결제" }
                ].map((method) => (
                  <label key={method.value} className={styles.paymentMethod}>
                    <input
                      type="radio"
                      name="payment"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className={styles.methodContent}>
                      <div className={styles.methodLabel}>{method.label}</div>
                      <div className={styles.methodDesc}>{method.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 적립금 사용 */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>적립금 사용</h3>
              <div className={styles.pointSection}>
                <div className={styles.pointInfo}>
                  <span>보유 적립금: {pointBalance.toLocaleString()}원</span>
                  <span className={styles.pointNote}>
                    (최대 {Math.min(pointBalance, orderData.finalAmount).toLocaleString()}원 사용 가능)
                  </span>
                </div>
                <div className={styles.pointInput}>
                  <input
                    type="number"
                    value={usePoints}
                    onChange={(e) => handlePointChange(parseInt(e.target.value) || 0)}
                    placeholder="사용할 적립금 입력"
                    max={Math.min(pointBalance, orderData.finalAmount)}
                  />
                  <button 
                    onClick={() => handlePointChange(Math.min(pointBalance, orderData.finalAmount))}
                    className={styles.maxButton}
                  >
                    전액사용
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 결제 정보 */}
          <div className={styles.paymentSummary}>
            <div className={styles.summaryContent}>
              <h3 className={styles.summaryTitle}>결제 정보</h3>
              
              <div className={styles.summaryItems}>
                <div className={styles.summaryItem}>
                  <span>상품금액</span>
                  <span>{orderData.subtotal.toLocaleString()}원</span>
                </div>
                
                {orderData.couponDiscount > 0 && (
                  <div className={styles.summaryItem}>
                    <span>쿠폰할인</span>
                    <span>-{orderData.couponDiscount.toLocaleString()}원</span>
                  </div>
                )}
                
                <div className={styles.summaryItem}>
                  <span>배송비</span>
                  <span>
                    {orderData.deliveryFee === 0 ? "무료" : `${orderData.deliveryFee.toLocaleString()}원`}
                  </span>
                </div>

                {usePoints > 0 && (
                  <div className={styles.summaryItem}>
                    <span>적립금 사용</span>
                    <span>-{usePoints.toLocaleString()}원</span>
                  </div>
                )}
              </div>

              <div className={styles.summaryDivider} />
              
              <div className={styles.totalAmount}>
                <span>최종 결제금액</span>
                <span>{finalPaymentAmount.toLocaleString()}원</span>
              </div>

              {/* 약관 동의 */}
              <div className={styles.termsSection}>
                <label className={styles.termsCheck}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <span>주문 내용을 확인했으며, 정보 제공 등에 동의합니다.</span>
                </label>
                <div className={styles.termsLinks}>
                  <Link href="/legal/terms" className={styles.termsLink}>이용약관</Link>
                  <Link href="/legal/privacy" className={styles.termsLink}>개인정보처리방침</Link>
                </div>
              </div>

              <button
                className={styles.checkoutButton}
                onClick={handleCompleteOrder}
                disabled={!agreeTerms || isProcessing}
                style={{
                  opacity: isProcessing ? 0.7 : 1,
                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span className={styles.processingSpinner}></span>
                    결제 처리 중...
                  </span>
                ) : (
                  `${finalPaymentAmount.toLocaleString()}원 결제하기`
                )}
              </button>
              
              <Link href="/orders/cart" className={styles.backButton}>
                이전 단계로
              </Link>

              {/* 안내 사항 */}
              <div className={styles.noticeSection}>
                <div className={styles.noticeTitle}>안내사항</div>
                <ul className={styles.noticeList}>
                  <li>주문 완료 후 취소/변경은 제한될 수 있습니다</li>
                  <li>결제 완료 후 즉시 상품 준비가 시작됩니다</li>
                  <li>배송 관련 문의는 고객센터로 연락해주세요</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
