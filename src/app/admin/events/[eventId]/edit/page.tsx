import { notFound } from 'next/navigation';
import { EventProvider } from '@/context/eventProvider';
import EventNavigation from '@/app/admin/events/_components/EventNavigation';
import styles from './page.module.css';
import EventEditClient from './EventEditClient';

interface Props {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function EditEventPage({ params }: Props) {
  const { eventId } = await params;

  return (
    <EventProvider>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>이벤트 수정</h1>
          <p className={styles.description}>이벤트 정보를 수정할 수 있습니다.</p>
        </div>
        
        <EventNavigation />
        
        <div className={styles.content}>
          <EventEditClient eventId={eventId} />
        </div>
      </div>
    </EventProvider>
  );
}
