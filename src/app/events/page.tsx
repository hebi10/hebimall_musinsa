import EventList from "./_components/EventList";
import styles from "./page.module.css";

export default function EventsPage() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <EventList />
      </div>
    </main>
  );
}
