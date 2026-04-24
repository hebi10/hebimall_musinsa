import { Event, EventType, EventUiVariant } from '../types/event';

export const REVIEW_EVENT_KEYWORDS = ['리뷰', '후기'];

type EventDetailHighlightKey = 'benefit' | 'period' | 'scope' | 'action' | 'reward';

interface EventSectionTitles {
  detail: string;
  content: string;
  method: string;
  benefits: string;
  notice: string;
  summary: string;
}

interface EventDetailHighlightMeta {
  key: EventDetailHighlightKey;
  icon: string;
  title: string;
}

export interface EventUiMeta {
  variant: EventUiVariant;
  typeLabel: string;
  badgeLabel: string;
  featuredEyebrow: string;
  featuredAccentText: string;
  featuredCtaLabel: string;
  cardEyebrow: string;
  cardAccentLabel: string;
  cardCtaLabel: string;
  heroEyebrow: string;
  detailSectionTitle: string;
  primaryActionLabel: string;
  primaryActionLoggedOutLabel: string;
  primaryActionDescription: string;
  primaryPendingLabel: string;
  primaryCompletedLabel: string;
  primaryPostParticipationLabel?: string;
  sectionTitles: EventSectionTitles;
  highlightCards: readonly EventDetailHighlightMeta[];
}

