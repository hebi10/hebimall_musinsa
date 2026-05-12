import { Suspense } from 'react';
import RecommendClient from './RecommendClient';

function RecommendFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      color: '#666',
    }}>
      추천 상품 목록을 불러오는 중입니다...
    </div>
  );
}

export default function RecommendPage() {
  return (
    <Suspense fallback={<RecommendFallback />}>
      <RecommendClient />
    </Suspense>
  );
}
