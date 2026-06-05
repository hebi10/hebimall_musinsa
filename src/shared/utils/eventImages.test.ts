import { getEventDisplayImages } from './eventImages';
import { Event } from '@/shared/types/event';

const baseEvent: Event = {
  id: 'event-1',
  title: '봄맞이 특가 세일',
  description: '봄 신상품 최대 50% 할인!',
  content: '',
  bannerImage: '',
  thumbnailImage: '',
  eventType: 'sale',
  startDate: new Date('2026-03-01T00:00:00.000Z'),
  endDate: new Date('2026-12-31T00:00:00.000Z'),
  isActive: true,
  participantCount: 0,
  hasMaxParticipants: false,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('getEventDisplayImages', () => {
  it('uses local editorial images when event images are missing', () => {
    const result = getEventDisplayImages(baseEvent);

    expect(result.bannerImage).toBe('/main/hero_editorial_sale_fixed.webp');
    expect(result.thumbnailImage).toBe('/main/hero_editorial_sale.webp');
    expect(result.detailImage).toBe('/main/hero_editorial_sale_fixed.webp');
  });

  it('keeps custom uploaded images when they are present', () => {
    const result = getEventDisplayImages({
      ...baseEvent,
      bannerImage: 'https://cdn.example.com/events/custom-banner.webp',
      thumbnailImage: 'https://cdn.example.com/events/custom-thumb.webp',
    });

    expect(result.bannerImage).toBe('https://cdn.example.com/events/custom-banner.webp');
    expect(result.thumbnailImage).toBe('https://cdn.example.com/events/custom-thumb.webp');
    expect(result.detailImage).toBe('https://cdn.example.com/events/custom-banner.webp');
  });

  it('uses an explicit detail image when it is present', () => {
    const result = getEventDisplayImages({
      ...baseEvent,
      bannerImage: '/events/2026/event-2026-06-midyear-sale-banner.webp',
      thumbnailImage: '/events/2026/event-2026-06-midyear-sale-thumb.webp',
      detailImage: '/events/2026/event-2026-06-midyear-sale-detail.webp',
    });

    expect(result.bannerImage).toBe('/events/2026/event-2026-06-midyear-sale-banner.webp');
    expect(result.thumbnailImage).toBe('/events/2026/event-2026-06-midyear-sale-thumb.webp');
    expect(result.detailImage).toBe('/events/2026/event-2026-06-midyear-sale-detail.webp');
  });

  it('derives a generated detail image from a generated event banner', () => {
    const result = getEventDisplayImages({
      ...baseEvent,
      bannerImage: '/events/2026/event-2026-08-last-summer-banner.webp',
      thumbnailImage: '/events/2026/event-2026-08-last-summer-thumb.webp',
    });

    expect(result.detailImage).toBe('/events/2026/event-2026-08-last-summer-detail.webp');
  });

  it('replaces known placeholder event image paths with editorial images', () => {
    const result = getEventDisplayImages({
      ...baseEvent,
      eventType: 'coupon',
      bannerImage: '/images/events/spring-sale.jpg',
      thumbnailImage: '/api/placeholder/300/200',
    });

    expect(result.bannerImage).toBe('/main/hero_editorial_sale_fixed.webp');
    expect(result.thumbnailImage).toBe('/main/hero_editorial_sale.webp');
    expect(result.detailImage).toBe('/main/hero_editorial_sale_fixed.webp');
  });

  it('replaces stale generated event placeholder uploads with editorial images', () => {
    const result = getEventDisplayImages({
      ...baseEvent,
      bannerImage:
        'https://firebasestorage.googleapis.com/v0/b/example/o/events%2Fbanner%2F1754898091622_ChatGPT%20Image%202025%EB%85%84.webp?alt=media',
      thumbnailImage:
        'https://firebasestorage.googleapis.com/v0/b/example/o/events%2Fthumbnail%2F1754898099153_ChatGPT%20Image%202025%EB%85%84.webp?alt=media',
    });

    expect(result.bannerImage).toBe('/main/hero_editorial_sale_fixed.webp');
    expect(result.thumbnailImage).toBe('/main/hero_editorial_sale.webp');
    expect(result.detailImage).toBe('/main/hero_editorial_sale_fixed.webp');
  });

  it('uses review editorial images for special events focused on reviews', () => {
    const result = getEventDisplayImages({
      ...baseEvent,
      eventType: 'special',
      title: '리뷰 작성 이벤트',
      description: '후기를 남기면 적립금을 드립니다.',
    });

    expect(result.bannerImage).toBe('/main/hero_editorial_best_fixed.webp');
    expect(result.thumbnailImage).toBe('/main/hero_editorial_best.webp');
    expect(result.detailImage).toBe('/main/hero_editorial_best_fixed.webp');
  });
});
