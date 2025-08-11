'use client';

import { useState, useEffect } from 'react';
import { EventService } from '@/shared/services/eventService';
import { Event } from '@/shared/types/event';
import EventForm from '@/app/admin/events/_components/EventForm';

interface Props {
  eventId: string;
}

export default function EventEditClient({ eventId }: Props) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const eventData = await EventService.getEventById(eventId);
      if (eventData) {
        setEvent(eventData);
      } else {
        alert('이벤트를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('Error loading event:', error);
      alert('이벤트를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>이벤트를 불러오는 중...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>이벤트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return <EventForm event={event} isEdit={true} />;
}
