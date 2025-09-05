/**
 * SSR 안전한 날짜 포맷팅 유틸리티
 */

// 간단한 날짜 포맷터 (YYYY.MM.DD 형식)
export const formatDate = (date: Date | string): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}.${month}.${day}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
};

// 시간 포함 포맷터 (YYYY.MM.DD HH:mm 형식)
export const formatDateTime = (date: Date | string): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return '-';
  }
};

// 상대적 시간 표시 (방금, 몇 분 전, 몇 시간 전, 몇 일 전)
export const formatRelativeTime = (date: Date | string): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';
    
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return '방금';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 30) return `${diffDays}일 전`;
    
    // 30일 이상이면 날짜 표시
    return formatDate(d);
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return '-';
  }
};

// 숫자 콤마 포맷터 (가격 표시용)
export const formatPrice = (price: number): string => {
  try {
    return price.toLocaleString('ko-KR');
  } catch (error) {
    console.error('Price formatting error:', error);
    return String(price);
  }
};

// SSR 안전한 날짜 포맷터 훅
export const useSafeDate = () => {
  const formatSafeDate = (date: Date | string): string => {
    if (typeof window === 'undefined') {
      // 서버에서는 간단한 형식 사용
      return formatDate(date);
    }
    
    // 클라이언트에서는 로케일 사용 가능
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString('ko-KR');
    } catch {
      return formatDate(date);
    }
  };

  const formatSafeDateTime = (date: Date | string): string => {
    if (typeof window === 'undefined') {
      // 서버에서는 간단한 형식 사용
      return formatDateTime(date);
    }
    
    // 클라이언트에서는 로케일 사용 가능
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleString('ko-KR');
    } catch {
      return formatDateTime(date);
    }
  };

  return {
    formatSafeDate,
    formatSafeDateTime,
    formatRelativeTime,
    formatPrice
  };
};
