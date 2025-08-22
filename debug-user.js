const admin = require('firebase-admin');

// Firebase Admin SDK 초기화 (Firebase CLI 환경에서 자동 인증)
admin.initializeApp({
  projectId: 'hebimall'
});

const db = admin.firestore();

async function checkUserData() {
  try {
    console.log('사용자 문서 확인 중...');
    const usersSnapshot = await db.collection('users').limit(5).get();
    
    if (usersSnapshot.empty) {
      console.log('사용자 문서가 없습니다.');
      return;
    }
    
    console.log(`총 ${usersSnapshot.size}개의 사용자 문서 발견:`);
    
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log('---');
      console.log('사용자 ID:', doc.id);
      console.log('이메일:', data.email || '설정되지 않음');
      console.log('이름:', data.name || '설정되지 않음');
      console.log('포인트 잔액:', data.pointBalance !== undefined ? data.pointBalance : '설정되지 않음');
      
      // 포인트 내역도 확인
      if (data.pointBalance === undefined) {
        console.log('⚠️ 포인트 잔액이 설정되지 않음');
      }
    });
    
    console.log('---');
    console.log('완료');
    process.exit(0);
  } catch (error) {
    console.error('오류:', error);
    process.exit(1);
  }
}

checkUserData();
