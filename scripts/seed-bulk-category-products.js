const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, writeBatch } = require('firebase/firestore');

require('dotenv').config({ path: '.env.local' });

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

// 카테고리별 대량 상품 데이터
const categoryProducts = {
  tops: [
    { name: '베이직 화이트 티셔츠', brand: 'BASIC', price: 19000, originalPrice: 25000, rating: 4.3, reviewCount: 156, description: '시원하고 편안한 면 100% 티셔츠', mainImage: '/images/products/white-tshirt.jpg', isSale: true, saleRate: 24 },
    { name: '오버핏 후드티', brand: 'STREET', price: 45000, originalPrice: null, rating: 4.6, reviewCount: 89, description: '트렌디한 오버핏 후드티', mainImage: '/images/products/hoodie.jpg', isSale: false, saleRate: 0 },
    { name: '스트라이프 긴팔 셔츠', brand: 'FORMAL', price: 59000, originalPrice: 75000, rating: 4.4, reviewCount: 67, description: '깔끔한 스트라이프 패턴 셔츠', mainImage: '/images/products/stripe-shirt.jpg', isSale: true, saleRate: 21 },
    { name: '카라 폴로 셔츠', brand: 'GOLF', price: 39000, originalPrice: null, rating: 4.2, reviewCount: 112, description: '고급스러운 카라 폴로 셔츠', mainImage: '/images/products/polo-shirt.jpg', isSale: false, saleRate: 0 },
    { name: '크롭 가디건', brand: 'FEMININE', price: 65000, originalPrice: 85000, rating: 4.7, reviewCount: 94, description: '여성스러운 크롭 가디건', mainImage: '/images/products/cardigan.jpg', isSale: true, saleRate: 24 },
    { name: '레터링 맨투맨', brand: 'YOUTH', price: 35000, originalPrice: null, rating: 4.1, reviewCount: 203, description: '캐주얼한 레터링 맨투맨', mainImage: '/images/products/sweatshirt.jpg', isSale: false, saleRate: 0 },
    { name: '니트 스웨터', brand: 'WARM', price: 89000, originalPrice: 119000, rating: 4.8, reviewCount: 45, description: '따뜻한 울 니트 스웨터', mainImage: '/images/products/knit-sweater.jpg', isSale: true, saleRate: 25 },
    { name: '플란넬 체크 셔츠', brand: 'CASUAL', price: 49000, originalPrice: null, rating: 4.3, reviewCount: 78, description: '부드러운 플란넬 체크 셔츠', mainImage: '/images/products/flannel-shirt.jpg', isSale: false, saleRate: 0 },
    { name: '라운드 긴팔 티', brand: 'BASIC', price: 25000, originalPrice: 32000, rating: 4.5, reviewCount: 167, description: '데일리 라운드 긴팔 티셔츠', mainImage: '/images/products/long-tee.jpg', isSale: true, saleRate: 22 },
    { name: '터틀넥 니트', brand: 'ELEGANT', price: 75000, originalPrice: null, rating: 4.6, reviewCount: 89, description: '고급스러운 터틀넥 니트', mainImage: '/images/products/turtleneck.jpg', isSale: false, saleRate: 0 },
    { name: '벨벳 블라우스', brand: 'LUXURY', price: 95000, originalPrice: 125000, rating: 4.9, reviewCount: 34, description: '고급 벨벳 소재 블라우스', mainImage: '/images/products/velvet-blouse.jpg', isSale: true, saleRate: 24 },
    { name: '데님 셔츠 재킷', brand: 'DENIM', price: 79000, originalPrice: null, rating: 4.4, reviewCount: 156, description: '빈티지 데님 셔츠 재킷', mainImage: '/images/products/denim-shirt.jpg', isSale: false, saleRate: 0 },
    { name: '크루넥 반팔티', brand: 'SUMMER', price: 15000, originalPrice: 20000, rating: 4.2, reviewCount: 289, description: '시원한 크루넥 반팔 티셔츠', mainImage: '/images/products/crew-tee.jpg', isSale: true, saleRate: 25 },
    { name: '린넨 셔츠', brand: 'NATURAL', price: 65000, originalPrice: null, rating: 4.7, reviewCount: 67, description: '시원한 린넨 소재 셔츠', mainImage: '/images/products/linen-shirt.jpg', isSale: false, saleRate: 0 },
    { name: '모크넥 니트', brand: 'MINIMAL', price: 69000, originalPrice: 89000, rating: 4.5, reviewCount: 123, description: '미니멀한 모크넥 니트', mainImage: '/images/products/mockneck.jpg', isSale: true, saleRate: 22 }
  ],
  
  bottoms: [
    { name: '클래식 청바지', brand: 'DENIM', price: 69000, originalPrice: 89000, rating: 4.5, reviewCount: 234, description: '편안한 스트레이트 핏 청바지', mainImage: '/images/products/classic-jeans.jpg', isSale: true, saleRate: 22 },
    { name: '와이드 팬츠', brand: 'COMFORT', price: 55000, originalPrice: null, rating: 4.6, reviewCount: 167, description: '편안한 와이드 핏 팬츠', mainImage: '/images/products/wide-pants.jpg', isSale: false, saleRate: 0 },
    { name: '정장 슬랙스', brand: 'FORMAL', price: 85000, originalPrice: 110000, rating: 4.7, reviewCount: 89, description: '고급 정장용 슬랙스', mainImage: '/images/products/dress-pants.jpg', isSale: true, saleRate: 23 },
    { name: '조거 팬츠', brand: 'ACTIVE', price: 39000, originalPrice: null, rating: 4.3, reviewCount: 145, description: '활동적인 조거 팬츠', mainImage: '/images/products/jogger-pants.jpg', isSale: false, saleRate: 0 },
    { name: '치노 팬츠', brand: 'CASUAL', price: 59000, originalPrice: 75000, rating: 4.4, reviewCount: 112, description: '캐주얼한 치노 팬츠', mainImage: '/images/products/chino-pants.jpg', isSale: true, saleRate: 21 },
    { name: '레깅스', brand: 'FITNESS', price: 25000, originalPrice: null, rating: 4.2, reviewCount: 203, description: '신축성 좋은 레깅스', mainImage: '/images/products/leggings.jpg', isSale: false, saleRate: 0 },
    { name: '플리츠 스커트', brand: 'FEMININE', price: 45000, originalPrice: 59000, rating: 4.8, reviewCount: 67, description: '우아한 플리츠 스커트', mainImage: '/images/products/pleats-skirt.jpg', isSale: true, saleRate: 24 },
    { name: '숏 팬츠', brand: 'SUMMER', price: 29000, originalPrice: null, rating: 4.1, reviewCount: 178, description: '시원한 여름용 숏 팬츠', mainImage: '/images/products/shorts.jpg', isSale: false, saleRate: 0 },
    { name: '스키니 진', brand: 'TIGHT', price: 65000, originalPrice: 85000, rating: 4.6, reviewCount: 156, description: '슬림한 스키니 핏 진', mainImage: '/images/products/skinny-jeans.jpg', isSale: true, saleRate: 24 },
    { name: '코듀로이 팬츠', brand: 'VINTAGE', price: 75000, originalPrice: null, rating: 4.5, reviewCount: 89, description: '빈티지 코듀로이 팬츠', mainImage: '/images/products/corduroy-pants.jpg', isSale: false, saleRate: 0 },
    { name: '트레이닝 팬츠', brand: 'SPORTS', price: 45000, originalPrice: 55000, rating: 4.3, reviewCount: 234, description: '운동용 트레이닝 팬츠', mainImage: '/images/products/training-pants.jpg', isSale: true, saleRate: 18 },
    { name: '미디 스커트', brand: 'CLASSIC', price: 55000, originalPrice: null, rating: 4.7, reviewCount: 78, description: '클래식한 미디 스커트', mainImage: '/images/products/midi-skirt.jpg', isSale: false, saleRate: 0 },
    { name: '바지 정장', brand: 'BUSINESS', price: 120000, originalPrice: 150000, rating: 4.8, reviewCount: 45, description: '고급 비즈니스 정장 바지', mainImage: '/images/products/suit-pants.jpg', isSale: true, saleRate: 20 }
  ],

  shoes: [
    { name: '화이트 스니커즈', brand: 'CLASSIC', price: 89000, originalPrice: 110000, rating: 4.6, reviewCount: 345, description: '클래식한 화이트 스니커즈', mainImage: '/images/products/white-sneakers.jpg', isSale: true, saleRate: 19 },
    { name: '런닝화', brand: 'SPORTS', price: 120000, originalPrice: null, rating: 4.7, reviewCount: 198, description: '편안한 러닝용 운동화', mainImage: '/images/products/running-shoes.jpg', isSale: false, saleRate: 0 },
    { name: '첼시 부츠', brand: 'LEATHER', price: 159000, originalPrice: 199000, rating: 4.8, reviewCount: 89, description: '고급 가죽 첼시 부츠', mainImage: '/images/products/chelsea-boots.jpg', isSale: true, saleRate: 20 },
    { name: '로퍼', brand: 'FORMAL', price: 99000, originalPrice: null, rating: 4.5, reviewCount: 167, description: '편안한 정장용 로퍼', mainImage: '/images/products/loafers.jpg', isSale: false, saleRate: 0 },
    { name: '하이킹 부츠', brand: 'OUTDOOR', price: 149000, originalPrice: 179000, rating: 4.9, reviewCount: 67, description: '견고한 하이킹 부츠', mainImage: '/images/products/hiking-boots.jpg', isSale: true, saleRate: 17 },
    { name: '샌들', brand: 'SUMMER', price: 45000, originalPrice: null, rating: 4.2, reviewCount: 234, description: '시원한 여름용 샌들', mainImage: '/images/products/sandals.jpg', isSale: false, saleRate: 0 },
    { name: '하이탑 스니커즈', brand: 'STREET', price: 95000, originalPrice: 125000, rating: 4.4, reviewCount: 145, description: '스트리트 하이탑 스니커즈', mainImage: '/images/products/hightop-sneakers.jpg', isSale: true, saleRate: 24 },
    { name: '옥스포드 구두', brand: 'CLASSIC', price: 139000, originalPrice: null, rating: 4.6, reviewCount: 78, description: '클래식 옥스포드 구두', mainImage: '/images/products/oxford-shoes.jpg', isSale: false, saleRate: 0 },
    { name: '슬립온', brand: 'CASUAL', price: 65000, originalPrice: 79000, rating: 4.3, reviewCount: 189, description: '편안한 슬립온 신발', mainImage: '/images/products/slip-on.jpg', isSale: true, saleRate: 18 },
    { name: '앵클부츠', brand: 'FASHION', price: 125000, originalPrice: null, rating: 4.7, reviewCount: 123, description: '스타일리시한 앵클부츠', mainImage: '/images/products/ankle-boots.jpg', isSale: false, saleRate: 0 },
    { name: '농구화', brand: 'BASKETBALL', price: 110000, originalPrice: 135000, rating: 4.5, reviewCount: 156, description: '전문 농구용 신발', mainImage: '/images/products/basketball-shoes.jpg', isSale: true, saleRate: 19 },
    { name: '드레스 슈즈', brand: 'FORMAL', price: 169000, originalPrice: null, rating: 4.8, reviewCount: 89, description: '고급 드레스 슈즈', mainImage: '/images/products/dress-shoes.jpg', isSale: false, saleRate: 0 },
    { name: '컨버스 스타일', brand: 'RETRO', price: 79000, originalPrice: 95000, rating: 4.4, reviewCount: 267, description: '레트로 컨버스 스타일', mainImage: '/images/products/converse-style.jpg', isSale: true, saleRate: 17 },
    { name: '워커 부츠', brand: 'WORK', price: 135000, originalPrice: null, rating: 4.6, reviewCount: 134, description: '견고한 워커 부츠', mainImage: '/images/products/worker-boots.jpg', isSale: false, saleRate: 0 },
    { name: '발레 플랫', brand: 'FEMININE', price: 55000, originalPrice: 69000, rating: 4.2, reviewCount: 198, description: '우아한 발레 플랫 슈즈', mainImage: '/images/products/ballet-flats.jpg', isSale: true, saleRate: 20 }
  ],

  bags: [
    { name: '가죽 토트백', brand: 'LEATHER', price: 129000, originalPrice: 159000, rating: 4.7, reviewCount: 145, description: '고급 가죽 토트백', mainImage: '/images/products/leather-tote.jpg', isSale: true, saleRate: 19 },
    { name: '백팩', brand: 'DAILY', price: 65000, originalPrice: null, rating: 4.5, reviewCount: 234, description: '일상용 편안한 백팩', mainImage: '/images/products/backpack.jpg', isSale: false, saleRate: 0 },
    { name: '크로스백', brand: 'SMALL', price: 45000, originalPrice: 59000, rating: 4.3, reviewCount: 189, description: '실용적인 크로스백', mainImage: '/images/products/crossbag.jpg', isSale: true, saleRate: 24 },
    { name: '클러치백', brand: 'EVENING', price: 89000, originalPrice: null, rating: 4.6, reviewCount: 78, description: '이브닝용 클러치백', mainImage: '/images/products/clutch.jpg', isSale: false, saleRate: 0 },
    { name: '숄더백', brand: 'CLASSIC', price: 95000, originalPrice: 120000, rating: 4.8, reviewCount: 167, description: '클래식 숄더백', mainImage: '/images/products/shoulder-bag.jpg', isSale: true, saleRate: 21 },
    { name: '미니백', brand: 'MINI', price: 35000, originalPrice: null, rating: 4.2, reviewCount: 156, description: '귀여운 미니백', mainImage: '/images/products/mini-bag.jpg', isSale: false, saleRate: 0 },
    { name: '비즈니스 가방', brand: 'BUSINESS', price: 149000, originalPrice: 189000, rating: 4.9, reviewCount: 89, description: '전문적인 비즈니스 가방', mainImage: '/images/products/business-bag.jpg', isSale: true, saleRate: 21 },
    { name: '웨이스트백', brand: 'SPORT', price: 39000, originalPrice: null, rating: 4.1, reviewCount: 123, description: '활동적인 웨이스트백', mainImage: '/images/products/waist-bag.jpg', isSale: false, saleRate: 0 },
    { name: '여행용 캐리어', brand: 'TRAVEL', price: 199000, originalPrice: 249000, rating: 4.7, reviewCount: 134, description: '견고한 여행용 캐리어', mainImage: '/images/products/suitcase.jpg', isSale: true, saleRate: 20 },
    { name: '버킷백', brand: 'TRENDY', price: 75000, originalPrice: null, rating: 4.4, reviewCount: 198, description: '트렌디한 버킷백', mainImage: '/images/products/bucket-bag.jpg', isSale: false, saleRate: 0 },
    { name: '메신저백', brand: 'CASUAL', price: 55000, originalPrice: 69000, rating: 4.3, reviewCount: 145, description: '캐주얼 메신저백', mainImage: '/images/products/messenger-bag.jpg', isSale: true, saleRate: 20 },
    { name: '핸드백', brand: 'ELEGANT', price: 119000, originalPrice: null, rating: 4.8, reviewCount: 167, description: '우아한 핸드백', mainImage: '/images/products/handbag.jpg', isSale: false, saleRate: 0 }
  ],

  accessories: [
    { name: '가죽 벨트', brand: 'LEATHER', price: 45000, originalPrice: 59000, rating: 4.5, reviewCount: 189, description: '고급 가죽 벨트', mainImage: '/images/products/leather-belt.jpg', isSale: true, saleRate: 24 },
    { name: '선글라스', brand: 'EYEWEAR', price: 89000, originalPrice: null, rating: 4.6, reviewCount: 145, description: 'UV 차단 선글라스', mainImage: '/images/products/sunglasses.jpg', isSale: false, saleRate: 0 },
    { name: '시계', brand: 'TIMEPIECE', price: 159000, originalPrice: 199000, rating: 4.8, reviewCount: 78, description: '스테인리스 시계', mainImage: '/images/products/watch.jpg', isSale: true, saleRate: 20 },
    { name: '목걸이', brand: 'JEWELRY', price: 65000, originalPrice: null, rating: 4.3, reviewCount: 234, description: '실버 목걸이', mainImage: '/images/products/necklace.jpg', isSale: false, saleRate: 0 },
    { name: '반지', brand: 'RING', price: 35000, originalPrice: 45000, rating: 4.2, reviewCount: 167, description: '스테인리스 반지', mainImage: '/images/products/ring.jpg', isSale: true, saleRate: 22 },
    { name: '모자', brand: 'HAT', price: 29000, originalPrice: null, rating: 4.4, reviewCount: 156, description: '캐주얼 볼캡', mainImage: '/images/products/cap.jpg', isSale: false, saleRate: 0 },
    { name: '스카프', brand: 'FABRIC', price: 39000, originalPrice: 49000, rating: 4.7, reviewCount: 123, description: '실크 스카프', mainImage: '/images/products/scarf.jpg', isSale: true, saleRate: 20 },
    { name: '장갑', brand: 'WINTER', price: 25000, originalPrice: null, rating: 4.1, reviewCount: 89, description: '따뜻한 겨울 장갑', mainImage: '/images/products/gloves.jpg', isSale: false, saleRate: 0 },
    { name: '귀걸이', brand: 'JEWELRY', price: 55000, originalPrice: 69000, rating: 4.6, reviewCount: 134, description: '실버 귀걸이', mainImage: '/images/products/earrings.jpg', isSale: true, saleRate: 20 },
    { name: '팔찌', brand: 'BRACELET', price: 45000, originalPrice: null, rating: 4.5, reviewCount: 198, description: '가죽 팔찌', mainImage: '/images/products/bracelet.jpg', isSale: false, saleRate: 0 },
    { name: '넥타이', brand: 'FORMAL', price: 35000, originalPrice: 45000, rating: 4.3, reviewCount: 112, description: '실크 넥타이', mainImage: '/images/products/necktie.jpg', isSale: true, saleRate: 22 },
    { name: '머리핀', brand: 'HAIR', price: 15000, originalPrice: null, rating: 4.0, reviewCount: 267, description: '헤어 액세서리', mainImage: '/images/products/hairpin.jpg', isSale: false, saleRate: 0 },
    { name: '키링', brand: 'KEY', price: 19000, originalPrice: 25000, rating: 4.2, reviewCount: 145, description: '가죽 키링', mainImage: '/images/products/keyring.jpg', isSale: true, saleRate: 24 },
    { name: '지갑', brand: 'WALLET', price: 75000, originalPrice: null, rating: 4.7, reviewCount: 189, description: '가죽 장지갑', mainImage: '/images/products/wallet.jpg', isSale: false, saleRate: 0 },
    { name: '헤어밴드', brand: 'HAIR', price: 22000, originalPrice: 29000, rating: 4.1, reviewCount: 123, description: '스포츠 헤어밴드', mainImage: '/images/products/headband.jpg', isSale: true, saleRate: 24 }
  ]
};

