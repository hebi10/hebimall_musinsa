// 사용자 컬렉션 구조 확인 스크립트
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBaKyZ8Z3eWw6n8kKhvJ7rFVlD1RhBKx-k",
  authDomain: "hebi-mall.firebaseapp.com",
  projectId: "hebi-mall",
  storageBucket: "hebi-mall.firebasestorage.app",
  messagingSenderId: "82467588522",
  appId: "1:82467588522:web:9b8d8e7b4e5c8d6a7f8b9c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkUsersCollection() {  
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    console.log(`\n📊 총 사용자 수: ${usersSnapshot.size}`);
    
    if (usersSnapshot.size === 0) {
      console.log('❌ users 컬렉션에 데이터가 없습니다.');
      return;
    }
    
    console.log('\n👥 사용자 목록:');
    usersSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. 사용자 ID: ${doc.id}`);
      console.log(`   이름: ${data.name || data.displayName || '없음'}`);
      console.log(`   이메일: ${data.email || '없음'}`);
      console.log(`   역할: ${data.role || '없음'}`);
      console.log(`   상태: ${data.status || '없음'}`);
      console.log(`   가입일: ${data.joinDate || data.createdAt?.toDate?.()?.toDateString() || '없음'}`);
      console.log(`   포인트: ${data.pointBalance || data.point || 0}`);
      
      // 특정 관리자 계정 확인
      if (doc.id === 'TVQTUGzParcYqdSwcXHw90YCgTS2') {
        console.log('   🔴 관리자 계정 확인됨!');
      }
    });
    
    // 통계
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const activeUsers = users.filter(user => user.status === 'active' || !user.status);
    const adminUsers = users.filter(user => user.role === 'admin');
    
    console.log('\n📈 통계:');
    console.log(`   활성 사용자: ${activeUsers.length}`);
    console.log(`   관리자: ${adminUsers.length}`);
    console.log(`   총 포인트: ${users.reduce((sum, user) => sum + (user.pointBalance || user.point || 0), 0)}`);
    
  } catch (error) {
    console.error('❌ 사용자 데이터 조회 실패:', error);
  }
}

checkUsersCollection();
