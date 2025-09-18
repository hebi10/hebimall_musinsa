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
    title: "신규 브랜드 입점 안내 - 2025 신춘 컬렉션",
    content: "STYNA에 새롭게 입점한 브랜드들의 2025 신춘 컬렉션을 만나보세요.\n\n■ 신규 입점 브랜드\n- FASHION NOVA: 트렌디한 캐주얼 웨어\n- URBAN STYLE: 도시적인 감성의 스트릿 패션\n- CLASSIC LINE: 클래식하고 우아한 정장 라인\n\n입점 기념 특가 이벤트도 함께 진행됩니다.",
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
    title: "스티나몰 모바일 앱 2.0 업데이트 안내",
    content: "STYNA 모바일 앱이 2.0 버전으로 업데이트되었습니다.\n\n■ 주요 개선사항\n- 더욱 빨라진 로딩 속도\n- 개선된 상품 검색 기능\n- 새로운 위시리스트 기능\n- 푸시 알림 세부 설정 기능\n\n앱스토어 및 플레이스토어에서 업데이트하시기 바랍니다.",
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
