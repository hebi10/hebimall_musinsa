import EventList from "./_components/EventList";
import styles from "./page.module.css";

export default function EventsPage() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>이벤트</h1>
          <p className={styles.heroSubtitle}>
            진행 중인 이벤트 목록입니다
          </p>
        </div>
      </div>
      
      <div className={styles.content}>
        <EventList />
      </div>
    </div>
  );
}
