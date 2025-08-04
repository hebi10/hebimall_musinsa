interface ProductReviewPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default async function ProductReviewPage({ params }: ProductReviewPageProps) {
  const { productId } = await params;

  return (
    <div>
      <h1>상품 리뷰</h1>
      <p>상품 ID: {productId}</p>
    </div>
  );
}
