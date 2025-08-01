"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function NoticeListPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 10;

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'important', name: '중요공지' },
    { id: 'general', name: '일반공지' },
    { id: 'event', name: '이벤트' },
    { id: 'update', name: '업데이트' }
  ];

  const noticeData = [
    {
      id: '1',
      category: 'important',
      title: '[중요] 개인정보처리방침 개정 안내',
      preview: '개인정보보호법 개정에 따라 개인정보처리방침이 변경되었습니다.',
      date: '2024-01-20',
      views: 1250,
      isImportant: true
    },
    {
      id: '2',
      category: 'event',
      title: '신규 회원 가입 이벤트 진행 안내',
      preview: '신규 회원 가입 시 10% 할인 쿠폰과 적립금을 드립니다.',
      date: '2024-01-18',
      views: 892,
      isImportant: false
    },
    {
      id: '3',
      category: 'general',
      title: '설날 연휴 배송/CS 운영 안내',
      preview: '설날 연휴 기간 중 배송 및 고객센터 운영 일정을 안내드립니다.',
      date: '2024-01-15',
      views: 756,
      isImportant: false
    },
    {
      id: '4',
      category: 'update',
      title: '모바일 앱 업데이트 안내 (v2.1.0)',
      preview: '새로운 기능과 개선사항이 포함된 앱 업데이트가 배포되었습니다.',
      date: '2024-01-12',
      views: 623,
      isImportant: false
    },
    {
      id: '5',
      category: 'important',
      title: '[긴급] 서버 점검 안내',
      preview: '2024년 1월 10일 새벽 2시-6시 서버 점검이 진행됩니다.',
      date: '2024-01-08',
      views: 1456,
      isImportant: true
    },
    {
      id: '6',
      category: 'event',
      title: '겨울 세일 이벤트 마감 임박!',
      preview: '최대 70% 할인 겨울 세일 이벤트가 곧 마감됩니다.',
      date: '2024-01-05',
      views: 1089,
      isImportant: false
    },
    {
      id: '7',
      category: 'general',
      title: '새로운 브랜드 입점 안내',
      preview: '인기 브랜드들이 새롭게 HEBIMALL에 입점했습니다.',
      date: '2024-01-03',
      views: 534,
      isImportant: false
    },
    {
      id: '8',
      category: 'update',
      title: '웹사이트 UI/UX 개선 안내',
      preview: '더 나은 쇼핑 경험을 위해 웹사이트가 새롭게 단장했습니다.',
      date: '2024-01-01',
      views: 687,
      isImportant: false
    }
  ];

  const filteredNotices = noticeData.filter(notice => {
    const matchesCategory = activeCategory === 'all' || notice.category === activeCategory;
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.preview.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentNotices = filteredNotices.slice(startIndex, startIndex + itemsPerPage);

  const getBadgeType = (category: string) => {
    switch (category) {
      case 'important': return 'important';
      case 'event': return 'event';
      default: return 'general';
    }
  };

  const getCategoryName = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.name : '일반공지';
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>공지사항</h1>
          <p className={styles.pageDescription}>
            HEBIMALL의 최신 소식과 중요한 공지를 확인하세요
          </p>
        </div>

        {/* 필터 섹션 */}
        <div className={styles.filterSection}>
          {/* 카테고리 탭 */}
          <div className={styles.categoryTabs}>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  setCurrentPage(1);
                }}
                className={`${styles.categoryTab} ${
                  activeCategory === category.id ? styles.active : ''
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* 검색박스 */}
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="공지사항 검색..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={styles.searchInput}
            />
            <span className={styles.searchIcon}>🔍</span>
          </div>
        </div>

        {/* 공지사항 목록 */}
        {currentNotices.length > 0 ? (
          <div className={styles.noticeGrid}>
            {currentNotices.map(notice => (
              <Link
                key={notice.id}
                href={`/cs/notice/${notice.id}`}
                className={`${styles.noticeItem} ${
                  notice.isImportant ? styles.important : ''
                }`}
              >
                <div className={styles.noticeContent}>
                  <div className={styles.noticeLeft}>
                    <div className={`${styles.noticeBadge} ${styles[getBadgeType(notice.category)]}`}>
                      {getCategoryName(notice.category)}
                    </div>
                    <h3 className={styles.noticeTitle}>
                      {notice.title}
                    </h3>
                    <p className={styles.noticePreview}>
                      {notice.preview}
                    </p>
                  </div>
                  <div className={styles.noticeRight}>
                    <span className={styles.noticeDate}>
                      {notice.date}
                    </span>
                    <span className={styles.viewCount}>
                      👁 {notice.views.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h2 className={styles.emptyTitle}>검색 결과가 없습니다</h2>
            <p className={styles.emptyDescription}>
              다른 검색어나 카테고리를 선택해보세요.
            </p>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={styles.pageButton}
            >
              ◀
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`${styles.pageButton} ${
                  currentPage === page ? styles.active : ''
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={styles.pageButton}
            >
              ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
