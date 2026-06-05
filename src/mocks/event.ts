import eventCatalog from './eventCatalog2026.json';
import { Event, EventCouponType, EventType } from '@/shared/types/event';

type EventCatalogItem = Omit<
  Event,
  'eventType' | 'couponType' | 'startDate' | 'endDate' | 'createdAt' | 'updatedAt'
> & {
  eventType: EventType;
  couponType?: EventCouponType;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

const toEvent = (event: EventCatalogItem): Event => ({
  ...event,
  startDate: new Date(`${event.startDate}T00:00:00+09:00`),
  endDate: new Date(`${event.endDate}T23:59:59+09:00`),
  createdAt: new Date(`${event.createdAt}T00:00:00+09:00`),
  updatedAt: new Date(`${event.updatedAt}T00:00:00+09:00`),
});

export const mockEvents: Event[] = (eventCatalog as EventCatalogItem[]).map(toEvent);

export const mockEvent: Event = mockEvents[0];
