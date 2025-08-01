import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: Array<{ label: string; href?: string }>;
}

export default function PageHeader({ title, description, breadcrumb }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.container}>
        {breadcrumb && (
          <nav className={styles.breadcrumb}>
            <ol className={styles.breadcrumbList}>
              {breadcrumb.map((item, index) => (
                <li key={index} className={styles.breadcrumbItem}>
                  {index > 0 && <span className={styles.breadcrumbSeparator}>/</span>}
                  {item.href ? (
                    <a href={item.href} className={styles.breadcrumbLink}>
                      {item.label}
                    </a>
                  ) : (
                    <span className={styles.breadcrumbCurrent}>{item.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className={styles.title}>{title}</h1>
        {description && (
          <p className={styles.description}>{description}</p>
        )}
      </div>
    </div>
  );
}
