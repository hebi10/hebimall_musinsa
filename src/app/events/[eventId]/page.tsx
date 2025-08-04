import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EventDetailClient from './EventDetailClient';
import { mockEvent } from '@/src/mocks/event';

interface Props {
  params: Promise<{
    eventId: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId } = await params;
  // 실제로는 API에서 이벤트 정보를 가져와서 메타데이터 생성
  const event = mockEvent;
  
  return {
    title: `${event.title} - HEBIMALL`,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      images: [event.bannerImage]
    }
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { eventId } = await params;
  
  // 실제로는 API에서 이벤트 정보를 가져옴
  if (!mockEvent) {
    notFound();
  }

  return <EventDetailClient event={mockEvent} />;
}
