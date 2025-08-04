interface CategoryPageProps {
  params: Promise<{
    categoryId: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = await params;

  return (
    <div>
      <h1>카테고리</h1>
      <p>카테고리 ID: {categoryId}</p>
    </div>
  );
}
