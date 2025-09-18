#!/bin/bash

# Firebase Storage CORS 설정 적용 스크립트
# 이 스크립트는 Google Cloud SDK가 설치되어 있어야 합니다.

echo "🔧 Firebase Storage CORS 설정을 적용합니다..."

# Google Cloud 인증 (필요한 경우)
# gcloud auth login

# 프로젝트 설정
PROJECT_ID="hebimall"
BUCKET_NAME="hebimall.firebasestorage.app"

echo "📡 CORS 설정 적용 중..."
gsutil cors set cors.json gs://$BUCKET_NAME

echo "✅ CORS 설정이 완료되었습니다!"
echo "📋 현재 CORS 설정 확인:"
gsutil cors get gs://$BUCKET_NAME