import { notFound } from 'next/navigation';
import { EventProvider } from '@/context/eventProvider';
import EventNavigation from '@/app/admin/events/_components/EventNavigation';
import styles from './page.module.css';
import { EventService } from '@/shared/services/eventService';

// 동적 배포에서는 generateStaticParams 불필요

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
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>이벤트 편집</h2>
            <p>이벤트 ID: {eventId}</p>
            <p>이벤트 편집 기능은 구현 중입니다.</p>
          </div>
        </div>
      </div>
    </EventProvider>
  );
}