const EVENT_UI_META: Record<EventUiVariant, EventUiMeta> = {
  sale: {
    variant: 'sale',
    typeLabel: '세일',
    badgeLabel: '세일 특가',
    featuredEyebrow: 'FLASH SALE',
    featuredAccentText: '지금 가장 강한 즉시 할인',
    featuredCtaLabel: '특가 보기',
    cardEyebrow: '즉시 할인 혜택',
    cardAccentLabel: '빠른 구매 추천',
    cardCtaLabel: '할인 상품 보기',
    heroEyebrow: 'FLASH SALE',
    detailSectionTitle: '세일 이벤트 상세',
    primaryActionLabel: '할인 상품 보러가기',
    primaryActionLoggedOutLabel: '로그인 후 할인 상품 보기',
    primaryActionDescription: '참여 처리 후 할인 적용 상품 화면으로 이어져 바로 상품을 확인할 수 있습니다.',
    primaryPendingLabel: '할인 참여 처리 중...',
    primaryCompletedLabel: '참여 완료',
    primaryPostParticipationLabel: '할인 상품 계속 보기',
    sectionTitles: {
      detail: '세일 이벤트 상세',
      content: '세일 이벤트 소개',
      method: '할인 참여 흐름',
      benefits: '할인 혜택',
      notice: '구매 전 확인사항',
      summary: '적용 일정 및 할인 방식',
    },
    highlightCards: [
      { key: 'benefit', icon: '할인', title: '할인 포인트' },
      { key: 'scope', icon: '범위', title: '대상 범위' },
      { key: 'action', icon: '구매', title: '참여 방식' },
      { key: 'reward', icon: '적용', title: '할인 적용' },
    ],
  },
  coupon: {
    variant: 'coupon',
    typeLabel: '쿠폰',
    badgeLabel: '쿠폰 혜택',
    featuredEyebrow: 'COUPON DROP',
    featuredAccentText: '받고 바로 쓰는 쿠폰 이벤트',
    featuredCtaLabel: '쿠폰 혜택 보기',
    cardEyebrow: '쿠폰 지급 이벤트',
    cardAccentLabel: '즉시 사용 가능',
    cardCtaLabel: '쿠폰 조건 보기',
    heroEyebrow: 'COUPON EVENT',
    detailSectionTitle: '쿠폰 이벤트 안내',
    primaryActionLabel: '쿠폰 받기',
    primaryActionLoggedOutLabel: '로그인 후 쿠폰 받기',
    primaryActionDescription: '버튼을 누르면 이벤트 참여가 기록되고 지급 가능한 쿠폰 흐름으로 이어집니다.',
    primaryPendingLabel: '쿠폰 지급 처리 중...',
    primaryCompletedLabel: '쿠폰 받기 완료',
    sectionTitles: {
      detail: '쿠폰 이벤트 안내',
      content: '쿠폰 이벤트 소개',
      method: '쿠폰 받는 방법',
      benefits: '쿠폰 혜택',
      notice: '쿠폰 사용 유의사항',
      summary: '지급 및 사용 방식',
    },
    highlightCards: [
      { key: 'benefit', icon: '쿠폰', title: '쿠폰 혜택' },
      { key: 'period', icon: '기간', title: '사용 가능 기간' },
      { key: 'action', icon: '참여', title: '받는 방법' },
      { key: 'reward', icon: '사용', title: '지급/사용 방식' },
    ],
  },
  review: {
    variant: 'review',
    typeLabel: '리뷰',
    badgeLabel: '리뷰 미션',
    featuredEyebrow: 'REVIEW MISSION',
    featuredAccentText: '후기를 남기면 보상이 쌓이는 참여형 이벤트',
    featuredCtaLabel: '리뷰 미션 보기',
    cardEyebrow: '참여형 리뷰 이벤트',
    cardAccentLabel: '후기 작성 보상',
    cardCtaLabel: '리뷰 조건 보기',
    heroEyebrow: 'REVIEW EVENT',
    detailSectionTitle: '리뷰 이벤트 안내',
    primaryActionLabel: '리뷰 쓰고 참여하기',
    primaryActionLoggedOutLabel: '로그인 후 리뷰 쓰고 참여하기',
    primaryActionDescription: '참여 처리 후 리뷰 확인 화면으로 이어져 후속 행동을 바로 진행할 수 있습니다.',
    primaryPendingLabel: '리뷰 참여 처리 중...',
    primaryCompletedLabel: '참여 완료',
    primaryPostParticipationLabel: '리뷰 화면 보기',
    sectionTitles: {
      detail: '리뷰 이벤트 안내',
      content: '리뷰 미션 소개',
      method: '리뷰 참여 방법',
      benefits: '리뷰 보상',
      notice: '리뷰 작성 유의사항',
      summary: '적립 및 지급 방식',
    },
    highlightCards: [
      { key: 'benefit', icon: '보상', title: '리뷰 보상' },
      { key: 'scope', icon: '기준', title: '참여 기준' },
      { key: 'action', icon: '작성', title: '작성 방식' },
      { key: 'reward', icon: '적립', title: '적립 방식' },
    ],
  },
  new: {
    variant: 'new',
    typeLabel: '신상',
    badgeLabel: '신상 오픈',
    featuredEyebrow: 'NEW ARRIVAL',
    featuredAccentText: '공개 직후 가장 먼저 만나는 신상 혜택',
    featuredCtaLabel: '신상 혜택 보기',
    cardEyebrow: '런칭 기념 이벤트',
    cardAccentLabel: '가장 빠른 공개',
    cardCtaLabel: '신상 혜택 보기',
    heroEyebrow: 'NEW COLLECTION',
    detailSectionTitle: '신상 이벤트 안내',
    primaryActionLabel: '신상품 보러가기',
    primaryActionLoggedOutLabel: '로그인 후 신상품 보기',
    primaryActionDescription: '참여 처리 후 신상품 중심 추천 화면으로 이어져 최신 상품을 바로 확인할 수 있습니다.',
    primaryPendingLabel: '신상 참여 처리 중...',
    primaryCompletedLabel: '참여 완료',
    primaryPostParticipationLabel: '신상품 계속 보기',
    sectionTitles: {
      detail: '신상 이벤트 안내',
      content: '신상 오픈 소개',
      method: '신상 참여 방법',
      benefits: '오픈 혜택',
      notice: '출시 확인사항',
      summary: '오픈 일정 및 적용 방식',
    },
    highlightCards: [
      { key: 'benefit', icon: '신상', title: '오픈 혜택' },
      { key: 'period', icon: '일정', title: '공개 일정' },
      { key: 'action', icon: '탐색', title: '참여 방식' },
      { key: 'reward', icon: '적용', title: '혜택 적용' },
    ],
  },
  special: {
    variant: 'special',
    typeLabel: '특별',
    badgeLabel: '특별 기획',
    featuredEyebrow: 'SPECIAL EVENT',
    featuredAccentText: '기간 한정으로 준비한 특별 혜택',
    featuredCtaLabel: '이벤트 보기',
    cardEyebrow: '브랜드 기획 이벤트',
    cardAccentLabel: '기간 한정 혜택',
    cardCtaLabel: '이벤트 보기',
    heroEyebrow: 'SPECIAL EVENT',
    detailSectionTitle: '특별 이벤트 안내',
    primaryActionLabel: '이벤트 참여하기',
    primaryActionLoggedOutLabel: '로그인 후 이벤트 참여하기',
    primaryActionDescription: '핵심 조건을 확인한 뒤 참여를 완료하고 아래 상세 안내를 이어서 확인할 수 있습니다.',
    primaryPendingLabel: '참여 처리 중...',
    primaryCompletedLabel: '참여 완료',
    sectionTitles: {
      detail: '특별 이벤트 안내',
      content: '특별 이벤트 소개',
      method: '이벤트 참여 방법',
      benefits: '이벤트 혜택',
      notice: '참여 유의사항',
      summary: '기간 및 지급 방식',
    },
    highlightCards: [
      { key: 'benefit', icon: '혜택', title: '혜택 내용' },
      { key: 'period', icon: '기간', title: '진행 기간' },
      { key: 'action', icon: '방식', title: '참여 방법' },
      { key: 'reward', icon: '지급', title: '당첨/지급 방식' },
    ],
  },
};

export const isReviewFocusedEvent = (
  event: Pick<Event, 'eventType' | 'title' | 'description' | 'content'>
) => {
  if (event.eventType !== 'special') {
    return false;
  }

  const searchableText = [event.title, event.description, event.content ?? ''].join(' ');
  return REVIEW_EVENT_KEYWORDS.some(keyword => searchableText.includes(keyword));
};

export const getEventUiVariant = (
  event: Pick<Event, 'eventType' | 'title' | 'description' | 'content'>
): EventUiVariant => {
  if (isReviewFocusedEvent(event)) {
    return 'review';
  }

  return event.eventType;
};

export const getEventUiMeta = (
  input: EventUiVariant | Pick<Event, 'eventType' | 'title' | 'description' | 'content'>
): EventUiMeta => {
  if (typeof input === 'string') {
    return EVENT_UI_META[input];
  }

  return EVENT_UI_META[getEventUiVariant(input)];
};

export const getEventTypeLabel = (
  input: EventType | EventUiVariant | Pick<Event, 'eventType' | 'title' | 'description' | 'content'>
) => {
  if (typeof input === 'string') {
    return EVENT_UI_META[input].typeLabel;
  }

  return getEventUiMeta(input).typeLabel;
};
