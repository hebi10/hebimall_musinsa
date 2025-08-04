interface ProductReviewPageProps {
  params: {
    productId: string;
  };
}

export default function ProductReviewPage({ params }: ProductReviewPageProps) {
  return (
    <div>
      <h1>상품 리뷰</h1>
      <p>상품 ID: {params.productId}</p>
    </div>
  );
}
