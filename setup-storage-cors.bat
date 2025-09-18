@echo off
echo 🔧 Firebase Storage CORS 설정을 적용합니다...

REM Google Cloud 인증 (필요한 경우)
REM gcloud auth login

REM 프로젝트 설정
set PROJECT_ID=hebimall
set BUCKET_NAME=hebimall.firebasestorage.app

echo 📡 CORS 설정 적용 중...
gsutil cors set cors.json gs://%BUCKET_NAME%

echo ✅ CORS 설정이 완료되었습니다!
echo 📋 현재 CORS 설정 확인:
gsutil cors get gs://%BUCKET_NAME%

pause