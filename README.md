````markdown
# 🛍️ STYNA - 종합 이커머스 플랫폼

최신 기술 스택을 활용한 무신사 스타일의 패션 이커머스 플랫폼입니다.

## 🎯 프로젝트 특징

- **현대적 아키텍처**: Next.js 15 App Router 기반의 최신 웹 애플리케이션
- **타입 안정성**: TypeScript로 전체 코드베이스 작성
- **실시간 데이터**: Firebase Firestore를 활용한 실시간 데이터 동기화
- **완전한 기능**: 실제 운영 가능한 수준의 완성도 높은 이커머스 기능
- **반응형 디자인**: 모든 기기에서 최적화된 사용자 경험

## 🏗️ 기술 스택

### 🖥️ Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: CSS Modules
- **State Management**: React Context API + TanStack Query
- **UI/UX**: 모던 그라디언트 디자인, 완전 반응형

### ⚡ Backend & Infrastructure
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Functions**: Firebase Functions (TypeScript)
- **Real-time**: Firebase Real-time Updates

### � Development Tools
- **Package Manager**: npm
- **Build Tool**: Next.js built-in (Turbopack)
- **Type Checking**: TypeScript
- **Code Quality**: ESLint

## 📁 프로젝트 구조

### 🎯 최적화된 App Router 구조
```
src/
├── app/                      # Next.js App Router
│   ├── admin/               # 관리자 전용 레이아웃
│   │   ├── layout.tsx       # 사이드바 + 네비게이션
│   │   ├── page.tsx         # 📊 관리자 대시보드
│   │   ├── dashboard/       # 대시보드 세부 기능
│   │   │   ├── users/       # 👥 사용자 관리
│   │   │   ├── products/    # 📦 상품 관리
│   │   │   └── orders/      # 🛒 주문 관리
│   │   ├── categories/      # 📂 카테고리 관리
│   │   ├── events/          # 🎉 이벤트 관리
│   │   ├── coupons/         # 🎫 쿠폰 관리
│   │   ├── qna/             # 💬 QnA 관리
│   │   └── reviews/         # ⭐ 리뷰 관리
│   ├── auth/                # 인증 전용 레이아웃
│   │   ├── layout.tsx       # 중앙 정렬 카드 스타일
│   │   ├── login/           # 로그인
│   │   ├── signup/          # 회원가입
│   │   ├── find-email/      # 이메일 찾기
│   │   ├── find-password/   # 비밀번호 찾기
│   │   └── reset-password/  # 비밀번호 재설정
│   ├── mypage/              # 마이페이지
│   │   ├── page.tsx         # 개인정보 대시보드
│   │   ├── coupons/         # 보유 쿠폰 관리
│   │   ├── orders/          # 주문 내역
│   │   └── qa/              # 문의 내역
│   ├── products/            # 상품 관련
│   │   └── [id]/            # 상품 상세 페이지
│   ├── categories/          # 카테고리별 상품
│   ├── cart/                # 장바구니
│   ├── orders/              # 주문 프로세스
│   ├── search/              # 통합 검색
│   ├── events/              # 이벤트 페이지
│   ├── reviews/             # 리뷰 시스템
│   ├── qna/                 # QnA 시스템
│   │   ├── page.tsx         # QnA 목록
│   │   └── write/           # QnA 작성
│   ├── recommend/           # 추천 상품
│   └── support/             # 고객지원
├── context/                 # React Context Providers
│   ├── authProvider.tsx     # 인증 상태 관리
│   ├── productProvider.tsx  # 상품 데이터 관리
│   ├── categoryProvider.tsx # 카테고리 관리
│   ├── couponProvider.tsx   # 쿠폰 시스템
│   ├── eventProvider.tsx    # 이벤트 관리
│   ├── reviewProvider.tsx   # 리뷰 시스템
│   └── pointProvider.tsx    # 포인트 시스템
├── shared/                  # 공통 모듈
│   ├── types/               # TypeScript 타입 정의
│   ├── services/            # Firebase 서비스 레이어
│   ├── hooks/               # 커스텀 React Hooks
│   ├── utils/               # 유틸리티 함수
│   ├── constants/           # 상수 정의
│   └── libs/                # 외부 라이브러리 설정
└── mocks/                   # 개발용 목 데이터
```

## 🚀 주요 기능

### 👤 사용자 기능
- **회원 관리**: 회원가입, 로그인, 소셜 로그인, 비밀번호 찾기
- **상품 관리**: 상품 조회, 검색, 필터링, 상세 정보
- **장바구니**: 실시간 장바구니, 수량 조절, 옵션 선택
- **주문 관리**: 주문 생성, 결제, 배송 추적, 주문 내역
- **마이페이지**: 개인정보 수정, 주문 내역, 쿠폰 관리
- **리뷰 시스템**: 상품 리뷰 작성, 평점, 이미지 업로드
- **QnA 시스템**: 1:1 문의, 상품 문의, 실시간 답변
- **쿠폰 시스템**: 쿠폰 발급, 사용, 할인 적용

### 🛠️ 관리자 기능
- **대시보드**: 매출 통계, 실시간 현황, 데이터 시각화
- **사용자 관리**: 회원 조회, 권한 관리, 상태 변경
- **상품 관리**: 상품 등록, 수정, 삭제, 재고 관리
- **주문 관리**: 주문 처리, 배송 관리, 환불 처리
- **카테고리 관리**: 카테고리 구조 관리, 메뉴 설정
- **이벤트 관리**: 프로모션 생성, 기간 설정, 참여자 관리
- **쿠폰 관리**: 쿠폰 생성, 발급 조건, 사용 통계
- **QnA 관리**: 문의 답변, 상태 관리, 통계
- **리뷰 관리**: 리뷰 승인, 부적절 리뷰 관리

