const admin = require('firebase-admin');

// Firebase Admin SDK 초기화
admin.initializeApp({
  projectId: 'hebimall'
});

const db = admin.firestore();

async function initializeUserPoints() {
  try {
    console.log('사용자 포인트 초기화 시작...');
    
    const usersSnapshot = await db.collection('users').get();
    console.log(`총 ${usersSnapshot.size}개의 사용자 문서 발견`);
    
    const batch = db.batch();
    let updateCount = 0;
    
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      
      // pointBalance가 설정되지 않은 경우만 업데이트
      if (data.pointBalance === undefined || data.pointBalance === null) {
        console.log(`사용자 ${doc.id}의 포인트 잔액 초기화 (0으로 설정)`);
        batch.update(doc.ref, { pointBalance: 0 });
        updateCount++;
      } else {
        console.log(`사용자 ${doc.id}의 포인트 잔액 이미 설정됨: ${data.pointBalance}`);
      }
    });
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`${updateCount}명의 사용자 포인트 잔액을 초기화했습니다.`);
    } else {
      console.log('업데이트가 필요한 사용자가 없습니다.');
    }
    
    console.log('완료');
    process.exit(0);
  } catch (error) {
    console.error('오류:', error);
    process.exit(1);
  }
}

initializeUserPoints();
