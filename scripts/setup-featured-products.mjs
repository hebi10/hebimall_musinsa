import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc, getDocs, updateDoc, Timestamp } from 'firebase/firestore';

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupFeaturedProducts() {
  console.log('🚀 추천 상품 시스템 설정 시작...\n');

  try {
    // 1. 상품 조회
    console.log('1️⃣ 실제 상품 조회...');
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const allProducts = [];
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryId = categoryDoc.id;
      const productsSnapshot = await getDocs(collection(db, 'categories', categoryId, 'products'));
      
      productsSnapshot.docs.forEach(productDoc => {
        const productData = productDoc.data();
        allProducts.push({
          id: productDoc.id,
          name: productData.name,
          brand: productData.brand,
          price: productData.price,
          category: categoryId,
          rating: productData.rating || 4.5,
          reviewCount: productData.reviewCount || 0
        });
      });
      
      if (allProducts.length >= 20) break; // 처음 20개만 가져오기
    }
    
    console.log(`✅ ${allProducts.length}개 상품 조회 완료`);
    
    // 2. 높은 평점 순으로 정렬해서 상위 4개 선택
    const topProducts = allProducts
      .sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount))
      .slice(0, 4);
    
    console.log('🏆 선정된 추천 상품:');
    topProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (${product.brand}) - ⭐${product.rating} 💬${product.reviewCount}`);
    });
    
    // 3. 추천 상품 설정 저장
    console.log('\n2️⃣ 추천 상품 설정 저장...');
    const featuredConfigRef = doc(db, 'featuredProducts', 'mainPageFeatured');
    
    const configData = {
      productIds: topProducts.map(p => p.id),
      title: '이번 주 추천 상품',
      subtitle: 'MD가 직접 선별한 특별한 상품들',
      description: '전문 MD가 엄선한 이번 주 추천 상품을 만나보세요',
      isActive: true,
      maxCount: 4,
      updatedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    };
    
    await setDoc(featuredConfigRef, configData);
    console.log('✅ 추천 상품 설정 저장 완료!');
    
    console.log('\n🎉 설정 완료! 이제 다음 페이지에서 확인하세요:');
    console.log('   - 메인 페이지: http://localhost:3000');
    console.log('   - 관리자 페이지: http://localhost:3000/admin/featured-products');
    
  } catch (error) {
    console.error('❌ 설정 실패:', error);
  }
}

setupFeaturedProducts();
