'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/authProvider';
import { OrderService } from '@/shared/services/orderService';
import { Order } from '@/shared/types/order';
import styles from './page.module.css';

interface OrderDetailPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string>('');

  // params Promise를 resolve
  useEffect(() => {
    params.then(({ orderId }) => {
      setOrderId(orderId);
    });
  }, [params]);

  useEffect(() => {
    if (loading || !orderId) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadOrderDetails();
  }, [user, loading, orderId]);

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const orderData = await OrderService.getOrder(orderId);
      
      if (!orderData) {
        setError('주문을 찾을 수 없습니다.');
        return;
      }
      
      // 주문한 사용자인지 확인
      if (orderData.userId !== user?.uid) {
        setError('접근 권한이 없습니다.');
        return;
      }
      
      setOrder(orderData);
    } catch (err: any) {
      console.error('주문 상세 로드 실패:', err);
      setError('주문 상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "결제 대기";
      case "confirmed": return "주문 확인";
      case "preparing": return "상품 준비중";
      case "shipped": return "배송 중";
      case "delivered": return "배송 완료";
      case "cancelled": return "주문 취소";
      case "returned": return "반품";
      case "exchanged": return "교환";
      default: return status;
    }
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('ko-KR').format(numAmount || 0) + '원';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (loading || isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>주문 상세 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <div className={styles.errorIcon}>❌</div>
          <h3>오류</h3>
          <p>{error}</p>
          <div className={styles.errorActions}>
            <Link href="/mypage/order-list" className={styles.backButton}>
              주문 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h3>주문을 찾을 수 없습니다</h3>
          <Link href="/mypage/order-list" className={styles.backButton}>
            주문 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.breadcrumb}>
          <Link href="/mypage" className={styles.breadcrumbLink}>마이페이지</Link>
          <span className={styles.breadcrumbSeparator}>{'>'}</span>
          <Link href="/mypage/order-list" className={styles.breadcrumbLink}>주문내역</Link>
          <span className={styles.breadcrumbSeparator}>{'>'}</span>
          <span className={styles.breadcrumbCurrent}>주문상세</span>
        </div>
        <h1 className={styles.pageTitle}>주문 상세 정보</h1>
        <p className={styles.pageDesc}>주문번호: {order.orderNumber}</p>
      </div>

      {/* 주문 상태 */}
      <div className={styles.statusSection}>
        <div className={styles.statusCard}>
          <div className={styles.statusHeader}>
            <div className={styles.statusBadge}>
              <span className={`${styles.statusDot} ${styles[`status-${order.status}`]}`}></span>
              {getStatusText(order.status)}
            </div>
            <div className={styles.orderDate}>
              주문일시: {formatDate(order.createdAt)}
            </div>
          </div>
          {order.status === 'shipped' && order.trackingNumber && (
            <div className={styles.trackingInfo}>
              <h4>배송 정보</h4>
              <p>택배회사: {order.deliveryCompany || '정보 없음'}</p>
              <p>운송장번호: {order.trackingNumber}</p>
            </div>
          )}
        </div>
      </div>

      {/* 주문 상품 */}
      <div className={styles.productsSection}>
        <h3 className={styles.sectionTitle}>주문 상품</h3>
        <div className={styles.productsList}>
          {order.products.map((product, index) => (
            <div key={`${product.id}-${index}`} className={styles.productCard}>
              <div className={styles.productImage}>
                <img 
                  src={(() => {
                    let imageUrl = product.productImage;
                    
                    // Firebase Storage URL 처리
                    if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
                      try {
                        const url = new URL(imageUrl);
                        url.search = 'alt=media';
                        return url.toString();
                      } catch (e) {
                        return '/product-placeholder.jpg';
                      }
                    }
                    
                    // 로컬 이미지 경로 처리
                    if (imageUrl && imageUrl.startsWith('/')) {
                      return imageUrl;
                    }
                    
                    // 기본 이미지
                    return '/product-placeholder.jpg';
                  })()} 
                  alt={product.productName}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('product-placeholder.jpg')) {
                      target.src = '/product-placeholder.jpg';
                    }
                  }}
                  loading="lazy"
                />
              </div>
              <div className={styles.productInfo}>
                <div className={styles.productBrand}>{product.brand}</div>
                <div className={styles.productName}>{product.productName}</div>
                <div className={styles.productOptions}>
                  색상: {product.color} / 사이즈: {product.size} / 수량: {product.quantity}개
                </div>
                <div className={styles.productPrice}>
                  {formatCurrency(product.price * product.quantity)}
                  {product.discountAmount > 0 && (
                    <span className={styles.discountAmount}>
                      (할인 {formatCurrency(product.discountAmount)})
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 결제 정보 */}
      <div className={styles.paymentSection}>
        <h3 className={styles.sectionTitle}>결제 정보</h3>
        <div className={styles.paymentCard}>
          <div className={styles.paymentRow}>
            <span>상품 금액</span>
            <span>{formatCurrency(order.totalAmount || order.finalAmount)}</span>
          </div>
          {order.discountAmount && order.discountAmount > 0 && (
            <div className={styles.paymentRow}>
              <span>할인 금액</span>
              <span className={styles.discountText}>-{formatCurrency(order.discountAmount)}</span>
            </div>
          )}
          <div className={styles.paymentRow}>
            <span>배송비</span>
            <span>{formatCurrency(order.deliveryFee || 0)}</span>
          </div>
          <div className={`${styles.paymentRow} ${styles.paymentTotal}`}>
            <span>최종 결제 금액</span>
            <span className={styles.finalAmount}>{formatCurrency(order.finalAmount)}</span>
          </div>
          {order.paymentMethod && (
            <div className={styles.paymentRow}>
              <span>결제 방법</span>
              <span>{order.paymentMethod}</span>
            </div>
          )}
        </div>
      </div>

      {/* 배송 정보 */}
      {order.shippingAddress && (
        <div className={styles.shippingSection}>
          <h3 className={styles.sectionTitle}>배송 정보</h3>
          <div className={styles.shippingCard}>
            <div className={styles.addressRow}>
              <span className={styles.addressLabel}>받는 분</span>
              <span>{order.shippingAddress.recipient}</span>
            </div>
            <div className={styles.addressRow}>
              <span className={styles.addressLabel}>연락처</span>
              <span>{order.shippingAddress.phone}</span>
            </div>
            <div className={styles.addressRow}>
              <span className={styles.addressLabel}>주소</span>
              <div>
                <div>{order.shippingAddress.address}</div>
                <div>{order.shippingAddress.detailAddress}</div>
                <div className={styles.zipCode}>({order.shippingAddress.zipCode})</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className={styles.actionsSection}>
        <Link href="/mypage/order-list" className={styles.backButton}>
          주문 목록으로 돌아가기
        </Link>
        {order.status === 'pending' && (
          <button className={styles.cancelButton}>
            주문 취소
          </button>
        )}
        {(order.status === 'shipped' || order.status === 'delivered') && order.trackingNumber && (
          <button className={styles.trackingButton}>
            배송 조회
          </button>
        )}
        {order.status === 'delivered' && (
          <button className={styles.reviewButton}>
            리뷰 작성
          </button>
        )}
      </div>
    </div>
  );
}