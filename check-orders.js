const admin = require('firebase-admin');
const path = require('path');

// Service account key 파일 경로 확인
const serviceAccountPath = path.join(__dirname, 'functions', 'src', 'config', 'serviceAccountKey.json');

async function checkFirestoreData() {
  try {
    console.log('🔍 Service account path:', serviceAccountPath);
    
    const serviceAccount = require(serviceAccountPath);
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    const db = admin.firestore();

    console.log('🔍 Checking Firestore orders collection...');
    const ordersSnapshot = await db.collection('orders').limit(5).get();
    console.log('📦 Orders collection check:');
    console.log('Total documents:', ordersSnapshot.size);
    
    if (ordersSnapshot.empty) {
      console.log('❌ No orders found in Firestore');
      
      // 사용자 컬렉션도 확인
      const usersSnapshot = await db.collection('users').limit(3).get();
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
    console.log('  - Service account key file is missing');
    console.log('  - Firebase project is not properly configured');
    console.log('  - Network connectivity issues');
  }
}

checkFirestoreData().then(() => {
  console.log('✅ Check completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});