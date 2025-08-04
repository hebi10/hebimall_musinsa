import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EventDetailClient from './EventDetailClient';

interface Props {
  params: {
    eventId: string;
  };
}

// Mock 데이터
const mockEvent = {
  id: 'event-1',
  title: '신규 회원 가입 이벤트',
  description: '첫 구매 시 20% 할인 쿠폰 증정!',
  content: `
    <h2>신규 회원 가입 이벤트</h2>
    <p>HEBIMALL에 오신 것을 환영합니다!</p>
    <p>신규 회원가입 후 첫 구매 시 <strong>20% 할인 쿠폰</strong>을 드립니다.</p>
    
    <h3>이벤트 혜택</h3>
    <ul>
      <li>신규 회원 가입 시 즉시 20% 할인 쿠폰 지급</li>
      <li>첫 구매 시 무료배송</li>
      <li>적립금 1,000원 추가 지급</li>
    </ul>
    
    <h3>참여 방법</h3>
    <ol>
      <li>HEBIMALL 회원가입</li>
      <li>이메일 인증 완료</li>
      <li>쿠폰 자동 지급 (마이페이지에서 확인)</li>
      <li>원하는 상품 구매 시 쿠폰 사용</li>
    </ol>
    
    <h3>주의사항</h3>
    <ul>
      <li>쿠폰 유효기간: 발급일로부터 30일</li>
      <li>최소 주문금액: 50,000원 이상</li>
      <li>다른 할인 혜택과 중복 사용 불가</li>
      <li>일부 브랜드 제외 상품 있음</li>
    </ul>
  `,
  bannerImage: '/images/events/signup-event.jpg',
  thumbnailImage: '/images/events/signup-thumb.jpg',
  eventType: 'coupon' as const,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  isActive: true,
  discountRate: 20,
  couponCode: 'WELCOME20',
  participantCount: 1245,
  maxParticipants: 5000,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // 실제로는 API에서 이벤트 정보를 가져와서 메타데이터 생성
  const event = mockEvent;
  
  return {
    title: `${event.title} - HEBIMALL`,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      images: [event.bannerImage]
    }
  };
}

export default function EventDetailPage({ params }: Props) {
  const { eventId } = params;
  
  // 실제로는 API에서 이벤트 정보를 가져옴
  if (!mockEvent) {
    notFound();
  }

  return <EventDetailClient event={mockEvent} />;
}
