interface ProductQAPageProps {
  params: {
    productId: string;
  };
}

export default function ProductQAPage({ params }: ProductQAPageProps) {
  return (
    <div>
      <h1>상품 Q&A</h1>
      <p>상품 ID: {params.productId}</p>
    </div>
  );
}
