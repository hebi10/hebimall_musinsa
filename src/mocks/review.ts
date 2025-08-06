import { Review } from '@/shared/types/review';

export const mockReviews: Review[] = [
  {
    id: 'review-1',
    productId: 'product-1',
    userId: 'user-1',
    userName: '김**',
    rating: 5,
    title: '정말 만족합니다!',
    content: '소재도 좋고 핏도 완벽해요. 배송도 빨라서 좋았습니다.',
    images: [],
    size: 'M',
    color: 'black',
    height: 170,
    weight: 65,
    isRecommended: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'review-2',
    productId: 'product-2',
    userId: 'user-2',
    userName: '이**',
    rating: 4,
    title: '괜찮아요',
    content: '생각보다 얇은 느낌이지만 여름용으로는 좋을 것 같아요.',
    images: [],
    size: 'L',
    color: 'white',
    isRecommended: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'review-3',
    productId: 'product-3',
    userId: 'user-3',
    userName: '박**',
    rating: 2,
    title: '별로예요',
    content: '사진과 실제 상품이 달라요. 품질도 기대에 못 미칩니다.',
    images: [],
    size: 'M',
    color: 'navy',
    isRecommended: false,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08')
  }
];
