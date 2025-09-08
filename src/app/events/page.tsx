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
            다양한 혜택과 특별한 이벤트를 만나보세요
          </p>
        </div>
      </div>
      
      <div className={styles.content}>
        <EventList />
      </div>
    </div>
  );
}
