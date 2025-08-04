interface CategoryPageProps {
  params: {
    categoryId: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  return (
    <div>
      <h1>카테고리</h1>
      <p>카테고리 ID: {params.categoryId}</p>
    </div>
  );
}
