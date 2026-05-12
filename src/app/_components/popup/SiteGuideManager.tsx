'use client';

import React, { useState, useEffect } from 'react';
import SiteGuidePopup from './SiteGuidePopup';
import styles from './SiteGuideManager.module.css';

const SiteGuideManager: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // 클라이언트 사이드에서만 실행
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleClosePopup = () => {
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
      <button
        className={styles.fixedButton}
        onClick={handleOpenPopup}
        aria-label="쇼핑 안내 열기"
        title="쇼핑 안내"
      >
        <span className={styles.buttonText}>쇼핑 안내</span>
      </button>

      {/* 팝업 */}
      <SiteGuidePopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
      />
    </>
  );
};

export default SiteGuideManager;