async function addBulkCategoryProducts() {
  console.log('🚀 카테고리별 대량 상품 데이터 추가 시작\n');
  console.log('=' .repeat(60));

  let totalAdded = 0;

  for (const [categoryId, products] of Object.entries(categoryProducts)) {
    console.log(`\n📂 ${categoryId} 카테고리 상품 추가 중...`);
    
    try {
      const batch = writeBatch(db);
      let batchCount = 0;
      let batchNumber = 1;
      
      for (const product of products) {
        const productRef = doc(collection(db, 'categories', categoryId, 'products'));
        
        const productData = {
          ...product,
          category: categoryId,
          stock: Math.floor(Math.random() * 50) + 10, // 10-59 랜덤 재고
          isNew: Math.random() > 0.7, // 30% 확률로 신상품
          tags: [`${categoryId}`, product.brand.toLowerCase()],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        batch.set(productRef, productData);
        batchCount++;
        totalAdded++;
        
        // Firestore 배치 한계 (500개)를 고려하여 나누어 처리
        if (batchCount === 400) {
          await batch.commit();
          console.log(`   ✅ 배치 ${batchNumber} 완료: ${batchCount}개`);
          batchCount = 0;
          batchNumber++;
          
          // 새로운 배치 시작
          const newBatch = writeBatch(db);
          Object.assign(batch, newBatch);
        }
      }
      
      // 남은 상품들 처리
      if (batchCount > 0) {
        await batch.commit();
        console.log(`   ✅ 배치 ${batchNumber} 완료: ${batchCount}개`);
      }
      
      console.log(`   📊 ${categoryId}: ${products.length}개 상품 추가 완료`);
      
    } catch (error) {
      console.error(`   ❌ ${categoryId} 상품 추가 실패:`, error);
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log(`🎉 대량 상품 데이터 추가 완료!`);
  console.log(`📊 총 추가된 상품: ${totalAdded}개`);
  console.log('\n📂 카테고리별 상품 수:');
  
  for (const [categoryId, products] of Object.entries(categoryProducts)) {
    console.log(`   ${categoryId}: ${products.length}개`);
  }
  
  console.log('\n🌐 URL 테스트:');
  console.log('   /categories/tops - 상의 (15개)');
  console.log('   /categories/bottoms - 하의 (13개)');
  console.log('   /categories/shoes - 신발 (15개)');
  console.log('   /categories/bags - 가방 (12개)');
  console.log('   /categories/accessories - 액세서리 (15개)');
  
  process.exit(0);
}

addBulkCategoryProducts().catch(console.error);
