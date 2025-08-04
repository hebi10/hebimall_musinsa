interface ProductQAPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default async function ProductQAPage({ params }: ProductQAPageProps) {
  const { productId } = await params;

  return (
    <div>
      <h1>상품 Q&A</h1>
      <p>상품 ID: {productId}</p>
    </div>
  );
}
