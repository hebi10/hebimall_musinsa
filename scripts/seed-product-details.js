const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, updateDoc, getDocs } = require('firebase/firestore');

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

// 카테고리별 상세 정보 템플릿
const detailsTemplates = {
  tops: {
    material: '면 100%',
    origin: '한국',
    manufacturer: '스티나몰',
    precautions: '30도 이하 찬물 세탁, 드라이클리닝 가능',
    size: 'S, M, L, XL',
    fit: '레귤러핏',
    thickness: '보통',
    stretch: '약간'
  },
  bottoms: {
    material: '면 98%, 스판덱스 2%',
    origin: '한국',
    manufacturer: '스티나몰',
    precautions: '30도 이하 찬물 세탁, 표백제 사용 금지',
    size: 'S, M, L, XL',
    fit: '슬림핏',
    waistType: '미드라이즈',
    length: '풀렝스'
  },
  shoes: {
    material: '천연가죽, 고무',
    origin: '베트남',
    manufacturer: '스티나몰',
    precautions: '직사광선 피해 보관, 습기 주의',
    size: '230-280mm',
    heelHeight: '2-3cm',
    sole: '고무창',
    closure: '끈'
  },
  bags: {
    material: '천연가죽, 면',
    origin: '한국',
    manufacturer: '스티나몰',
    precautions: '직사광선 피해 보관, 물기 주의',
    size: '가로 30cm x 세로 25cm x 폭 10cm',
    weight: '약 500g',
    compartments: '메인 수납공간 1개, 내부 포켓 2개',
    closure: '지퍼'
  },
  accessories: {
    material: '스테인리스 스틸, 가죽',
    origin: '한국',
    manufacturer: '스티나몰',
    precautions: '습기 주의, 화학물질 접촉 금지',
    size: '프리사이즈',
    adjustment: '조절 가능',
    coating: '니켈 프리',
    warranty: '1년'
  }
};

// 다양한 소재 옵션
const materialOptions = {
  tops: [
    '면 100%',
    '면 95%, 스판덱스 5%',
    '폴리에스터 100%',
    '울 80%, 나일론 20%',
    '린넨 100%',
    '모달 70%, 면 30%'
  ],
  bottoms: [
    '면 98%, 스판덱스 2%',
    '면 100%',
    '데님 (면 99%, 스판덱스 1%)',
    '폴리에스터 65%, 면 35%',
    '울 90%, 나일론 10%'
  ],
  shoes: [
    '천연가죽, 고무',
    '인조가죽, EVA',
    '캔버스, 고무',
    '메쉬, 폴리우레탄',
    '스웨이드, 고무'
  ],
  bags: [
    '천연가죽',
    '인조가죽',
    '캔버스',
    '나일론',
    '폴리에스터'
  ],
  accessories: [
    '스테인리스 스틸',
    '925 실버',
    '천연가죽',
    '인조가죽',
    '티타늄'
  ]
};

function getRandomDetail(category, field) {
  const template = detailsTemplates[category];
  if (!template) return '정보 없음';
  
  if (field === 'material' && materialOptions[category]) {
    const options = materialOptions[category];
    return options[Math.floor(Math.random() * options.length)];
  }
  
  return template[field] || '정보 없음';
}

async function addProductDetails() {
  console.log('🔧 상품 상세 정보 추가 시작\n');
  console.log('=' .repeat(60));

  const categories = ['tops', 'bottoms', 'shoes', 'bags', 'accessories'];
  let totalUpdated = 0;

  for (const categoryId of categories) {
    console.log(`\n📂 ${categoryId} 카테고리 처리 중...`);
    
    try {
      const categoryProductsSnapshot = await getDocs(
        collection(db, 'categories', categoryId, 'products')
      );
      
      let categoryUpdated = 0;
      
      for (const productDoc of categoryProductsSnapshot.docs) {
        const productData = productDoc.data();
        
        // 이미 details가 있으면 스킵
        if (productData.details && productData.details.material) {
          continue;
        }
        
        // 상세 정보 생성
        const details = {
          material: getRandomDetail(categoryId, 'material'),
          origin: getRandomDetail(categoryId, 'origin'),
          manufacturer: getRandomDetail(categoryId, 'manufacturer'),
          precautions: getRandomDetail(categoryId, 'precautions')
        };
        
        // 카테고리별 추가 정보
        if (categoryId === 'tops') {
          details.size = getRandomDetail(categoryId, 'size');
          details.fit = getRandomDetail(categoryId, 'fit');
          details.thickness = getRandomDetail(categoryId, 'thickness');
          details.stretch = getRandomDetail(categoryId, 'stretch');
        } else if (categoryId === 'bottoms') {
          details.size = getRandomDetail(categoryId, 'size');
          details.fit = getRandomDetail(categoryId, 'fit');
          details.waistType = getRandomDetail(categoryId, 'waistType');
          details.length = getRandomDetail(categoryId, 'length');
        } else if (categoryId === 'shoes') {
          details.size = getRandomDetail(categoryId, 'size');
          details.heelHeight = getRandomDetail(categoryId, 'heelHeight');
          details.sole = getRandomDetail(categoryId, 'sole');
          details.closure = getRandomDetail(categoryId, 'closure');
        } else if (categoryId === 'bags') {
          details.size = getRandomDetail(categoryId, 'size');
          details.weight = getRandomDetail(categoryId, 'weight');
          details.compartments = getRandomDetail(categoryId, 'compartments');
          details.closure = getRandomDetail(categoryId, 'closure');
        } else if (categoryId === 'accessories') {
          details.size = getRandomDetail(categoryId, 'size');
          details.adjustment = getRandomDetail(categoryId, 'adjustment');
          details.coating = getRandomDetail(categoryId, 'coating');
          details.warranty = getRandomDetail(categoryId, 'warranty');
        }
        
        // 업데이트
        await updateDoc(
          doc(db, 'categories', categoryId, 'products', productDoc.id),
          { 
            details: details,
            updatedAt: new Date()
          }
        );
        
        categoryUpdated++;
        totalUpdated++;
      }
      
      console.log(`   ✅ ${categoryId}: ${categoryUpdated}개 상품 업데이트`);
      
    } catch (error) {
      console.error(`   ❌ ${categoryId} 처리 실패:`, error);
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log(`🎉 상품 상세 정보 추가 완료!`);
  console.log(`총 업데이트된 상품: ${totalUpdated}개`);
  
  console.log('\n✨ 추가된 상세 정보:');
  console.log('   • 소재 정보');
  console.log('   • 원산지');
  console.log('   • 제조사');
  console.log('   • 취급 주의사항');
  console.log('   • 카테고리별 특화 정보 (사이즈, 핏 등)');
  
  console.log('\n🔍 이제 상품 상세 페이지에서 확인 가능:');
  console.log('   • /categories/tops/products/[productId]');
  console.log('   • /categories/shoes/products/[productId]');
  console.log('   • /categories/bags/products/[productId]');
  
  process.exit(0);
}

addProductDetails().catch(console.error);
