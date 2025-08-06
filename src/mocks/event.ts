import { Event } from "@/shared/types/event";

export const mockEvents: Event[] = [
  {
    id: 'event-1',
    title: '신규 회원 가입 이벤트',
    description: '첫 구매 시 20% 할인 쿠폰 증정!',
    content: '신규 회원가입 후 첫 구매 시 20% 할인 쿠폰을 드립니다. 기간 내에 사용해주세요.',
    bannerImage: '/images/events/signup-event.jpg',
    thumbnailImage: '/images/events/signup-thumb.jpg',
    eventType: 'coupon',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    isActive: true,
    discountRate: 20,
    couponCode: 'WELCOME20',
    participantCount: 1245,
    maxParticipants: 5000,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'event-2',
    title: '봄맞이 특가 세일',
    description: '봄 신상품 최대 50% 할인!',
    content: '따뜻한 봄을 맞아 신상품을 특가로 만나보세요. 기간 한정 특가입니다.',
    bannerImage: '/images/events/spring-sale.jpg',
    thumbnailImage: '/images/events/spring-thumb.jpg',
    eventType: 'sale',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-31'),
    isActive: true,
    discountRate: 50,
    targetCategories: ['상의', '하의', '아우터'],
    participantCount: 892,
    createdAt: new Date('2024-02-25'),
    updatedAt: new Date('2024-02-25')
  },
  {
    id: 'event-3',
    title: '리뷰 작성 이벤트',
    description: '리뷰 작성하고 적립금 받자!',
    content: '구매 후 리뷰 작성 시 1,000원 적립금을 드립니다.',
    bannerImage: '/images/events/review-event.jpg',
    thumbnailImage: '/images/events/review-thumb.jpg',
    eventType: 'special',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-06-30'),
    isActive: true,
    discountAmount: 1000,
    participantCount: 2341,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'event-4',
    title: '신상품 출시 기념',
    description: '새로운 컬렉션을 만나보세요',
    content: '2024 S/S 신상품 컬렉션이 출시되었습니다. 트렌디한 스타일을 만나보세요.',
    bannerImage: '/images/events/new-collection.jpg',
    thumbnailImage: '/images/events/new-thumb.jpg',
    eventType: 'new',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-04-30'),
    isActive: true,
    participantCount: 567,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  }
];

export const mockEvent = {
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