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

async function testSimpleQuery() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const userId = 'GVGIOt1TuQUOvSlXW0yNowvZspv1';
    console.log('🔍 Testing simple query for user:', userId);
    
    const ordersRef = collection(db, 'orders');
    
    console.log('📋 Testing simple query without orderBy...');
    const simpleQ = query(
      ordersRef,
      where('userId', '==', userId),
      limit(10)
    );
    
    const querySnapshot = await getDocs(simpleQ);
    console.log('✅ Simple query successful! Found', querySnapshot.size, 'orders');
    
    const orders = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        status: data.status,
        orderNumber: data.orderNumber,
        finalAmount: data.finalAmount
      });
    });
    
    // 클라이언트 정렬
    orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    console.log('📦 Sorted orders:');
    orders.forEach(order => {
      console.log(`- ${order.orderNumber}: ${order.status} (${order.finalAmount}원) - ${order.createdAt.toISOString()}`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error code:', error.code);
  }
}

testSimpleQuery().then(() => {
  console.log('✅ Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test script failed:', error.message);
  process.exit(1);
});