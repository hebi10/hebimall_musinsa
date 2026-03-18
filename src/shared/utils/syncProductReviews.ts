import { collection, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';

const LEGACY_CATEGORIES = [
  'clothing',
  'shoes',
  'bags',
  'jewelry',
  'accessories',
  'outdoor',
  'sports',
  'tops',
  'bottoms',
];

async function updateTopLevelProduct(productId: string, reviewCount: number, rating: number) {
  const productRef = doc(db, 'products', productId);
  const productSnapshot = await getDoc(productRef);

  if (!productSnapshot.exists()) {
    return false;
  }

  await updateDoc(productRef, {
    reviewCount,
    rating,
    updatedAt: new Date(),
  });

  return true;
}

async function updateLegacyProduct(productId: string, reviewCount: number, rating: number) {
  for (const categoryId of LEGACY_CATEGORIES) {
    const productRef = doc(db, 'categories', categoryId, 'products', productId);

    try {
      const snapshot = await getDoc(productRef);
      if (!snapshot.exists()) {
        continue;
      }

      await updateDoc(productRef, {
        reviewCount,
        rating,
        updatedAt: new Date(),
      });

      return true;
    } catch {
      continue;
    }
  }

  return false;
}

export async function syncProductReviewData(productId: string): Promise<{ reviewCount: number; rating: number }> {
  try {
    const reviewsCollection = collection(db, 'reviews');
    const reviewQuery = query(reviewsCollection, where('productId', '==', productId));
    const snapshot = await getDocs(reviewQuery);

    if (snapshot.empty) {
      return { reviewCount: 0, rating: 0 };
    }

    const reviews = snapshot.docs.map((reviewDoc) => reviewDoc.data());
    const reviewCount = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    const averageRating = Math.round((totalRating / reviewCount) * 10) / 10;

    await Promise.allSettled([
      updateTopLevelProduct(productId, reviewCount, averageRating),
      updateLegacyProduct(productId, reviewCount, averageRating),
    ]);

    return { reviewCount, rating: averageRating };
  } catch (error) {
    console.error('Failed to sync product reviews:', error);
    return { reviewCount: 0, rating: 0 };
  }
}

export async function syncAllProductsReviewData(): Promise<void> {
  try {
    const reviewsCollection = collection(db, 'reviews');
    const snapshot = await getDocs(reviewsCollection);
    const productReviews: Record<string, any[]> = {};

    snapshot.docs.forEach((reviewDoc) => {
      const review = reviewDoc.data();
      if (!review.productId) {
        return;
      }

      if (!productReviews[review.productId]) {
        productReviews[review.productId] = [];
      }

      productReviews[review.productId].push(review);
    });

    await Promise.all(
      Object.entries(productReviews).map(async ([productId, reviews]) => {
        const reviewCount = reviews.length;
        const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        const averageRating = Math.round((totalRating / reviewCount) * 10) / 10;

        await Promise.allSettled([
          updateTopLevelProduct(productId, reviewCount, averageRating),
          updateLegacyProduct(productId, reviewCount, averageRating),
        ]);
      })
    );
  } catch (error) {
    console.error('Failed to sync all product reviews:', error);
  }
}

export async function getProductReviewStats(productId: string): Promise<{ reviewCount: number; rating: number }> {
  try {
    const reviewsCollection = collection(db, 'reviews');
    const reviewQuery = query(reviewsCollection, where('productId', '==', productId));
    const snapshot = await getDocs(reviewQuery);

    if (snapshot.empty) {
      return { reviewCount: 0, rating: 0 };
    }

    const reviews = snapshot.docs.map((reviewDoc) => reviewDoc.data());
    const reviewCount = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    const averageRating = Math.round((totalRating / reviewCount) * 10) / 10;

    return { reviewCount, rating: averageRating };
  } catch (error) {
    console.error('Failed to load product review stats:', error);
    return { reviewCount: 0, rating: 0 };
  }
}
