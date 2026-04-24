export type EventContent = string;
export type EventType = 'sale' | 'coupon' | 'special' | 'new';
export type EventUiVariant = EventType | 'review';
export type EventCouponType = 'manual' | 'auto';

export interface Event {
  id: string;
  title: string;
  description: string;
  content?: EventContent | null;
  bannerImage: string;
  thumbnailImage: string;
  eventType: EventType;
  couponType?: EventCouponType;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  discountRate?: number;
  discountAmount?: number;
  couponCode?: string;
  targetProducts?: string[];
  targetCategories?: string[];
  participantCount: number;
  maxParticipants?: number;
  hasMaxParticipants?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  participatedAt: Date;
  couponUsed?: boolean;
}

export interface EventFilter {
  eventType?: EventType;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}
