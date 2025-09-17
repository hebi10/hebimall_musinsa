const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');

// 환경변수에서 Firebase 설정 읽기
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function checkFirestoreData() {
  try {
    console.log('🔍 Firebase Config Check:');
    console.log('Project ID:', firebaseConfig.projectId || 'MISSING');
    console.log('Auth Domain:', firebaseConfig.authDomain || 'MISSING');
    
    if (!firebaseConfig.projectId) {
      console.log('❌ Firebase configuration is missing from environment variables');
      return;
    }
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('🔍 Checking Firestore orders collection...');
    
    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(ordersRef, limit(5));
    const ordersSnapshot = await getDocs(ordersQuery);
    
    console.log('📦 Orders collection check:');
    console.log('Total documents:', ordersSnapshot.size);
    
    if (ordersSnapshot.empty) {
      console.log('❌ No orders found in Firestore');
      
      // 사용자 컬렉션도 확인
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, limit(3));
      const usersSnapshot = await getDocs(usersQuery);
      
      console.log('👥 Users collection check:');
      console.log('Total users:', usersSnapshot.size);
      
      if (!usersSnapshot.empty) {
        console.log('Available user IDs:');
        usersSnapshot.forEach(doc => {
          const data = doc.data();
          console.log('- User ID:', doc.id, 'Email:', data.email);
        });
      }
      
      return;
    }
    
    console.log('✅ Found orders:');
    ordersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log('Order ID:', doc.id);
      console.log('User ID:', data.userId);
      console.log('Status:', data.status);
      console.log('Order Number:', data.orderNumber);
      console.log('Created At:', data.createdAt?.toDate?.() || data.createdAt);
      console.log('---');
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 This might indicate:');
    console.log('  - Firebase project permissions issue');
    console.log('  - Network connectivity issues');
    console.log('  - Firestore rules blocking access');
  }
}

checkFirestoreData().then(() => {
  console.log('✅ Check completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});