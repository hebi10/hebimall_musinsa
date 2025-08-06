import Link from "next/link";
import styles from "../layout.module.css";

interface QuickAction {
  icon: string;
  title: string;
  desc: string;
  href: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className={styles.quickActions}>
      {actions.map((action) => (
        <Link key={action.title} href={action.href} className={styles.actionCard}>
          <div className={styles.actionIcon}>{action.icon}</div>
          <div className={styles.actionTitle}>{action.title}</div>
          <div className={styles.actionDesc}>{action.desc}</div>
        </Link>
      ))}
    </div>
  );
}
