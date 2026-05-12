import styles from './page.module.css';

export default function FindEmailPage() {
  return (
    <div className={styles.container}>
      <section className={styles.panel}>
        <h1 className={styles.title}>이메일 찾기</h1>
        <p className={styles.description}>
          가입 시 사용한 이름과 연락처로 이메일 확인을 도와드리겠습니다.
        </p>
      </section>
    </div>
  );
}
