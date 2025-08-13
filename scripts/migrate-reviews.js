// 단일 컬렉션 구조로 변경하는 마이그레이션 스크립트
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBUv3D8_Z5G7sSUCi9YvQwKgJf3NKgQYjo",
  authDomain: "hebimall.firebaseapp.com",
  projectId: "hebimall",
  storageBucket: "hebimall.firebasestorage.app",
  messagingSenderId: "461569816406",
  appId: "1:461569816406:web:3d7c59c4a9cd44f0b93b14"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateToSingleCollection() {
  try {
    console.log('리뷰를 단일 컬렉션으로 마이그레이션 시작...');
    
    const productIds = [
      '0sSJJGiI64BRgADrYNw3', '7TpTv73QB4UlHuTt38EP', 'G1m7xmydmjtooRL9F74v',
      'RnlLQSPRhcJvqLg5l2nq', 'XIBNY2olry6D8lY2bHMl', 'E390uPLbm3djmERVH9D1',
      'aImZa4TlSD2E6ytCqu9R', 'j7IDrEeVoxnH5jo3tI5Y', 'o68voh4IoCyKsovouiPm',
      'product-3'
    ];
    
    let totalMigrated = 0;
    
    for (const productId of productIds) {
      const reviewsCollection = collection(db, `reviews/${productId}/reviews`);
      const snapshot = await getDocs(reviewsCollection);
      
      for (const reviewDoc of snapshot.docs) {
        const reviewData = reviewDoc.data();
        
        // 새로운 단일 컬렉션에 저장
        const newReviewRef = doc(collection(db, 'all-reviews'));
        await setDoc(newReviewRef, {
          ...reviewData,
          originalId: reviewDoc.id // 원본 ID 보존
        });
        
        totalMigrated++;
        console.log(`마이그레이션: ${productId} - ${reviewDoc.id} ✅`);
      }
    }
    
    console.log(`🎉 마이그레이션 완료! 총 ${totalMigrated}개 리뷰 이동됨`);
    
  } catch (error) {
    console.error('마이그레이션 실패:', error);
  }
}

// 주석 해제하고 실행하면 마이그레이션됩니다
// migrateToSingleCollection();
