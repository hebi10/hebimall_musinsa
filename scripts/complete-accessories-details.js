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

async function completeAccessoriesDetails() {
  console.log('🔧 액세서리 카테고리 상세 정보 완성\n');
  
  try {
    const categoryProductsSnapshot = await getDocs(
      collection(db, 'categories', 'accessories', 'products')
    );
    
    let updated = 0;
    
    for (const productDoc of categoryProductsSnapshot.docs) {
      const productData = productDoc.data();
      
      // 이미 details가 있으면 스킵
      if (productData.details && productData.details.material) {
        continue;
      }
      
      const details = {
        material: '스테인리스 스틸, 가죽',
        origin: '한국',
        manufacturer: '스티나몰',
        precautions: '습기 주의, 화학물질 접촉 금지',
        size: '프리사이즈',
        adjustment: '조절 가능',
        coating: '니켈 프리',
        warranty: '1년'
      };
      
      await updateDoc(
        doc(db, 'categories', 'accessories', 'products', productDoc.id),
        { 
          details: details,
          updatedAt: new Date()
        }
      );
      
      updated++;
    }
    
    console.log(`✅ accessories: ${updated}개 상품 업데이트 완료`);
    
  } catch (error) {
    console.error('❌ 액세서리 업데이트 실패:', error);
  }
  
  process.exit(0);
}

completeAccessoriesDetails().catch(console.error);
