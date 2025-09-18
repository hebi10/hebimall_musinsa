import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EventService } from '@/shared/services/eventService';
import EventDetailClient from './EventDetailClient';

// 동적 배포에서는 generateStaticParams가 필요 없음
// 모든 라우트는 런타임에 동적으로 처리됨

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
        title: '이벤트를 찾을 수 없습니다 - STYNA',
        description: '요청하신 이벤트를 찾을 수 없습니다.'
      };
    }

    return {
      title: `${event.title} - STYNA`,
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
      title: '이벤트 - STYNA',
      description: 'STYNA 이벤트 페이지'
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
