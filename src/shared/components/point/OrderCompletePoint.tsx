// 주문 완료 시 포인트 적립 예시 컴포넌트

'use client';

import { useEffect } from 'react';
import { useOrderPoint } from '@/shared/hooks/usePoint';
import { useAuth } from '@/context/authProvider';

interface OrderCompletePointProps {
  orderAmount: number;
  orderId: string;
}

export default function OrderCompletePoint({ orderAmount, orderId }: OrderCompletePointProps) {
  const { user } = useAuth();
  const orderPointMutation = useOrderPoint();

  useEffect(() => {
    if (user && orderAmount && orderId) {
      // 주문 완료 시 자동으로 포인트 적립
      orderPointMutation.mutate({
        orderAmount,
        orderId
      }, {
        onSuccess: (result) => {
          console.log('포인트 적립 성공:', result);
          // 성공 알림 표시
          alert(`${Math.floor(orderAmount * 0.01)}포인트가 적립되었습니다!`);
        },
        onError: (error) => {
          console.error('포인트 적립 실패:', error);
        }
      });
    }
  }, [user, orderAmount, orderId, orderPointMutation]);

  if (orderPointMutation.isPending) {
    return <div>포인트 적립 중...</div>;
  }

  return null;
}
