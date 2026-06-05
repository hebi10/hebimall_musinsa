 "use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "../../_components/PageHeader";
import { useAuth } from "@/context/authProvider";
import { useCoupon } from "@/context/couponProvider";
import { usePoint } from "@/context/pointProvider";
import { OrderService } from "@/shared/services/orderService";
import { calculateOrderPreview } from "@/shared/utils/orderPricing";
import styles from "./page.module.css";

interface CheckoutItem {
  productId: string;
  id?: string;
  size: string;
  color: string;
  quantity: number;
  productName?: string;
  productImage?: string;
  brand?: string;
  price: number;
  discountAmount?: number;
}

interface CheckoutDraft {
  items: CheckoutItem[];
  selectedCoupon?: string;
  deliveryOption: "standard" | "express";
  pricingPreview?: {
    subtotal: number;
    productDiscountAmount: number;
    couponDiscount: number;
    deliveryFee: number;
    finalAmount: number;
  };
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

const paymentMethods = [
  { value: "card", label: "카드 결제" },
  { value: "bank", label: "무통장입금" },
  { value: "virtual", label: "가상계좌" },
  { value: "phone", label: "휴대폰 결제" },
] as const;

const addressLabels: Record<string, string> = {
  default: "기본 배송지",
  office: "회사 배송지",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  const { userCoupons } = useCoupon();
  const { pointBalance } = usePoint();

  const [orderData, setOrderData] = useState<CheckoutDraft | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<(typeof paymentMethods)[number]["value"]>("card");
  const [usePoints, setUsePoints] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [addresses] = useState<DeliveryAddress[]>([
    {
      id: "addr1",
      name: "default",
      recipient: userData?.name || "",
      phone: "010-1234-5678",
      address: "seoul",
      detailAddress: "101-202",
      zipCode: "06234",
      isDefault: true,
    },
    {
      id: "addr2",
      name: "office",
      recipient: userData?.name || "",
      phone: "010-1234-5678",
      address: "seoul",
      detailAddress: "room 15",
      zipCode: "06789",
      isDefault: false,
    },
  ]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/orders/checkout");
      return;
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const savedOrderData = sessionStorage.getItem("orderData");
    if (!savedOrderData) {
      router.push("/orders/cart");
      return;
    }

    const parsed = JSON.parse(savedOrderData) as CheckoutDraft;
    if (!parsed.items?.length) {
      router.push("/orders/cart");
      return;
    }

    setOrderData({
      items: parsed.items,
      selectedCoupon: parsed.selectedCoupon,
      deliveryOption: parsed.deliveryOption === "express" ? "express" : "standard",
      pricingPreview: parsed.pricingPreview,
    });
  }, [router]);

