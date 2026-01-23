/**
 * Firebase Admin Custom Claims 설정 스크립트
 * 
 * 사용법:
 * 1. Firebase CLI 로그인: firebase login
 * 2. 실행: node scripts/set-admin.js
 */

const admin = require('firebase-admin');
const path = require('path');

// 서비스 계정 키 파일 경로
// Firebase Console > 프로젝트 설정 > 서비스 계정 > 새 비공개 키 생성
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

// Firebase Admin SDK 초기화
if (!admin.apps.length) {
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'hebimall'
    });
    console.log('✅ 서비스 계정 키로 초기화 완료\n');
  } catch (error) {
    console.error('❌ 서비스 계정 키 파일을 찾을 수 없습니다!');
    console.error(`   경로: ${serviceAccountPath}\n`);
    console.error('📋 서비스 계정 키 다운로드 방법:');
    console.error('   1. Firebase Console (https://console.firebase.google.com/) 접속');
    console.error('   2. hebimall 프로젝트 선택');
    console.error('   3. ⚙️ 프로젝트 설정 클릭');
    console.error('   4. "서비스 계정" 탭 클릭');
    console.error('   5. "새 비공개 키 생성" 버튼 클릭');
    console.error('   6. 다운로드된 JSON 파일을 scripts/serviceAccountKey.json 으로 저장\n');
    process.exit(1);
  }
}

// 관리자로 설정할 UID
const ADMIN_UID = 'TVQTUGzParcYqdSwcXHw90YCgTS2';

async function setAdminClaim() {
  console.log('🔐 Firebase Admin Custom Claims 설정 시작...\n');

  try {
    // 1. 사용자 존재 여부 확인
    console.log(`📋 사용자 정보 조회 중... (UID: ${ADMIN_UID})`);
    const user = await admin.auth().getUser(ADMIN_UID);
    console.log(`   ✅ 사용자 발견: ${user.email || '(이메일 없음)'}`);
    console.log(`   📧 이메일 인증: ${user.emailVerified ? '완료' : '미완료'}`);
    console.log(`   📅 생성일: ${user.metadata.creationTime}`);
    
    // 2. 현재 Custom Claims 확인
    console.log(`\n📋 현재 Custom Claims:`, user.customClaims || '(없음)');

    // 3. Admin Claim 설정
    console.log(`\n⚙️ Admin 권한 설정 중...`);
    await admin.auth().setCustomUserClaims(ADMIN_UID, { admin: true });
    
    // 4. 설정 확인
    const updatedUser = await admin.auth().getUser(ADMIN_UID);
    console.log(`\n✅ Admin 권한이 성공적으로 설정되었습니다!`);
    console.log(`📋 새로운 Custom Claims:`, updatedUser.customClaims);

    console.log(`\n${'='.repeat(50)}`);
    console.log(`⚠️  중요: 변경사항을 적용하려면 다음 중 하나를 수행하세요:`);
    console.log(`   1. 웹사이트에서 로그아웃 후 다시 로그인`);
    console.log(`   2. 또는 브라우저 콘솔에서 다음 실행:`);
    console.log(`      await firebase.auth().currentUser.getIdToken(true)`);
    console.log(`${'='.repeat(50)}\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Admin 설정 실패:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.error('   → 해당 UID의 사용자를 찾을 수 없습니다.');
    } else if (error.code === 'auth/invalid-uid') {
      console.error('   → 유효하지 않은 UID 형식입니다.');
    } else if (error.message.includes('Could not load the default credentials')) {
      console.error('\n💡 해결 방법:');
      console.error('   1. Firebase CLI 로그인: firebase login');
      console.error('   2. 또는 서비스 계정 키 파일 사용');
    }
    
    process.exit(1);
  }
}

// 실행
setAdminClaim();
