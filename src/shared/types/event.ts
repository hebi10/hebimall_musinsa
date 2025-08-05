export interface Event {
  id: string;
  title: string;
  description: string;
  content: string;
  bannerImage: string;
  thumbnailImage: string;
  eventType: 'sale' | 'coupon' | 'special' | 'new';
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
  eventType?: 'sale' | 'coupon' | 'special' | 'new';
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}
