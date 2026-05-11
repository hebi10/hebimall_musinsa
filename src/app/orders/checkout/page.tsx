 "use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "../../_components/PageHeader";
import { useAuth } from "@/context/authProvider";
import { usePoint } from "@/context/pointProvider";
import { OrderService } from "@/shared/services/orderService";
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
  { value: "card", label: "card" },
  { value: "bank", label: "bank" },
  { value: "virtual", label: "virtual" },
  { value: "phone", label: "phone" },
] as const;

const getDeliveryFee = (subtotal: number, option: CheckoutDraft["deliveryOption"]) => {
  if (option === "express") {
    return 5000;
  }
  return subtotal >= 50000 ? 0 : 3000;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
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
    if (!user) {
      router.push("/auth/login?redirect=/orders/checkout");
      return;
    }
  }, [user, router]);

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
    });
  }, [router]);

  useEffect(() => {
    const defaultAddress = addresses.find((address) => address.isDefault);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
    }
  }, [addresses]);

  const subtotal = useMemo(() => {
    if (!orderData) return 0;
    return orderData.items.reduce(
      (sum, item) => sum + Math.max(0, item.price) * item.quantity,
      0
    );
  }, [orderData]);

  const discountAmount = useMemo(() => {
    if (!orderData) return 0;
    return orderData.items.reduce(
      (sum, item) => sum + Math.max(0, item.discountAmount ?? 0) * item.quantity,
      0
    );
  }, [orderData]);

  const deliveryFee = orderData ? getDeliveryFee(subtotal - discountAmount, orderData.deliveryOption) : 0;
  const estimatedTotal = Math.max(0, subtotal - discountAmount + deliveryFee);
  const maxUsablePoints = Math.min(pointBalance, estimatedTotal);
  const finalAmount = Math.max(0, estimatedTotal - usePoints);

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
        selectedCoupon: orderData.selectedCoupon,
        requestedPointAmount: usePoints,
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

  if (!user || !orderData || !selectedAddress) {
    return <div>로그인 / 주문 정보 확인 중...</div>;
  }

  return (
    <div className={styles.container}>
      <PageHeader
        title="checkout"
        description="주문 생성"
        breadcrumb={[
          { label: "home", href: "/" },
          { label: "cart", href: "/cart" },
          { label: "orders", href: "/orders/cart" },
          { label: "checkout" },
        ]}
      />
      <div className={styles.content}>
        <div className={styles.checkoutLayout}>
          <div className={styles.orderSection}>
            <h3 className={styles.sectionTitle}>상품</h3>
            {orderData.items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className={styles.orderItem}>
                <div className={styles.itemInfo}>
                  <div>{item.productName || item.productId}</div>
                  <div>{item.color} / {item.size} / 수량 {item.quantity}</div>
                </div>
                <div>{(Math.max(0, item.price) * item.quantity).toLocaleString()}원</div>
              </div>
            ))}

            <h3 className={styles.sectionTitle}>배송 주소</h3>
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
                    <span className={styles.addressName}>{address.name}</span>
                  </div>
                  <div>{address.recipient} | {address.phone}</div>
                  <div>{`(${address.zipCode}) ${address.address} ${address.detailAddress}`}</div>
                </div>
              </label>
            ))}

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
                  <span>{method.label}</span>
                </label>
              ))}
            </div>

            <h3 className={styles.sectionTitle}>포인트 사용</h3>
            <div className={styles.pointSection}>
              <span>가용 포인트: {pointBalance.toLocaleString()}원</span>
              <input
                type="number"
                value={usePoints}
                onChange={(event) => handlePointChange(event.target.value)}
                max={maxUsablePoints}
              />
              <button onClick={() => setUsePoints(maxUsablePoints)}>
                전액 사용
              </button>
            </div>
          </div>

          <div className={styles.paymentSummary}>
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
        </div>
      </div>
    </div>
  );
}