  useEffect(() => {
    const defaultAddress = addresses.find((address) => address.isDefault);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
    }
  }, [addresses]);

  const selectedCouponView = userCoupons?.find((coupon) => coupon.id === orderData?.selectedCoupon) || null;
  const orderPreview = useMemo(() => {
    if (!orderData) {
      return null;
    }

    return calculateOrderPreview({
      items: orderData.items.map((item) => ({
        productId: item.productId,
        price: item.price,
        discountAmount: item.discountAmount,
        quantity: item.quantity,
        isAvailable: true,
      })),
      deliveryOption: orderData.deliveryOption,
      selectedCoupon: selectedCouponView,
      requestedPointAmount: usePoints,
      pointBalance,
    });
  }, [orderData, selectedCouponView, usePoints, pointBalance]);

  const subtotal = orderPreview?.subtotal ?? 0;
  const discountAmount = orderPreview?.productDiscountAmount ?? 0;
  const couponDiscount = orderPreview?.couponDiscount ?? 0;
  const deliveryFee = orderPreview?.deliveryFee ?? 0;
  const maxUsablePoints = orderPreview?.maxUsablePoints ?? 0;
  const finalAmount = orderPreview?.finalAmount ?? 0;

  const handlePointChange = (raw: string) => {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      setUsePoints(0);
      return;
    }
    setUsePoints(Math.max(0, Math.min(maxUsablePoints, Math.floor(parsed))));
  };

  const handleCompleteOrder = async () => {
    if (!orderData || !selectedAddress || !agreeTerms) {
      alert("필수 정보를 입력해주세요.");
      return;
    }

    if (!orderData.items.length) {
      alert("주문 대상 상품이 없습니다.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await OrderService.createOrder({
        items: orderData.items.map((item) => ({
          productId: item.productId,
          id: item.id,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
        deliveryAddress: {
          id: selectedAddress.id,
          name: selectedAddress.name,
          recipient: selectedAddress.recipient,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          detailAddress: selectedAddress.detailAddress,
          zipCode: selectedAddress.zipCode,
          isDefault: selectedAddress.isDefault,
        },
        paymentMethod,
        deliveryOption: orderData.deliveryOption,
        selectedCoupon: orderPreview?.usableCoupon?.id || undefined,
        requestedPointAmount: orderPreview?.pointUsed ?? usePoints,
      });

      sessionStorage.setItem("orderResult", JSON.stringify({ orderId: response.orderId }));
      router.push(`/orders/complete?orderId=${encodeURIComponent(response.orderId)}`);
    } catch (error) {
      console.error("order create failed:", error);
      alert("주문 처리 중 문제가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || !user || !orderData || !selectedAddress) {
    return <div>로그인 / 주문 정보 확인 중...</div>;
  }

  return (
    <div className={styles.container}>
      <PageHeader
        title="주문/결제"
        description="주문 상품과 배송 정보를 확인하고 결제를 진행하세요"
        breadcrumb={[
          { label: "홈", href: "/" },
          { label: "장바구니", href: "/orders/cart" },
          { label: "주문/결제" },
        ]}
      />
      <div className={styles.content}>
        <div className={styles.checkoutLayout}>
          <div className={styles.orderSection}>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>상품</h3>
              <div className={styles.orderItems}>
                {orderData.items.map((item) => (
                  <div key={`${item.productId}-${item.size}-${item.color}`} className={styles.orderItem}>
                    <div className={styles.itemInfo}>
                      {item.brand && <div className={styles.itemBrand}>{item.brand}</div>}
                      <div className={styles.itemName}>{item.productName || item.productId}</div>
                      <div className={styles.itemOptions}>{item.color} / {item.size} / 수량 {item.quantity}</div>
                    </div>
                    <div className={styles.itemPrice}>
                      {(Math.max(0, item.price) * item.quantity).toLocaleString()}원
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>배송 주소</h3>
              <div className={styles.addressList}>
                {addresses.map((address) => (
                  <label key={address.id} className={styles.addressOption}>
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress.id === address.id}
                      onChange={() => setSelectedAddress(address)}
                    />
                    <div className={styles.addressContent}>
                      <div className={styles.addressHeader}>
                        <span className={styles.addressName}>{addressLabels[address.name] || address.name}</span>
                      </div>
                      <div className={styles.addressRecipient}>{address.recipient} | {address.phone}</div>
                      <div className={styles.addressLocation}>
                        {`(${address.zipCode}) ${address.address} ${address.detailAddress}`}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>결제 방식</h3>
              <div className={styles.paymentMethods}>
                {paymentMethods.map((method) => (
                  <label key={method.value} className={styles.paymentMethod}>
                    <input
                      type="radio"
                      name="payment"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value)}
                    />
                    <span className={styles.methodLabel}>{method.label}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>포인트 사용</h3>
              <div className={styles.pointSection}>
                <div className={styles.pointInfo}>
                  <span>가용 포인트: {pointBalance.toLocaleString()}원</span>
                  <span className={styles.pointNote}>이번 주문에는 최대 {maxUsablePoints.toLocaleString()}원까지 사용할 수 있습니다.</span>
                </div>
                <div className={styles.pointInput}>
                  <input
                    type="number"
                    value={usePoints}
                    onChange={(event) => handlePointChange(event.target.value)}
                    max={maxUsablePoints}
                  />
                  <button type="button" className={styles.maxButton} onClick={() => setUsePoints(maxUsablePoints)}>
                    전액 사용
                  </button>
                </div>
              </div>
            </section>
          </div>

          <aside className={styles.paymentSummary}>
            <div className={styles.summaryContent}>
              <h3 className={styles.summaryTitle}>최종 금액</h3>
              <div className={styles.summaryItems}>
                <div className={styles.summaryItem}>
                  <span>상품 금액</span>
                  <span>{subtotal.toLocaleString()}원</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>상품 할인</span>
                  <span>-{discountAmount.toLocaleString()}원</span>
                </div>
                {couponDiscount > 0 && (
                  <div className={styles.summaryItem}>
                    <span>쿠폰 할인</span>
                    <span>-{couponDiscount.toLocaleString()}원</span>
                  </div>
                )}
                <div className={styles.summaryItem}>
                  <span>배송비</span>
                  <span>{deliveryFee ? `${deliveryFee.toLocaleString()}원` : "무료"}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>포인트 사용</span>
                  <span>-{usePoints.toLocaleString()}원</span>
                </div>
                <div className={styles.summaryDivider} />
                <div className={styles.totalAmount}>
                  <span>최종 결제금액</span>
                  <span>{finalAmount.toLocaleString()}원</span>
                </div>
              </div>

              <label className={styles.termsCheck}>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(event) => setAgreeTerms(event.target.checked)}
                />
                <span>결제 진행 동의</span>
              </label>

              <button
                className={styles.checkoutButton}
                onClick={handleCompleteOrder}
                disabled={!agreeTerms || isProcessing}
              >
                {isProcessing ? "주문 처리 중..." : `${finalAmount.toLocaleString()}원 주문하기`}
              </button>

              <Link href="/orders/cart" className={styles.backButton}>
                뒤로가기
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
