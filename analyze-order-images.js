// 실제 주문 데이터의 이미지 URL을 확인하고 테스트하는 스크립트
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query, where } = require('firebase/firestore');

require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function analyzeOrderImages() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('🔍 주문 데이터의 이미지 URL 분석 시작...');
    
    // 모든 주문 데이터 가져오기
    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(ordersRef, limit(10));
    const ordersSnapshot = await getDocs(ordersQuery);
    
    if (ordersSnapshot.empty) {
      console.log('❌ 주문 데이터가 없습니다.');
      return;
    }
    
    console.log(`📦 총 ${ordersSnapshot.size}개의 주문 발견`);
    console.log('=' * 50);
    
    let firebaseImageCount = 0;
    let localImageCount = 0;
    let emptyImageCount = 0;
    const uniqueImages = new Set();
    
    ordersSnapshot.forEach((doc, orderIndex) => {
      const orderData = doc.data();
      console.log(`\n📋 주문 ${orderIndex + 1}: ${orderData.orderNumber || doc.id}`);
      
      if (orderData.products && Array.isArray(orderData.products)) {
        orderData.products.forEach((product, productIndex) => {
          const imageUrl = product.productImage;
          console.log(`  상품 ${productIndex + 1}: ${product.productName}`);
          console.log(`    이미지 URL: ${imageUrl || '(없음)'}`);
          
          if (!imageUrl || imageUrl.trim() === '') {
            emptyImageCount++;
            console.log(`    ❌ 이미지 URL 없음`);
          } else if (imageUrl.includes('firebasestorage.googleapis.com')) {
            firebaseImageCount++;
            uniqueImages.add(imageUrl);
            console.log(`    🔥 Firebase Storage URL`);
            
            // URL 구조 분석
            try {
              const url = new URL(imageUrl);
              const pathname = url.pathname;
              const match = pathname.match(/\/v0\/b\/[^/]+\/o\/(.+)/);
              if (match) {
                const encodedPath = match[1].split('?')[0];
                const filePath = decodeURIComponent(encodedPath);
                console.log(`    📁 파일 경로: ${filePath}`);
              }
            } catch (e) {
              console.log(`    ⚠️  URL 파싱 실패: ${e.message}`);
            }
          } else if (imageUrl.startsWith('/')) {
            localImageCount++;
            console.log(`    📂 로컬 이미지 경로`);
          } else {
            console.log(`    ❓ 알 수 없는 이미지 형식`);
          }
        });
      } else {
        console.log(`  ⚠️  상품 데이터 없음`);
      }
    });
    
    console.log('\n' + '=' * 50);
    console.log('📊 이미지 URL 분석 결과:');
    console.log(`  🔥 Firebase Storage 이미지: ${firebaseImageCount}개`);
    console.log(`  📂 로컬 이미지: ${localImageCount}개`);
    console.log(`  ❌ 이미지 없음: ${emptyImageCount}개`);
    console.log(`  🆔 고유 Firebase 이미지: ${uniqueImages.size}개`);
    
    // Firebase Storage 이미지 접근성 테스트
    if (uniqueImages.size > 0) {
      console.log('\n🧪 Firebase Storage 이미지 접근성 테스트...');
      
      let testCount = 0;
      for (const imageUrl of uniqueImages) {
        if (testCount >= 3) break; // 처음 3개만 테스트
        
        console.log(`\n테스트 ${testCount + 1}: ${imageUrl}`);
        
        try {
          // Node.js에서 HTTP 요청으로 이미지 접근성 테스트
          const https = require('https');
          const url = require('url');
          
          await new Promise((resolve, reject) => {
            const parsedUrl = url.parse(imageUrl);
            const req = https.request({
              hostname: parsedUrl.hostname,
              path: parsedUrl.path,
              method: 'HEAD',
              timeout: 5000
            }, (res) => {
              console.log(`  📊 HTTP Status: ${res.statusCode}`);
              console.log(`  📏 Content-Length: ${res.headers['content-length'] || 'unknown'}`);
              console.log(`  📋 Content-Type: ${res.headers['content-type'] || 'unknown'}`);
              
              if (res.statusCode === 200) {
                console.log(`  ✅ 접근 가능`);
              } else {
                console.log(`  ❌ 접근 불가: ${res.statusCode}`);
              }
              resolve();
            });
            
            req.on('error', (err) => {
              console.log(`  ❌ 요청 실패: ${err.message}`);
              resolve();
            });
            
            req.on('timeout', () => {
              console.log(`  ⏰ 요청 타임아웃`);
              req.destroy();
              resolve();
            });
            
            req.end();
          });
          
        } catch (error) {
          console.log(`  ❌ 테스트 실패: ${error.message}`);
        }
        
        testCount++;
      }
    }
    
    console.log('\n✅ 이미지 URL 분석 완료');
    
  } catch (error) {
    console.error('❌ 분석 실패:', error.message);
  }
}

if (require.main === module) {
  analyzeOrderImages().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('❌ 스크립트 실행 실패:', error.message);
    process.exit(1);
  });
}

module.exports = { analyzeOrderImages };