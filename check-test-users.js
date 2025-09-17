const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');

require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function checkTestUsers() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('👥 Checking available test users...');
    
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, limit(10));
    const usersSnapshot = await getDocs(usersQuery);
    
    console.log('Total users found:', usersSnapshot.size);
    
    if (usersSnapshot.empty) {
      console.log('❌ No users found');
      return;
    }
    
    console.log('\n📋 Available test accounts:');
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log('---');
      console.log('User ID:', doc.id);
      console.log('Email:', data.email);
      console.log('Name:', data.name);
      console.log('Role:', data.role || 'user');
      console.log('Status:', data.status || 'active');
    });
    
    // 주문이 있는 사용자 확인
    console.log('\n📦 Users with orders:');
    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(ordersRef, limit(20));
    const ordersSnapshot = await getDocs(ordersQuery);
    
    const userOrderCounts = {};
    ordersSnapshot.forEach(doc => {
      const data = doc.data();
      const userId = data.userId;
      userOrderCounts[userId] = (userOrderCounts[userId] || 0) + 1;
    });
    
    Object.entries(userOrderCounts).forEach(([userId, count]) => {
      console.log(`User ${userId}: ${count} orders`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTestUsers().then(() => {
  console.log('✅ User check completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});