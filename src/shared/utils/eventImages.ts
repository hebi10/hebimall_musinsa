import { getEventUiVariant } from '@/shared/constants/eventUiMeta';
import { Event, EventUiVariant } from '@/shared/types/event';

interface EventEditorialImages {
  bannerImage: string;
  thumbnailImage: string;
  detailImage: string;
}

const EDITORIAL_EVENT_IMAGES: Record<EventUiVariant, EventEditorialImages> = {
  sale: {
    bannerImage: '/main/hero_editorial_sale_fixed.webp',
    thumbnailImage: '/main/hero_editorial_sale.webp',
    detailImage: '/main/hero_editorial_sale_fixed.webp',
  },
  coupon: {
    bannerImage: '/main/hero_editorial_outer_fixed.webp',
    thumbnailImage: '/main/hero_editorial_outer.webp',
    detailImage: '/main/hero_editorial_outer_fixed.webp',
  },
  review: {
    bannerImage: '/main/hero_editorial_best_fixed.webp',
    thumbnailImage: '/main/hero_editorial_best.webp',
    detailImage: '/main/hero_editorial_best_fixed.webp',
  },
  new: {
    bannerImage: '/main/hero_editorial_outer_fixed.webp',
    thumbnailImage: '/main/hero_editorial_outer.webp',
    detailImage: '/main/hero_editorial_outer_fixed.webp',
  },
  special: {
    bannerImage: '/main/hero_editorial_best_fixed.webp',
    thumbnailImage: '/main/hero_editorial_best.webp',
    detailImage: '/main/hero_editorial_best_fixed.webp',
  },
};

const LEGACY_EVENT_IMAGE_PATTERNS = [
  '/images/events/',
  '/api/placeholder/',
  'placeholder',
  'ready',
  'preparing',
  'coming-soon',
  'coming_soon',
  'chatgpt%20image%202025',
  'chatgpt image 2025',
  '준비',
];

const SALE_KEYWORDS = ['sale', '세일', '특가', '할인'];
const REVIEW_KEYWORDS = ['review', '리뷰', '후기'];
const NEW_KEYWORDS = ['new', '신상', 'collection', '컬렉션'];

const isPlaceholderEventImage = (imageUrl?: string | null): boolean => {
  if (!imageUrl?.trim()) {
    return true;
  }

  const normalizedUrl = imageUrl.toLowerCase();
  return LEGACY_EVENT_IMAGE_PATTERNS.some((pattern) => normalizedUrl.includes(pattern));
};

const getGeneratedDetailImage = (bannerImage?: string | null): string | null => {
  if (!bannerImage?.includes('/events/2026/') || !bannerImage.endsWith('-banner.webp')) {
    return null;
  }

  return bannerImage.replace('-banner.webp', '-detail.webp');
};

const pickEditorialVariant = (event: Event): EventUiVariant => {
  const searchableText = [
    event.title,
    event.description,
    event.content ?? '',
    event.bannerImage,
    event.thumbnailImage,
  ]
    .join(' ')
    .toLowerCase();

  if (SALE_KEYWORDS.some((keyword) => searchableText.includes(keyword))) {
    return 'sale';
  }

  if (REVIEW_KEYWORDS.some((keyword) => searchableText.includes(keyword))) {
    return 'review';
  }

  if (NEW_KEYWORDS.some((keyword) => searchableText.includes(keyword))) {
    return 'new';
  }

  return getEventUiVariant(event);
};

export const getEventDisplayImages = (event: Event): EventEditorialImages => {
  const editorialImages = EDITORIAL_EVENT_IMAGES[pickEditorialVariant(event)];
  const generatedDetailImage = getGeneratedDetailImage(event.bannerImage);
  const detailImage = event.detailImage ?? generatedDetailImage ?? event.bannerImage;

  return {
    bannerImage: isPlaceholderEventImage(event.bannerImage)
      ? editorialImages.bannerImage
      : event.bannerImage,
    thumbnailImage: isPlaceholderEventImage(event.thumbnailImage)
      ? editorialImages.thumbnailImage
      : event.thumbnailImage,
    detailImage: isPlaceholderEventImage(detailImage)
      ? editorialImages.detailImage
      : detailImage,
  };
};
