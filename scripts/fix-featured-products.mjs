import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc, getDocs, updateDoc, Timestamp } from 'firebase/firestore';

// Firebase 클라이언트 설정 (환경변수는 런타임에 읽음)
const firebaseConfig = {
  apiKey: "AIzaSyDT7zWbnBF6_fOHwwP68l7x7W7xb6-Yl7o",
  authDomain: "hebimall-musinsa.firebaseapp.com",
  projectId: "hebimall-musinsa",
  storageBucket: "hebimall-musinsa.firebasestorage.app",
  messagingSenderId: "1003829063103",
  appId: "1:1003829063103:web:e14e476e1bee8ffbcdb9aa"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixFeaturedProducts() {
  console.log('🔧 추천 상품 시스템 강제 수정 시작...\n');

  try {
    // 1. 기존 설정 확인
    console.log('1️⃣ 기존 추천 상품 설정 확인...');
    const featuredConfigRef = doc(db, 'featuredProducts', 'mainPageFeatured');
    const configDoc = await getDoc(featuredConfigRef);
    
    if (configDoc.exists()) {
      console.log('📋 기존 설정:', configDoc.data());
    } else {
      console.log('❌ 기존 설정이 없습니다.');
    }

    // 2. 실제 상품 조회
    console.log('\n2️⃣ 실제 상품 조회...');
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const allProducts = [];
    
    console.log(`📦 총 ${categoriesSnapshot.size}개 카테고리 발견`);
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryId = categoryDoc.id;
      console.log(`   📁 ${categoryId} 카테고리 확인 중...`);
      
      const productsSnapshot = await getDocs(collection(db, 'categories', categoryId, 'products'));
      console.log(`      └─ ${productsSnapshot.size}개 상품 발견`);
      
      productsSnapshot.docs.forEach(productDoc => {
        const productData = productDoc.data();
        allProducts.push({
          id: productDoc.id,
          name: productData.name,
          brand: productData.brand,
          price: productData.price,
          category: categoryId,
          rating: productData.rating || 4.5,
          reviewCount: productData.reviewCount || Math.floor(Math.random() * 100) + 10,
          mainImage: productData.mainImage || productData.images?.[0] || ''
        });
      });
      
      if (allProducts.length >= 20) break; // 처음 20개만
    }
    
    console.log(`✅ 총 ${allProducts.length}개 상품 조회 완료`);

    if (allProducts.length === 0) {
      console.log('❌ 상품이 하나도 없습니다! 먼저 상품을 등록해주세요.');
      return;
    }

    // 3. 최고 평점 상품 선별
    console.log('\n3️⃣ 추천 상품 자동 선별...');
    const topProducts = allProducts
      .sort((a, b) => {
        const scoreA = a.rating * Math.log(a.reviewCount + 1);
        const scoreB = b.rating * Math.log(b.reviewCount + 1);
        return scoreB - scoreA;
      })
      .slice(0, 4);
    
    console.log('🏆 선정된 추천 상품:');
    topProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (${product.brand})`);
      console.log(`      ⭐ ${product.rating} | 💬 ${product.reviewCount} | 💰 ${product.price.toLocaleString()}원`);
    });

    // 4. 강제 설정 저장
    console.log('\n4️⃣ 추천 상품 설정 강제 저장...');
    const newConfig = {
      productIds: topProducts.map(p => p.id),
      title: '이번 주 추천 상품',
      subtitle: 'MD가 직접 선별한 특별한 상품들',
      description: '전문 MD가 엄선한 이번 주 추천 상품을 만나보세요',
      isActive: true,
      maxCount: 4,
      updatedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    };
    
    // 기존 설정 덮어쓰기
    await setDoc(featuredConfigRef, newConfig, { merge: false });
    console.log('✅ 추천 상품 설정 강제 저장 완료!');

    // 5. 저장 확인
    console.log('\n5️⃣ 저장 확인...');
    const verifyDoc = await getDoc(featuredConfigRef);
    if (verifyDoc.exists()) {
      const verifyData = verifyDoc.data();
      console.log('✅ 저장 확인됨:');
      console.log('   - 활성화:', verifyData.isActive);
      console.log('   - 상품 개수:', verifyData.productIds?.length);
      console.log('   - 상품 ID들:', verifyData.productIds);
    } else {
      console.log('❌ 저장 확인 실패');
    }

    console.log('\n🎉 추천 상품 시스템 수정 완료!');
    console.log('💡 이제 브라우저에서 확인해보세요:');
    console.log('   - 메인 페이지: http://localhost:3000');
    console.log('   - 관리자 페이지: http://localhost:3000/admin/featured-products');
    console.log('\n🔄 브라우저를 새로고침해주세요!');

  } catch (error) {
    console.error('❌ 수정 실패:', error);
    console.error('상세 오류:', error.message);
  }
}

// 즉시 실행
fixFeaturedProducts();
