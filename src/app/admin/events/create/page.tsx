import EventForm from '@/app/admin/events/_components/EventForm';
import EventNavigation from '@/app/admin/events/_components/EventNavigation';
import styles from './page.module.css';

export default function CreateEventPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>새 이벤트 생성</h1>
        <p className={styles.description}>새로운 이벤트를 생성하고 설정할 수 있습니다.</p>
      </div>
      
      <EventNavigation />
      
      <div className={styles.content}>
        <EventForm />
      </div>
    </div>
  );
}
