const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query, where, orderBy } = require('firebase/firestore');

require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function testOrderQuery() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const userId = 'GVGIOt1TuQUOvSlXW0yNowvZspv1';
    console.log('🔍 Testing order query for user:', userId);
    
    const ordersRef = collection(db, 'orders');
    
    try {
      // 복합 인덱스 쿼리 테스트
      console.log('📋 Testing composite index query...');
      const compositeQ = query(
        ordersRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      const compositeSnapshot = await getDocs(compositeQ);
      console.log('✅ Composite query successful! Found', compositeSnapshot.size, 'orders');
      
      compositeSnapshot.forEach(doc => {
        const data = doc.data();
        console.log('- Order:', doc.id, 'Status:', data.status, 'Created:', data.createdAt?.toDate?.());
      });
      
    } catch (error) {
      console.warn('⚠️ Composite query failed:', error.message);
      
      // Fallback 쿼리 테스트
      console.log('📋 Testing fallback query...');
      const fallbackQ = query(
        ordersRef,
        where('userId', '==', userId),
        limit(10)
      );
      
      const fallbackSnapshot = await getDocs(fallbackQ);
      console.log('✅ Fallback query successful! Found', fallbackSnapshot.size, 'orders');
      
      const orders = [];
      fallbackSnapshot.forEach(doc => {
        const data = doc.data();
        orders.push({
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          status: data.status,
          orderNumber: data.orderNumber
        });
      });
      
      // 클라이언트 정렬
      orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      console.log('📦 Sorted orders:');
      orders.forEach(order => {
        console.log('- Order:', order.id, 'Status:', order.status, 'Created:', order.createdAt);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOrderQuery().then(() => {
  console.log('✅ Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test script failed:', error.message);
  process.exit(1);
});