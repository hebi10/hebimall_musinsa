'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    Kakao: any;
  }
}

interface KakaoShareButtonProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  webUrl?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function KakaoShareButton({
  title = 'HEBIMALL - 깔끔한 스타일 쇼핑몰',
  description = '최신 패션 트렌드를 만나보세요',
  imageUrl = '/thum.png',
  webUrl = window?.location?.href || 'https://hebimall.web.app',
  className = '',
  children
}: KakaoShareButtonProps) {
  
  useEffect(() => {
    // 카카오 SDK 로드
    if (!document.getElementById('kakao-sdk')) {
      const script = document.createElement('script');
      script.id = 'kakao-sdk';
      script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
      script.async = true;
      script.onload = () => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          // 실제 카카오 개발자센터에서 발급받은 JavaScript 키로 교체 필요
          window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY || 'YOUR_KAKAO_JS_KEY');
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  const handleKakaoShare = () => {
    if (!window.Kakao) {
      alert('카카오톡 공유 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const fullImageUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `${window.location.origin}${imageUrl}`;

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: title,
        description: description,
        imageUrl: fullImageUrl,
        link: {
          mobileWebUrl: webUrl,
          webUrl: webUrl,
        },
      },
      buttons: [
        {
          title: '웹으로 보기',
          link: {
            mobileWebUrl: webUrl,
            webUrl: webUrl,
          },
        },
      ],
    });
  };

  return (
    <button
      onClick={handleKakaoShare}
      className={`kakao-share-button ${className}`}
      style={{
        backgroundColor: '#FEE500',
        color: '#000000',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        ...(!children && {
          minWidth: '120px',
          justifyContent: 'center',
        })
      }}
    >
      {children || (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
          </svg>
          카카오톡 공유
        </>
      )}
    </button>
  );
}