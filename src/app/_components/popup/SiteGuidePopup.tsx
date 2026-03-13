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

  const designPoints = [
    {
      title: 'Next.js App Router',
      desc: '페이지별 렌더링 전략을 분리하고 중첩 레이아웃으로 공통 UI를 관리합니다',
    },
    {
      title: 'TanStack Query 캐싱',
      desc: 'staleTime/gcTime 기반 캐시 정책을 설정하고 useInfiniteQuery로 상품 목록을 페이지네이션합니다',
    },
    {
      title: 'Firestore 복합 인덱스',
      desc: '카테고리+정렬 조합 쿼리를 위해 인덱스를 사전 정의했습니다',
    },
    {
      title: '리뷰 시딩 및 트랜잭션',
      desc: 'batch write로 데이터를 삽입하고 트랜잭션으로 평점 집계 일관성을 유지합니다',
    },
    {
      title: 'GPT API 상담 챗봇',
      desc: '우측 하단 채팅 버튼에서 상담 가능하며 스트리밍 응답을 처리합니다',
    },
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className={styles.header}>
          <div className={styles.logoSection}>
            <h2>STYNA</h2>
            <span className={styles.subtitle}>프로젝트 구조 안내</span>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {/* 메인 컨텐츠 */}
        <div className={styles.content}>
          {/* 프로젝트 한 줄 요약 */}
          <div className={styles.summary}>
            <p className={styles.summaryText}>
              Next.js App Router + Firebase 기반 이커머스 프로젝트
            </p>
            <p className={styles.summarySubtext}>
              상품 조회부터 주문, 관리자 대시보드까지 주요 흐름을 구현한 포트폴리오입니다.
            </p>
          </div>

          {/* 핵심 설계 포인트 */}
          <div className={styles.designSection}>
            <h3 className={styles.sectionTitle}>구현 포인트</h3>
            <ul className={styles.designList}>
              {designPoints.map((point, index) => (
                <li key={index} className={styles.designItem}>
                  <span className={styles.itemTitle}>{point.title}</span>
                  <span className={styles.itemDesc}>{point.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 참고 사항 */}
          <div className={styles.notice}>
            <p>
              관리자 페이지는 로그인 후 우측 상단에서 접근 가능합니다.
              <br />
              설정 변경은 실제 데이터에 반영되므로 열람만 부탁드립니다.
            </p>
          </div>
        </div>

        {/* 링크 버튼 */}
        <div className={styles.linkSection}>
          <Link
            href="https://github.com/hebi10/hebimall_musinsa"
            target="_blank"
            className={styles.linkButton}
          >
            GitHub Repository
          </Link>
          <Link
            href="https://hebi10.notion.site/HEBI-MALL-24f8b702e1b8805db701c2316bcd42bf?pvs=74"
            target="_blank"
            className={styles.linkButtonPrimary}
          >
            설계 문서 (Notion)
          </Link>
        </div>

        {/* 하단 액션 */}
        <div className={styles.footer}>
          <button className={styles.dontShowButton} onClick={onDontShowAgain}>
            1주일간 표시 안 함
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