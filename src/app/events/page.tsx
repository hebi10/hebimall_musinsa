import EventList from "./_components/EventList";
import styles from "./page.module.css";

export default function EventsPage() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <section className={styles.intro} aria-labelledby="events-page-title">
          <span className={styles.eyebrow}>Curated Events</span>
          <div className={styles.introBody}>
            <h1 id="events-page-title" className={styles.title}>
              이벤트
            </h1>
            <p className={styles.description}>
              할인, 쿠폰, 리뷰 참여 혜택을 한곳에서 차분하게 둘러볼 수 있도록
              정리했습니다.
            </p>
          </div>
        </section>
        <EventList />
      </div>
    </main>
  );
}
