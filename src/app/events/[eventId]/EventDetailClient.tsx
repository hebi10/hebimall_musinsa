'use client';

import { Event } from '@/shared/types/event';

interface EventDetailClientProps {
  event: Event;
}

export default function EventDetailClient({ event }: EventDetailClientProps) {
  return (
    <div style={{ padding: '20px' }}>
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      {event.bannerImage && (
        <img 
          src={event.bannerImage} 
          alt={event.title} 
          style={{ maxWidth: '100%', height: 'auto' }} 
        />
      )}
      <div style={{ marginTop: '20px' }}>
        <div>
          <strong>기간:</strong> {event.startDate.toLocaleDateString()} - {event.endDate.toLocaleDateString()}
        </div>
        <div>
          <strong>할인율:</strong> {event.discountRate}%
        </div>
        <div>
          <strong>상태:</strong> {event.isActive ? '진행중' : '종료'}
        </div>
      </div>
    </div>
  );
}
