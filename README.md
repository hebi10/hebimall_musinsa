# 🛍️ HEBIMALL - E-commerce Platform

무신사 스타일의 패션 이커머스 플랫폼입니다.

## 📁 개선된 프로젝트 구조

### 🎯 플랫한 App Router 구조
```
src/app/
├── admin/                  # 관리자 패널 (전용 레이아웃)
│   ├── layout.tsx         # 사이드바와 헤더가 있는 관리자 레이아웃
│   ├── page.tsx           # 관리자 대시보드
│   ├── users/             # 사용자 관리
│   ├── products/          # 상품 관리
│   └── orders/            # 주문 관리
├── auth/                   # 인증 (전용 레이아웃)
│   ├── layout.tsx         # 중앙 정렬된 인증 레이아웃
│   ├── login/             # 로그인
│   ├── signup/            # 회원가입
│   └── find-password/     # 비밀번호 찾기
├── mypage/                # 마이페이지
├── products/              # 상품 페이지
├── categories/            # 카테고리
├── cart/                  # 장바구니
├── search/                # 검색
├── recommend/             # 추천 (새로운 위치)
└── support/               # 고객지원
```

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
   - `/admin/admin/dashboard` → `/admin`

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
