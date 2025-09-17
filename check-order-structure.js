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

async function checkOrderStructure() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('🔍 Checking specific user orders...');
    
    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(ordersRef, where('userId', '==', 'GVGIOt1TuQUOvSlXW0yNowvZspv1'), limit(3));
    const ordersSnapshot = await getDocs(ordersQuery);
    
    console.log('📦 Orders for user GVGIOt1TuQUOvSlXW0yNowvZspv1:');
    console.log('Total documents:', ordersSnapshot.size);
    
    if (ordersSnapshot.empty) {
      console.log('❌ No orders found for this user');
      return;
    }
    
    ordersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log('=== Order Details ===');
      console.log('Order ID:', doc.id);
      console.log('Order Number:', data.orderNumber);
      console.log('User ID:', data.userId);
      console.log('Status:', data.status);
      console.log('Final Amount:', data.finalAmount);
      console.log('Products:', JSON.stringify(data.products, null, 2));
      console.log('Created At:', data.createdAt?.toDate?.() || data.createdAt);
      console.log('Updated At:', data.updatedAt?.toDate?.() || data.updatedAt);
      console.log('Shipping Address:', JSON.stringify(data.shippingAddress, null, 2));
      console.log('Payment Info:', JSON.stringify(data.paymentInfo, null, 2));
      console.log('========================');
    });
    
    // 사용자 정보도 확인
    console.log('\n👥 Checking user info...');
    const userRef = collection(db, 'users');
    const userQuery = query(userRef, where('__name__', '==', 'GVGIOt1TuQUOvSlXW0yNowvZspv1'));
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      userSnapshot.forEach(doc => {
        const data = doc.data();
        console.log('User Email:', data.email);
        console.log('User Name:', data.name);
        console.log('User Role:', data.role);
      });
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

checkOrderStructure().then(() => {
  console.log('✅ Structure check completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});