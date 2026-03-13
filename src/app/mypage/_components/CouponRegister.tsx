'use client';

import React, { useState } from 'react';
import styles from './CouponRegister.module.css';

interface CouponRegisterProps {
  onRegister: (couponCode: string) => Promise<boolean>;
}

export default function CouponRegister({ onRegister }: CouponRegisterProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setMessage({type: 'error', text: '쿠폰 코드를 입력해주세요.'});
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const success = await onRegister(couponCode.trim().toUpperCase());
      if (success) {
        setMessage({type: 'success', text: '쿠폰이 성공적으로 등록되었습니다!'});
        setCouponCode('');
      } else {
        setMessage({type: 'error', text: '유효하지 않은 쿠폰 코드이거나 이미 사용된 쿠폰입니다.'});
      }
    } catch (error) {
      setMessage({type: 'error', text: '쿠폰 등록 중 오류가 발생했습니다.'});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>쿠폰 등록</h3>
        <p>쿠폰 코드를 입력하여 할인 혜택을 받아보세요!</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="쿠폰 코드를 입력하세요 (예: WELCOME2024)"
            className={styles.input}
            disabled={isLoading}
            maxLength={20}
          />
          <button 
            type="submit" 
            className={styles.registerBtn}
            disabled={isLoading || !couponCode.trim()}
          >
            {isLoading ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </form>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <div className={styles.info}>
        <h4>쿠폰 사용 안내</h4>
        <ul>
          <li>쿠폰 코드는 대소문자를 구분하지 않습니다</li>
          <li>한 번 사용된 쿠폰은 재사용할 수 없습니다</li>
          <li>쿠폰마다 최소 주문 금액과 유효기간이 다를 수 있습니다</li>
          <li>등록된 쿠폰은 '내 쿠폰함'에서 확인할 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
}
