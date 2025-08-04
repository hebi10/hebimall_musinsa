import PageHeader from "@/src/components/common/PageHeader";
import EventList from "@/src/components/event/EventList";
import styles from "./page.module.css";

export default function EventsPage() {
  return (
    <div className={styles.container}>
      <PageHeader
        title="이벤트"
        description="다양한 혜택과 이벤트를 확인해보세요"
        breadcrumb={[
          { label: '홈', href: '/' },
          { label: '이벤트' }
        ]}
      />
      
      <div className={styles.content}>
        <EventList />
      </div>
    </div>
  );
}
