'use client';

import React from 'react';
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
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>

        {/* 헤더 */}
        <div className={styles.header}>
          <div className={styles.logoSection}>
            <h2>STYNA</h2>
            <span className={styles.subtitle}>포트폴리오 소개</span>
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>

        {/* 메인 컨텐츠 */}
        <div className={styles.content}>
          <p className={styles.intro}>
            포트폴리오용으로 제작한 이커머스 사이트입니다.
          </p>

          <ul className={styles.guideList}>
            <li>상품 탐색, 장바구니, 주문 흐름을 직접 사용해볼 수 있습니다.</li>
            <li>관리자 계정으로 로그인하면 운영 대시보드에 접근할 수 있습니다.</li>
            <li>우측 하단 채팅 버튼에서 AI 상담을 이용할 수 있습니다.</li>
          </ul>

          <p className={styles.notice}>
            관리자 기능은 실제 데이터에 반영됩니다. 열람만 부탁드립니다.
          </p>
        </div>

        {/* 외부 링크 */}
        <div className={styles.linkSection}>
          <Link
            href="https://github.com/hebi10/hebimall_musinsa"
            target="_blank"
            className={styles.linkButton}
          >
            GitHub
          </Link>
          <Link
            href="https://hebi10.notion.site/HEBI-MALL-24f8b702e1b8805db701c2316bcd42bf?pvs=74"
            target="_blank"
            className={styles.linkButtonPrimary}
          >
            설계 문서
          </Link>
        </div>

        {/* 하단 */}
        <div className={styles.footer}>
          <button className={styles.dontShowButton} onClick={onDontShowAgain}>
            오늘 하루 보지 않기
          </button>
          <button className={styles.closeButtonSecondary} onClick={onClose}>
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};

export default SiteGuidePopup;