### 🎯 고급 기능
- **실시간 데이터**: Firebase를 통한 실시간 업데이트
- **검색 시스템**: 다중 조건 검색, 자동 완성
- **추천 시스템**: 개인화 상품 추천
- **포인트 시스템**: 적립, 사용, 내역 관리
- **이벤트 시스템**: 다양한 프로모션 지원
- **알림 시스템**: 주문 상태, 이벤트 알림

## 📊 데이터베이스 구조

### Firebase Firestore Collections
```
📁 users/                    # 사용자 정보
📁 products/                 # 상품 정보
📁 categories/               # 카테고리 정보
📁 orders/                   # 주문 정보
📁 reviews/                  # 리뷰 정보
📁 qna/                      # QnA 문의
📁 coupons/                  # 쿠폰 마스터
📁 user_coupons/             # 사용자 쿠폰
📁 events/                   # 이벤트 정보
📁 cart/                     # 장바구니 정보
📁 points/                   # 포인트 내역
```

## 🚀 시작하기

### 📋 요구사항
- Node.js 18+ 
- npm 또는 yarn
- Firebase 프로젝트

### ⚙️ 설치 및 설정

1. **저장소 클론**
```bash
git clone <repository-url>
cd hebimall
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
```bash
# .env.local 파일 생성
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **Firebase 설정**
```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login

# Firestore 인덱스 배포
firebase deploy --only firestore:indexes
```

5. **시드 데이터 생성**
```bash
# 카테고리 데이터
npm run seed:categories

# 사용자 데이터  
npm run seed:users

# 쿠폰 데이터
npm run seed:coupons

# QnA 데이터
node scripts/seed-qna-simple.js
```

6. **개발 서버 실행**
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 🏗️ 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 🎨 UI/UX 디자인

- **디자인 시스템**: 모던 그라디언트 기반
- **컬러 팔레트**: Purple-Blue 그라디언트 메인
- **타이포그래피**: 시스템 폰트 기반 가독성 최적화
- **반응형**: Mobile-First 설계
- **애니메이션**: CSS 기반 부드러운 트랜지션

## 🔐 보안 기능

- **Firebase Security Rules**: 데이터 접근 제어
- **사용자 인증**: 이메일/비밀번호, 소셜 로그인
- **권한 관리**: 사용자/관리자 역할 구분
- **데이터 검증**: 클라이언트/서버 양방향 검증

## 📈 성능 최적화

- **코드 분할**: Next.js 자동 코드 스플리팅
- **이미지 최적화**: Next.js Image 컴포넌트
- **캐싱**: TanStack Query를 통한 스마트 캐싱
- **번들 최적화**: Tree-shaking, 미사용 코드 제거

## 🧪 테스트

```bash
# 린팅
npm run lint

# 타입 체크
npx tsc --noEmit
```

## 📱 모바일 지원

- **PWA 준비**: 모바일 앱 수준의 사용자 경험
- **터치 최적화**: 모바일 터치 인터페이스 최적화
- **성능**: 모바일 네트워크 환경 고려

## 🔧 주요 스크립트

```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run lint         # ESLint 실행
npm run seed         # 기본 시드 데이터 생성
```

## 📞 지원

- **이슈 보고**: GitHub Issues
- **문의**: 프로젝트 담당자 연락
- **문서**: 코드 내 주석 및 타입 정의 참조

## 🏆 프로젝트 성과

- ✅ **완전한 이커머스 시스템**: 실제 운영 가능한 모든 기능 구현
- ✅ **현대적 기술 스택**: 최신 웹 개발 기술 적용
- ✅ **확장 가능한 아키텍처**: 기능 추가 및 유지보수 용이
- ✅ **실무 수준 코드 품질**: TypeScript, 모듈화, 재사용성
- ✅ **사용자 경험 최적화**: 반응형, 성능, 접근성

---

**STYNA**은 현대적인 웹 기술을 활용하여 구축된 완전한 이커머스 플랫폼으로, 실제 운영 환경에서 사용할 수 있는 수준의 기능과 안정성을 제공합니다.
````

### ✅ 주요 개선사항

1. **의미 없는 그룹 폴더 제거**
   - `(admin)`, `(user)`, `(shop)`, `(support)` 제거
   - 단순히 `{children}`만 반환하던 불필요한 레이아웃 제거

2. **의미있는 레이아웃으로 개선**
   - **관리자 레이아웃**: 사이드바, 네비게이션, 헤더 포함
   - **인증 레이아웃**: 중앙 정렬된 카드 스타일 레이아웃

3. **URL 구조 단순화**
   - `/shop/main/recommend` → `/recommend`
   - `/user/auth/login` → `/auth/login`
   - `/admin/admin` → `/admin`

4. **실무 베스트 프랙티스 적용**
   - 깊이 3단계 이하로 제한
   - 기능별 명확한 분리
   - URL과 폴더 구조 일치

### 🔧 기술 스택
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules
- **State**: React Hooks

### 📱 주요 기능
- 상품 조회 및 검색
- 장바구니 및 주문 관리
- 사용자 인증 및 마이페이지
- 관리자 대시보드
- 고객지원 시스템

## 🚀 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
