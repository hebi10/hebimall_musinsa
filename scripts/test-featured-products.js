const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

// Firebase Admin 초기화
if (!require('firebase-admin').apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
  };

  initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();

async function testFeaturedProductsSystem() {
  console.log('🧪 추천 상품 시스템 테스트 시작...\n');

  try {
    // 1. 추천 상품 설정 확인
    console.log('1️⃣ 추천 상품 설정 확인...');
    const featuredConfigRef = db.collection('featuredProducts').doc('mainPageFeatured');
    const configDoc = await featuredConfigRef.get();
    
    if (configDoc.exists) {
      const configData = configDoc.data();
      console.log('✅ 추천 상품 설정 발견:');
      console.log('   - 제목:', configData.title);
      console.log('   - 활성화:', configData.isActive);
      console.log('   - 상품 ID들:', configData.productIds);
      console.log('   - 최대 개수:', configData.maxCount);
    } else {
      console.log('❌ 추천 상품 설정이 없습니다.');
      
      // 기본 설정 생성
      console.log('🆕 기본 설정을 생성합니다...');
      await featuredConfigRef.set({
        productIds: [],
        title: '이번 주 추천 상품',
        subtitle: 'MD가 직접 선별한 특별한 상품들',
        description: '전문 MD가 엄선한 이번 주 추천 상품을 만나보세요',
        isActive: true,
        maxCount: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('✅ 기본 설정 생성 완료');
    }

    // 2. 상품 데이터 확인
    console.log('\n2️⃣ 상품 데이터 확인...');
    const categoriesSnapshot = await db.collection('categories').get();
    
    let totalProducts = 0;
    const sampleProducts = [];
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryId = categoryDoc.id;
      const productsSnapshot = await db.collection('categories').doc(categoryId).collection('products').limit(5).get();
      
      totalProducts += productsSnapshot.size;
      
      productsSnapshot.docs.forEach(productDoc => {
        if (sampleProducts.length < 10) {
          const productData = productDoc.data();
          sampleProducts.push({
            id: productDoc.id,
            name: productData.name,
            brand: productData.brand,
            category: categoryId,
            price: productData.price
          });
        }
      });
    }
    
    console.log(`✅ 총 ${categoriesSnapshot.size}개 카테고리에서 ${totalProducts}개 상품 발견`);
    console.log('📦 상품 샘플 (처음 10개):');
    sampleProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (${product.brand}) - ${product.price}원 [${product.category}]`);
    });

    // 3. 테스트 추천 상품 설정
    if (sampleProducts.length >= 4) {
      console.log('\n3️⃣ 테스트 추천 상품 설정...');
      const testProductIds = sampleProducts.slice(0, 4).map(p => p.id);
      
      await featuredConfigRef.update({
        productIds: testProductIds,
        updatedAt: new Date(),
      });
      
      console.log('✅ 테스트 추천 상품 설정 완료:');
      testProductIds.forEach((id, index) => {
        const product = sampleProducts[index];
        console.log(`   ${index + 1}. ${product.name} (ID: ${id})`);
      });
    }

    console.log('\n🎉 추천 상품 시스템 테스트 완료!');
    console.log('💡 이제 브라우저에서 다음 페이지들을 확인해보세요:');
    console.log('   - 메인 페이지: http://localhost:3000');
    console.log('   - 관리자 페이지: http://localhost:3000/admin/featured-products');

  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  }
}

testFeaturedProductsSystem();
