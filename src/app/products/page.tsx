import PageHeader from "@/app/_components/PageHeader";
import ProductList from "./_components/ProductList";
import styles from "./page.module.css";

export default function ProductsPage() {
  return (
    <div className={styles.container}>
      <PageHeader
        title="전체 상품"
        description="HEBIMALL의 다양한 상품을 만나보세요"
        breadcrumb={[
          { label: '홈', href: '/' },
          { label: '전체 상품' }
        ]}
      />
      
      <div className={styles.content}>
        <ProductList />
      </div>
    </div>
  );
}
