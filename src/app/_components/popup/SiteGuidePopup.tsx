'use client';

import React, { useState, useEffect } from 'react';
import styles from './SiteGuidePopup.module.css';
import Link from 'next/link';

interface SiteGuidePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain: () => void;
}

const SiteGuidePopup: React.FC<SiteGuidePopupProps> = ({
  isOpen,
  onClose,
  onDontShowAgain,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      id: 1,
      title: "HEBIMALL에 오신 것을 환영합니다! 🎉",
      content: (
        <div className={styles.slideContent}>
          <div className={styles.heroSection}>
            <h3>🛍️ 프리미엄 포트폴리오 쇼핑몰</h3>
            <p>
              해당 사이트는 포트폴리오 사이트입니다.<br/>
              자세한 내용은 노션 문서를 참고해주세요.
            </p>
          </div>
          <div className={styles.features}>
            <Link href="https://github.com/hebi10/hebimall_musinsa" target='_blank' className={styles.feature}>
              <span className={styles.icon}>💻</span>
              <span>Github 바로가기</span>
            </Link>
            <Link href="https://www.notion.so/hebi10/HEBI-MALL-24f8b702e1b8805db701c2316bcd42bf" target='_blank' className={styles.feature}>
              <span className={styles.icon}>📄</span>
              <span>노션 문서 바로가기</span>
            </Link>
            <div className={styles.feature}>
              <span className={styles.icon}>👤</span>
              <span>sevim0104@naver.com</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "똑똑한 쇼핑 기능들 🧠",
      content: (
        <div className={styles.slideContent}>
          <div className={styles.shoppingFeatures}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>🤖</div>
              <h4>AI 실시간 상담</h4>
              <p>우측 하단의 <strong>채팅 버튼</strong>으로 상담을 시작하세요.</p>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>🔍</div>
              <h4>스마트 검색</h4>
              <p>원하는 <strong>스타일·브랜드</strong>를 빠르게 찾아보세요.</p>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>👤</div>
              <h4>맞춤형 관리</h4>
              <p>마이페이지에서 <strong>개인화된 기능</strong>을 경험하세요.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "특별한 관리자 기능 구현! 💎",
      content: (
        <div className={styles.slideContent}>
          <div className={styles.benefitsSection}>
            <div className={styles.benefit}>
              <div className={styles.benefitIcon}>🔑</div>
              <h4>관리자 로그인</h4>
              <p>우측 상단 <strong>마이페이지 옆 버튼</strong>에서 관리자 페이지에 접속할 수 있습니다.</p>
            </div>
            <div className={styles.benefit}>
              <div className={styles.benefitIcon}>👥</div>
              <h4>유저 관리</h4>
              <p>유저별 <strong>포인트 관리</strong>와 <strong>할인 쿠폰 지급</strong>을 간편하게 할 수 있습니다.</p>
            </div>
            <div className={styles.benefit}>
              <div className={styles.benefitIcon}>🛒</div>
              <h4>상품 등록 및 수정</h4>
              <p><strong>이미지, 카테고리</strong> 등 상품 정보를 자유롭게 수정할 수 있습니다.</p>
            </div>
            <div className={styles.benefit}>
              <div className={styles.benefitIcon}>💬</div>
              <h4>QnA 관리</h4>
              <p><strong>실시간 QnA 확인 및 답변</strong>이 가능합니다.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "언제든 도움을 받으세요! 🤝",
      content: (
        <div className={styles.slideContent}>
          <div className={styles.supportSection}>
            <div className={styles.supportMain}>
              <div className={styles.aiAssistant}>
                <div className={styles.aiIcon}>🤖</div>
                <h4>AI 상담원</h4>
                <p>24시간 언제든 궁금한 점을 물어보세요</p>
              </div>
            </div>
            <div className={styles.supportFeatures}>
              <div className={styles.supportItem}>
                <span className={styles.supportIcon}>📞</span>
                <span>실시간 채팅 상담</span>
              </div>
              <div className={styles.supportItem}>
                <span className={styles.supportIcon}>📧</span>
                <span>1:1 문의 시스템</span>
              </div>
              <div className={styles.supportItem}>
                <span className={styles.supportIcon}>📋</span>
                <span>자주 묻는 질문</span>
              </div>
            </div>
            <div className={styles.contactInfo}>
              <p>📍 오른쪽 하단의 채팅 버튼을 클릭하세요!</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className={styles.header}>
          <div className={styles.logoSection}>
            <h2>HEBIMALL</h2>
            <span className={styles.subtitle}>사이트 가이드</span>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {/* 슬라이드 컨테이너 */}
        <div className={styles.slideContainer}>
          <div 
            className={styles.slidesWrapper}
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div key={slide.id} className={styles.slide}>
                <div className={styles.slideHeader}>
                  <h3>{slide.title}</h3>
                </div>
                {slide.content}
              </div>
            ))}
          </div>
        </div>

        {/* 네비게이션 */}
        <div className={styles.navigation}>
          <div className={styles.slideControls}>
            <button 
              className={styles.navButton}
              onClick={prevSlide}
              disabled={currentSlide === 0}
            >
              ‹
            </button>
            
            <div className={styles.slideIndicators}>
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
            
            <button 
              className={styles.navButton}
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
            >
              ›
            </button>
          </div>

          <div className={styles.slideInfo}>
            <span>{currentSlide + 1} / {slides.length}</span>
          </div>
        </div>

        {/* 하단 액션 버튼 */}
        <div className={styles.footer}>
          <button 
            className={styles.dontShowButton}
            onClick={onDontShowAgain}
          >
            1주일간 보지 않기
          </button>
          <button 
            className={styles.closeButtonSecondary}
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteGuidePopup;