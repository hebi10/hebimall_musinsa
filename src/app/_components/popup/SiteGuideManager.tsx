'use client';

import React, { useState, useEffect } from 'react';
import SiteGuidePopup from './SiteGuidePopup';
import styles from './SiteGuideManager.module.css';

const STORAGE_KEY = 'hebimall_site_guide_hidden';
const HIDE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7일 (밀리초)

const SiteGuideManager: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // 클라이언트 사이드에서만 실행
  useEffect(() => {
    setIsClient(true);
    
    // 로컬스토리지에서 숨김 상태 확인
    const hiddenData = localStorage.getItem(STORAGE_KEY);
    
    if (hiddenData) {
      const { timestamp } = JSON.parse(hiddenData);
      const now = Date.now();
      
      // 7일이 지났으면 다시 표시
      if (now - timestamp > HIDE_DURATION) {
        localStorage.removeItem(STORAGE_KEY);
        setIsPopupOpen(true);
      }
    } else {
      // 처음 방문하는 경우 팝업 표시
      setIsPopupOpen(true);
    }
  }, []);

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleDontShowAgain = () => {
    const hideData = {
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hideData));
    setIsPopupOpen(false);
  };

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  // 서버 사이드 렌더링에서는 아무것도 렌더링하지 않음
  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* 고정 버튼 - AI 상담원 위에 위치 */}
      <button
        className={styles.fixedButton}
        onClick={handleOpenPopup}
        aria-label="사이트 가이드 열기"
        title="사이트 가이드"
      >
        <span className={styles.buttonText}>가이드</span>
      </button>

      {/* 팝업 */}
      <SiteGuidePopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        onDontShowAgain={handleDontShowAgain}
      />
    </>
  );
};

export default SiteGuideManager;