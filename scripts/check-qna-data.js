// Firebase 데이터 확인 스크립트
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy } = require('firebase/firestore');

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

async function checkQnAData() {
  try {
    console.log('QnA 컬렉션 데이터 확인 중...');
    
    const qnaRef = collection(db, 'qna');
    const q = query(qnaRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    console.log(`총 ${querySnapshot.size}개의 QnA 문서가 있습니다.`);
    
    if (querySnapshot.size === 0) {
      console.log('QnA 컬렉션에 데이터가 없습니다.');
      return;
    }
    
    querySnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n--- QnA ${index + 1} ---`);
      console.log(`ID: ${doc.id}`);
      console.log(`제목: ${data.title}`);
      console.log(`작성자: ${data.userName} (${data.userId})`);
      console.log(`카테고리: ${data.category}`);
      console.log(`상태: ${data.status}`);
      console.log(`생성일: ${data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt}`);
      console.log(`비밀글: ${data.isSecret ? '예' : '아니오'}`);
      if (data.answer) {
        console.log(`답변: ${data.answer.content.substring(0, 50)}...`);
      }
    });
    
  } catch (error) {
    console.error('QnA 데이터 확인 중 오류 발생:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  checkQnAData().then(() => {
    process.exit(0);
  });
}

module.exports = { checkQnAData };
