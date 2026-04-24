// Firebase 실시간 QnA 모니터링 스크립트
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, onSnapshot, query, orderBy } = require('firebase/firestore');

// 환경변수에서 Firebase 설정 읽기
require('dotenv').config({ path: '../.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔥 Firebase QnA 실시간 모니터링 시작...');
console.log('QnA 컬렉션의 변경사항을 실시간으로 감지합니다.');
console.log('새로운 QnA가 추가되거나 수정되면 즉시 표시됩니다.');
console.log('종료하려면 Ctrl+C를 누르세요.\n');

// QnA 컬렉션 실시간 감지
const qnaRef = collection(db, 'qna');
const q = query(qnaRef, orderBy('createdAt', 'desc'));

const unsubscribe = onSnapshot(q, (snapshot) => {
  console.log(`총 ${snapshot.size}개의 QnA가 있습니다.`);
  
  if (snapshot.size === 0) {
    console.log('📝 아직 QnA가 없습니다. 새로운 QnA를 작성해보세요!');
    return;
  }
  
  snapshot.docChanges().forEach((change) => {
    const data = change.doc.data();
    const timestamp = new Date().toLocaleString('ko-KR');
    
    if (change.type === 'added') {
      console.log(`\n✅ [${timestamp}] 새로운 QnA가 추가되었습니다!`);
      console.log(`   ID: ${change.doc.id}`);
      console.log(`   제목: ${data.title}`);
      console.log(`   작성자: ${data.userName} (${data.userId})`);
      console.log(`   카테고리: ${data.category}`);
      console.log(`   생성일: ${data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString('ko-KR') : '처리 중...'}`);
    }
    
    if (change.type === 'modified') {
      console.log(`\n🔄 [${timestamp}] QnA가 수정되었습니다.`);
      console.log(`   ID: ${change.doc.id}`);
      console.log(`   제목: ${data.title}`);
    }
    
    if (change.type === 'removed') {
      console.log(`\n❌ [${timestamp}] QnA가 삭제되었습니다.`);
      console.log(`   ID: ${change.doc.id}`);
    }
  });
  
  console.log('\n--- 현재 QnA 목록 ---');
  snapshot.docs.forEach((doc, index) => {
    const data = doc.data();
  });
  console.log('----------------------\n');
}, (error) => {
  console.error('❌ 실시간 감지 중 오류 발생:', error);
});

// 프로세스 종료 시 정리
process.on('SIGINT', () => {
  console.log('\n🛑 모니터링을 종료합니다...');
  unsubscribe();
  process.exit(0);
});
