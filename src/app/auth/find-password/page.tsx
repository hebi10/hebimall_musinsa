"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import useInput from "@/shared/hooks/useInput";
import { sendPasswordReset } from "@/shared/libs/firebase/auth";
import { getErrorMessage } from "@/shared/utils/authErrorMessages";

export default function FindPasswordPage() {
  const router = useRouter();
  const [values, onChange] = useInput({
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!values.email) {
      setError("이메일을 입력해주세요.");
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      await sendPasswordReset(values.email);
      setSuccess(true);
    } catch (err: any) {
      console.error("Password reset failed:", err);
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>✅</div>
            <h2 className={styles.successTitle}>이메일을 전송했습니다</h2>
            <div className={styles.successMessage}>
              <p>
                <strong>{values.email}</strong>으로 비밀번호 재설정 링크를 전송했습니다.
              </p>
              <p>
                이메일을 확인하고 링크를 클릭하여 새로운 비밀번호를 설정해주세요.
              </p>
              <p className={styles.note}>
                이메일이 도착하지 않았다면 스팸 폴더를 확인해주세요.
              </p>
            </div>
            <div className={styles.actionButtons}>
              <Link href="/auth/login" className={styles.loginButton}>
                로그인으로 돌아가기
              </Link>
              <button 
                onClick={() => {
                  setSuccess(false);
                  setError(null);
                }}
                className={styles.retryButton}
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>비밀번호 찾기</h2>
          <p className={styles.subtitle}>
            가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
          </p>
        </div>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              이메일 주소
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="example@hebimall.com"
              required
              value={values.email}
              onChange={onChange}
              className={styles.input}
              disabled={isSubmitting}
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting || !values.email}
          >
            {isSubmitting ? "전송 중..." : "비밀번호 재설정 링크 전송"}
          </button>
        </form>
        
        <div className={styles.footer}>
          <span className={styles.footerText}>계정이 기억나셨나요?</span>
          <Link href="/auth/login" className={styles.loginLink}>
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
