import { notFound } from 'next/navigation';
import EventNavigation from '@/app/admin/events/_components/EventNavigation';
import EventForm from '@/app/admin/events/_components/EventForm';
import { EventService } from '@/shared/services/eventService';
import styles from './page.module.css';

// 동적 배포에서는 generateStaticParams 불필요

interface Props {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function EditEventPage({ params }: Props) {
  const { eventId } = await params;
  const event = await EventService.getEventById(eventId);

  if (!event) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>이벤트 수정</h1>
        <p className={styles.description}>이벤트 정보를 수정할 수 있습니다.</p>
      </div>

      <EventNavigation />

      <div className={styles.content}>
        <EventForm event={event} isEdit />
      </div>
    </div>
  );
}
