"use client";

import { useState } from 'react';
import { useNotices } from '@/shared/hooks/useSiteContent';
import styles from './page.module.css';

const ITEMS_PER_PAGE = 5;

export default function NoticeListPage() {
  const { data: notices = [], isLoading: loading, error } = useNotices();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openItems, setOpenItems] = useState<string[]>([]);

  const filteredNotices = notices.filter((notice) => {
    const keyword = searchTerm.toLowerCase();
    return notice.title.toLowerCase().includes(keyword) || notice.content.toLowerCase().includes(keyword);
  });

  const totalPages = Math.ceil(filteredNotices.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedNotices = filteredNotices.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setOpenItems([]);
  };

  return (
    <div className={styles.noticeContainer}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="공지사항을 검색해보세요..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.noticeList}>
        {loading && <div className={styles.noResults}>공지사항을 불러오는 중입니다.</div>}
        {error && <div className={styles.noResults}>공지사항을 불러오지 못했습니다.</div>}
        {!loading && !error && paginatedNotices.length > 0 && paginatedNotices.map((notice) => (
          <div key={notice.id} className={styles.noticeItem} onClick={() => toggleItem(notice.id)}>
            <div className={styles.noticeHeader}>
              <div className={styles.noticeTitle}>
                {notice.important && <span className={styles.important}>중요</span>}
                {notice.title}
              </div>
              <div className={styles.noticeDate}>{notice.date}</div>
            </div>
            {!openItems.includes(notice.id) && (
              <div className={styles.noticePreview}>{notice.content.substring(0, 100)}...</div>
            )}
            {openItems.includes(notice.id) && (
              <div className={styles.noticeContent}>
                {notice.content.split('\n').map((line, index) => <div key={index}>{line}</div>)}
              </div>
            )}
          </div>
        ))}
        {!loading && !error && paginatedNotices.length === 0 && (
          <div className={styles.noResults}>검색 결과가 없습니다.</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageButton} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            이전
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button key={page} className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`} onClick={() => handlePageChange(page)}>
              {page}
            </button>
          ))}
          <button className={styles.pageButton} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            다음
          </button>
        </div>
      )}
    </div>
  );
}
