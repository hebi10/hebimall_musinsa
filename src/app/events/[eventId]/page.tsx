import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EventDetailClient from './EventDetailClient';
import { EventService } from '@/shared/services/eventService';

interface Props {
  params: Promise<{
    eventId: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId } = await params;
  
  try {
    // Firebase에서 이벤트 정보를 가져옴
    const event = await EventService.getEventById(eventId);
    
    if (!event) {
      return {
        title: '이벤트를 찾을 수 없습니다 - HEBIMALL',
        description: '요청하신 이벤트를 찾을 수 없습니다.'
      };
    }

    return {
      title: `${event.title} - HEBIMALL`,
      description: event.description,
      openGraph: {
        title: event.title,
        description: event.description,
        images: [event.bannerImage]
      }
    };
  } catch (error) {
    console.error('Error loading event for metadata:', error);
    return {
      title: '이벤트 - HEBIMALL',
      description: 'HEBIMALL 이벤트 페이지'
    };
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { eventId } = await params;
  
  try {
    // Firebase에서 이벤트 정보를 가져옴
    const event = await EventService.getEventById(eventId);
    
    if (!event) {
      notFound();
    }

    return <EventDetailClient event={event} />;
  } catch (error) {
    console.error('Error loading event:', error);
    notFound();
  }
}
