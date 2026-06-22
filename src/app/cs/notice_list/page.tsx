"use client";

import { useState } from 'react';
import styles from './page.module.css';

interface Notice {
  id: number;
  title: string;
  content: string;
  date: string;
  important: boolean;
}

const noticeData: Notice[] = [
  {
    id: 1,
    title: "[중요] 개인정보처리방침 개정 안내",
    content: "개인정보처리방침이 2025년 1월 1일부로 개정됩니다. 주요 변경사항은 다음과 같습니다.\n\n1. 개인정보 수집·이용 목적 명확화\n2. 개인정보 보유·이용기간 조정\n3. 개인정보 제3자 제공 관련 내용 추가\n\n자세한 내용은 개인정보처리방침 페이지에서 확인하실 수 있습니다.",
    date: "2024-12-20",
    important: true
  },
  {
    id: 2,
    title: "2025년 설날 연휴 배송 및 고객센터 운영 안내",
    content: "2025년 설날 연휴 기간 동안의 배송 및 고객센터 운영 일정을 안내드립니다.\n\n■ 연휴 기간: 2025년 1월 28일(화) ~ 1월 30일(목)\n■ 배송 중단: 1월 29일(수) ~ 1월 30일(목)\n■ 고객센터 휴무: 1월 29일(수)\n\n연휴 기간 중 주문하신 상품은 1월 31일(금)부터 순차 발송됩니다.",
    date: "2024-12-15",
    important: false
  },
  {
    id: 3,
    title: "신상품 카테고리 업데이트 안내",
    content: "신상품 영역에 의류, 가방, 액세서리 카테고리 상품이 추가되었습니다.\n\n■ 업데이트 항목\n- 의류: 아우터와 니트 상품\n- 가방: 데일리백과 미니백\n- 액세서리: 머플러와 주얼리 상품\n\n카테고리와 신상품 메뉴에서 업데이트된 상품을 확인하실 수 있습니다.",
    date: "2024-12-10",
    important: false
  },
  {
    id: 4,
    title: "배송비 정책 변경 안내",
    content: "2025년 1월 1일부터 배송비 정책이 다음과 같이 변경됩니다.\n\n■ 변경 전: 3만원 이상 무료배송\n■ 변경 후: 5만원 이상 무료배송\n\n보다 안정적인 서비스 제공을 위한 조치이니 양해 부탁드립니다. 프리미엄 회원은 기존과 동일하게 3만원 이상 무료배송 혜택을 유지합니다.",
    date: "2024-12-05",
    important: true
  },
  {
    id: 5,
    title: "주문내역 및 배송조회 이용 안내",
    content: "회원 주문의 진행 상태는 마이페이지 주문내역에서 확인하실 수 있습니다.\n\n■ 확인 가능 항목\n- 주문 상태와 결제 금액\n- 상품별 주문 정보\n- 배송 준비 및 출고 진행 상태\n\n비회원 주문 또는 조회가 어려운 주문은 1:1 문의로 접수해 주시면 확인 후 안내드리겠습니다.",
    date: "2024-11-30",
    important: false
  }
];

const ITEMS_PER_PAGE = 5;

export default function NoticeListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openItems, setOpenItems] = useState<number[]>([]);

  const filteredNotices = noticeData.filter(notice =>
    notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredNotices.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedNotices = filteredNotices.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const toggleItem = (id: number) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
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
        {paginatedNotices.length > 0 ? (
          paginatedNotices.map((notice) => (
            <div key={notice.id} className={styles.noticeItem} onClick={() => toggleItem(notice.id)}>
              <div className={styles.noticeHeader}>
                <div className={styles.noticeTitle}>
                  {notice.important && <span className={styles.important}>중요</span>}
                  {notice.title}
                </div>
                <div className={styles.noticeDate}>{notice.date}</div>
              </div>
              {!openItems.includes(notice.id) && (
                <div className={styles.noticePreview}>
                  {notice.content.substring(0, 100)}...
                </div>
              )}
              {openItems.includes(notice.id) && (
                <div className={styles.noticeContent}>
                  {notice.content.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.noResults}>
            검색 결과가 없습니다.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
